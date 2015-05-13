# -*- coding: utf-8 -*-

from django.contrib.auth.models import User, AnonymousUser
from django.core.urlresolvers import reverse, resolve

from tastypie.authorization import Authorization
from tastypie.exceptions import Unauthorized

from guardian.shortcuts import get_objects_for_user, get_users_with_perms

from olga.models import Page

anonymous_user = User.objects.get(pk=-1)

def get_user(bundle):
    """
    By convention, Gaurdian stores an AnonymousUser under ID -1

    If the user is not logged in, we need to explicitly state they are
    AnonymousUser, so that they get the necessary permissions.
    """
    if not hasattr(bundle.request, 'user') or isinstance(bundle.request.user, AnonymousUser):
        return anonymous_user
    else:
        return bundle.request.user

def get_serialized_perms(object, current_user_id=None, perms_to_serialize=[u'view_page', u'change_page', u'administer_page']):
    """
    Get the specified user-permission pairs for the given object.

    If passed a current_user_id, an extra field ‘current’ is added to each user-permission pair,
    that designates whether the user with the permission corresponds to the current user.
    """
    permissions = {}
    for perm in perms_to_serialize:
        permissions[perm] = []
    for user, perms in get_users_with_perms(object, attach_perms=True).iteritems():
        perms_found = set(perms_to_serialize) & set(perms)
        for perm in perms_found:
            permissions[perm].append({  'type' : 'user',
                                        'id'   : user.id,
                                        'name' : user.first_name or user.username,
                                        'uri'  : reverse('api_dispatch_detail', kwargs={'resource_name': 'user', 'api_name':'v1', 'pk': user.id }) }
            )
            if current_user_id:
                permissions[perm][-1]['current'] = current_user_id == user.id
    return permissions

def extract_perms_for_comparison(object):
    """
    Takes a serialised object as produced by get_serialized_perms and transforms it into a list
    for easy comparison
    """
    for perm, users in object.iteritems():
        for user in users:
            yield user['id'], perm

class PerUserAuthorization(Authorization):
    """
    By default, users can only request info on themselves.
    If not logged in, the AnymousUser object will be returned.
    """
    def read_list(self, object_list, bundle):
        """
        Only superusers can read the list of users
        (TODO: should be all users in the ‘editors’ group)
        """
        if get_user(bundle).id != -1:
            return object_list
        else:
            raise Unauthorized("Sorry, no user list")

    def read_detail(self, object_list, bundle):
        """
        A user can request info on herself
        """
        if get_user(bundle).id == bundle.obj.id:
            return True
        else:
            return False

    def create_list(self, object_list, bundle):
        # Currently not used in Tastypie
        raise NotImplementedError()

    def create_detail(self, object_list, bundle):
        # TODO
        raise NotImplementedError()

    def update_list(self, object_list, bundle):
        raise NotImplementedError()

    def update_detail(self, object_list, bundle):
        # TODO
        raise NotImplementedError()

    def delete_list(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")

    def delete_detail(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")


class PerPageAuthorization(Authorization):
    """
    This maps the permissions, as assigned by Django Guardian,
    to a Tastypie Authorization class. It checks if the logged in
    user (or else, the AnonymousUser) has the appropriate
    permissions to view, add or create a Page.
    """
    def read_list(self, object_list, bundle):
        pages = get_objects_for_user(get_user(bundle), 'olga.view_page')
        return pages

    def read_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('view_page', bundle.obj) or anonymous_user.has_perm('view_page', bundle.obj)

    def create_list(self, object_list, bundle):
        # Currently not used in Tastypie
        raise NotImplementedError()

    def create_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('olga.add_page')

    def update_list(self, object_list, bundle):
        pages = get_objects_for_user(get_user(bundle), 'olga.change_page')
        return pages

    def update_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('olga.change_page')

    def delete_list(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")

    def delete_detail(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")

class PerAnnotationAuthorization(Authorization):
    """
    To see if a user can see, edit and create annotations, we depend
    on the permissions the user has for the parent page.
    """
    def read_list(self, object_list, bundle):
        permitted_pages = list(get_objects_for_user(get_user(bundle), 'olga.view_page')) + list(get_objects_for_user(anonymous_user, 'olga.view_page'))
        permitted_ids = []
        for p in permitted_pages:
            permitted_ids.append(p.id)
        permitted_ids = list(set(permitted_ids))
        return object_list.filter(page__id__in=permitted_ids)

    def read_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('view_page', bundle.obj.page) or anonymous_user.has_perm('view_page', bundle.obj.page)

    def create_list(self, object_list, bundle):
        # Currently not used in Tastypie
        raise NotImplementedError()

    def create_detail(self, object_list, bundle):
        """
        Here we can not rely on bundle.obj, because the object has not been
        created yet. We will have to find it based on the submitted data.
        """
        page_url = bundle.data['page']
        url_match = resolve(page_url)
        page = Page.objects.get(slug = url_match.kwargs['slug'])
        return get_user(bundle).has_perm('change_page', page) # change page, not add page, because adding an annotation means changing a page

    def update_list(self, object_list, bundle):
        permitted_pages = [i.id for i in get_objects_for_user(get_user(bundle), 'olga.change_page')]
        return object_list.filter(page__id__in=permitted_pages)

    def update_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('change_page', bundle.obj.page)

    def delete_list(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")

    def delete_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('change_page', bundle.obj.page)
