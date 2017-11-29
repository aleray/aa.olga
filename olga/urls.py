# -*- coding: utf-8 -*-

from django.conf.urls import include, patterns, url
from tastypie.api import Api
from django.views.generic.base import TemplateView
from django.views.generic.detail import DetailView
from olga.api import SiteResource, PageResource, AnnotationResource, UserResource
from django.views.generic import RedirectView
from olga.models import Page

v1_api = Api(api_name='v1')
v1_api.register(SiteResource())
v1_api.register(AnnotationResource())
v1_api.register(PageResource())
v1_api.register(UserResource())

urlpatterns = patterns('',
    url(r'^api/v1/user/me/', 'olga.api.me'),
    url(r'^api/', include(v1_api.urls)),
    url(r'^tests/$', TemplateView.as_view(template_name='olga/tests.html'), name='tests'),
    # The following route should: A) catch everything so that the real routing can be left to Backbone
    # B) still allow for a reverse url from the pages model (that’s why the ‘slug’ match group is still there)
    #
    # We use a DetailView instead of a more simple TemplateView (as before) in
    # order to serve the annotations content in case javascript is disabled
    # (SEO).
    url(r'pages/(?P<slug>[^/]+)', DetailView.as_view(template_name='olga/page_detail.html', model=Page), name='page-detail'),
    url(r'^$', RedirectView.as_view(url='pages/Index'), name='home'),
)
