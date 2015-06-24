from django import template
from django.contrib.sites.shortcuts import get_current_site
from ..models import Page
register = template.Library()




@register.inclusion_tag('olga/partials/metadata.html', takes_context=True)
def metadata(context):
    slug = context.request.path.split('/')[-1]
    current_site = get_current_site(context.request)

    try:
        obj = Page.objects.get(slug=slug)
    except Page.DoesNotExist:
        obj = None

    return {
        "obj": obj,
        "request": context.request,
        "current_site": current_site
    }

