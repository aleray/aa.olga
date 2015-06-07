# -*- coding: utf-8 -*-

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import AnonymousUser, User
from django.contrib.sites.models import Site

from django.conf.urls import url
from django.core.urlresolvers import reverse
from django.core.validators import validate_slug
from django.core.exceptions import ValidationError

from guardian.shortcuts import assign_perm, remove_perm

from tastypie import fields
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import Authorization
from tastypie.http import HttpUnauthorized, HttpForbidden, HttpNotFound
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie.validation import Validation

from tastypie.utils import trailing_slash

from olga.models import Annotation, Page
from olga.authorization import get_user, get_serialized_perms, extract_perms_for_comparison, PerUserAuthorization, PerPageAuthorization, PerAnnotationAuthorization
from django.http import HttpResponse

import json
from django.core.serializers.json import DjangoJSONEncoder
from tastypie.serializers import Serializer

from olga.backends import backend


class PrettyJSONSerializer(Serializer):
    json_indent = 2

    def to_json(self, data, options=None):
        options = options or {}
        data = self.to_simple(data, options)
        return json.dumps(data, cls=DjangoJSONEncoder,
                sort_keys=True, ensure_ascii=False, indent=self.json_indent)

class SiteResource(ModelResource):
    class Meta:
        resource_name = 'site'
        queryset = Site.objects.all()


class UserResource(ModelResource):
    class Meta:
        resource_name = 'user'
        queryset = User.objects.all()
        excludes = ['email', 'password', 'is_active', 'is_staff', 'is_superuser']
        authorization = PerUserAuthorization()

    def prepend_urls(self):
        """
        1) + 2)
        Allow login and logout via the API

        cf. http://stackoverflow.com/questions/11770501/how-can-i-login-to-django-using-tastypie

        3)
        Allow negative primary key when requesting individual user
        (Django Guardian has the convention that there exists an AnonymousUser with id=-1)

        cf https://github.com/toastdriven/django-tastypie/pull/395/files

        """
        return [
            url(r"^(?P<resource_name>%s)/login%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('login'), name="api_login"),
            url(r'^(?P<resource_name>%s)/logout%s$' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('logout'), name='api_logout'),
            url(r"^(?P<resource_name>%s)/(?P<pk>-?\w[\w/-]*)%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('dispatch_detail'), name="api_dispatch_detail")
        ]

    def login(self, request, **kwargs):
        self.method_check(request, allowed=['post'])

        data = self.deserialize(request, request.body, format=request.META.get('CONTENT_TYPE', 'application/json'))

        username = data.get('username', '')
        password = data.get('password', '')

        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request, user)
                return self.create_response(request, {
                    'success': True
                })
            else:
                return self.create_response(request, {
                    'success': False,
                    'reason': 'disabled',
                    }, HttpForbidden )
        else:
            return self.create_response(request, {
                'success': False,
                'reason': 'incorrect',
                }, HttpUnauthorized )

    def logout(self, request, **kwargs):
        self.method_check(request, allowed=['get', 'post'])
        if request.user and request.user.is_authenticated():
            logout(request)
            return self.create_response(request, { 'success': True })


def me(request):
    """
    Shortcut that displays the information for the currently logged in user

    This can be set up at a known url so that the client-side application can
    easily access it.
    """
    if not hasattr(request, 'user') or isinstance(request.user, AnonymousUser):
        user = User.objects.get(pk=-1)
    else:
        user = request.user
    user_resource = UserResource()
    user_view = user_resource.wrap_view('dispatch_detail')
    return user_view(request, pk=user.id)


class AnnotationValidation(Validation):
    def is_valid(self, bundle, request=None):
        if not bundle.data:
            return {'__all__': 'Not quite what I had in mind.'}

        errors = {}

        if 'uuid' in bundle.data.keys():
            try:
                validate_slug(bundle.data['uuid'])
            except ValidationError:
                errors['uuid'] = ["Enter a valid 'slug' consisting of letters, numbers, underscores or hyphens."]

        return errors


class AnnotationResource(ModelResource):
    page = fields.ForeignKey('olga.api.PageResource', 'page')

    class Meta:
        queryset = Annotation.objects.all()
        resource_name = 'annotation'
        filtering = {
            "page": ALL_WITH_RELATIONS
        }
        authorization = PerAnnotationAuthorization()
        validation = AnnotationValidation()
        always_return_data = True


class PageResource(ModelResource):
    annotations = fields.ToManyField('olga.api.AnnotationResource', 'annotation_set', null=True, blank=True, full=True)

    class Meta:
        always_return_data = True           # Mainly important when creating a new Page, as the necessary permissions will
                                            # be calculated server-side and returned in the 201 created response.
        queryset = Page.objects.all()
        resource_name = 'page'
        authorization = PerPageAuthorization()
        detail_uri_name = 'slug'
        serializer = PrettyJSONSerializer()
        filtering = {
            "slug": ALL
        }

    def prepend_urls(self):
        # FIXME: the slug regex and the wikified name regex should match.
        return [
            url(r"^(?P<resource_name>%s)/(?P<slug>[\w\d%%'_.-]+)/$" % self._meta.resource_name, self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]

    def hydrate(self, bundle):
        """
        Removes the revisions field which is not stored in the model.
        """
        if 'revisions' in bundle.data:
            del bundle.data['revisions']

        return bundle

    def dehydrate(self, bundle):
        """
        Populates the revision list and permissions for the page
        """
        # FIXME: raises a GitCommandError if there is no revision yet
        try:
            bundle.data['revisions'] = backend.get_verbose_revisions('olga/Page/%s.json' % bundle.data['slug'])
        except:
            bundle.data['revisions'] = []

        current_user_id = get_user(bundle).id
        if current_user_id != -1:
            bundle.data['permissions'] = get_serialized_perms(bundle.obj, current_user_id)
        return bundle

    def obj_update(self, bundle, skip_errors=False, **kwargs):
        bundle = super(PageResource, self).obj_update(bundle, **kwargs)

        new = set(extract_perms_for_comparison(bundle.data['permissions']))
        old = set(extract_perms_for_comparison(get_serialized_perms(bundle.obj)))

        #print "old:", old
        #print "new:", new
        #print "to remove:", old - new, "to add:", new - old


        for user_id, permission in old - new:
            user = User.objects.get(pk=user_id)
            remove_perm(permission, user, bundle.obj)

        for user_id, permission in new - old:
            user = User.objects.get(pk=user_id)
            assign_perm(permission, user, bundle.obj)

        # if there is the "message" key it means we want
        # to commit
        if 'message' in bundle.data:
            # TODO: don't store the permissions?
            data = bundle.data.copy()

            msg = data['message']
            del data['message']

            for key in ('permissions', 'rev'):
                if key in data:
                    del data[key]

            try:
                #import ipdb; ipdb.set_trace()
                backend.commit('olga/Page/%s.json' % kwargs['slug'], self.serialize(None, data, 'application/json'), message=msg)
            except:
                # Main case: the content hasn't changed between two calls, and
                # git refuse to commit because of this.
                pass

        return bundle

    def obj_create(self, bundle, **kwargs):
        """
        If a new page object is created, create the necessary permissions

        cf http://stackoverflow.com/questions/10070173/tastypie-obj-create-how-to-use-newly-created-object
        """
        # 1. Create the page. If the user is Anonymous or does not have Django
        # permissions to create a page, it will throw a 401 "Insufficient
        # permissions to save" error.
        # FIXME: shouldn't throw a 404 error instead?
        bundle = super(PageResource, self).obj_create(bundle, **kwargs)

        # 2. This code is only performed if it passed the previous line without
        # 401 error (sends an immediate HttpResponse in caseof failure)
        user = get_user(bundle)
        anonymous_user = User.objects.get(pk=-1)

        assign_perm('view_page', user, bundle.obj)
        if user.id != -1:
            # if the current user is not the anonymous user
            assign_perm('view_page', anonymous_user, bundle.obj)
        assign_perm('olga.change_page', user, bundle.obj)
        assign_perm('administer_page', user, bundle.obj)

        return bundle

    def get_detail(self, request, **kwargs):
        """
        Shortcuts the whole process if a specific revision is asked by serving
        the json response directly from the repository.
        """
        rev = request.GET.get('rev')

        if rev:
            # TODO: implement caching, as done in the super get_detail method
            filename = 'olga/Page/%s.json' % kwargs['slug']
            data = backend.fetch(filename, rev)
            if not data:
                return HttpNotFound('Could not find revision %s' % rev)

            data = json.loads(data)
            data['revisions'] = backend.get_verbose_revisions(filename)
            return HttpResponse(json.dumps(data), content_type="application/json")
        else:
            return super(PageResource, self).get_detail(request, **kwargs)
