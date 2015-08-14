from functools import partial

from django.contrib import admin
from olga.models import Annotation, Page
from guardian.admin import GuardedModelAdmin

from django.utils.translation import ugettext_lazy as _
from django.contrib.admin import SimpleListFilter
from django.contrib.auth.models import User
from guardian.shortcuts import get_objects_for_user


class AnnotationInline(admin.StackedInline):
    extra = 0
    model = Annotation


class AnnotationAdmin(admin.ModelAdmin):
    search_fields = ['title', 'body']


class VisibleByListFilter(SimpleListFilter):
    title = _('visible by')
    parameter_name = 'visible_by'

    def lookups(self, request, model_admin):
        return ((u.id, u.username) for u in User.objects.all())

    def queryset(self, request, queryset):
        if self.value():
            return get_objects_for_user(User.objects.get(id=self.value()), 'olga.view_page')


class EditableByListFilter(SimpleListFilter):
    title = _('editable by')
    parameter_name = 'editable_by'

    def lookups(self, request, model_admin):
        return ((u.id, u.username) for u in User.objects.all())

    def queryset(self, request, queryset):
        if self.value():
            return get_objects_for_user(User.objects.get(id=self.value()), 'olga.change_page')


class AdministratedByListFilter(SimpleListFilter):
    title = _('administrated by')
    parameter_name = 'administrated_by'

    def lookups(self, request, model_admin):
        return ((u.id, u.username) for u in User.objects.all())

    def queryset(self, request, queryset):
        if self.value():
            return get_objects_for_user(User.objects.get(id=self.value()), 'olga.administer_page')


class PageAdmin(GuardedModelAdmin):
    # FIXME: VisibleByListFilter and EditableByListFilter are not enabled until
    # we find a way to combine them with AdministratedByListFilter
    #list_filter = (VisibleByListFilter, EditableByListFilter, AdministratedByListFilter)
    list_filter = (AdministratedByListFilter,)
    inlines = [
        AnnotationInline,
    ]

    # FIXME: handles Django 1.8 drop of support for `self.queryset`. This should
    # be handled by Django Guardian but this is a bug not solved yet. See
    # <https://github.com/django-guardian/django-guardian/issues/307>.
    @property
    def queryset(self):
        return partial(self.get_queryset)


admin.site.register(Annotation, AnnotationAdmin)
admin.site.register(Page, PageAdmin)
