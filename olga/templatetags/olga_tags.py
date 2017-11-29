import markdown
from django import template
from django.contrib.sites.shortcuts import get_current_site
from django.utils.safestring import mark_safe
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


@register.filter
def markdownify(text):
    extensions = ['semanticwikilinks', 'semanticdata', 'markdown.extensions.extra']
    html = markdown.markdown(text, extensions=extensions)

    return mark_safe(html)


