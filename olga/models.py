from django.db import models


class RCSModel(models.Model):
    """
    Base class for versioned models
    """
    class Meta:
        abstract = True


class Page(RCSModel):
    """Represents a wiki page"""
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, primary_key=True)
    introduction = models.TextField(blank=True)
    style = models.TextField(blank=True)
    klass = models.TextField(blank=True)
    stylesheet = models.TextField(blank=True)

    def __unicode__(self):
        return self.name

    @models.permalink
    def get_absolute_url(self):
        return ('page-detail', (), {'slug': self.slug})

    class Meta:
        permissions = (
            ('view_page', 'Can view page'),
            ('administer_page', 'Can administer page')
        )


class Annotation(RCSModel):
    """Represent an annotation"""
    page = models.ForeignKey(Page)
    uuid = models.SlugField()
    about = models.URLField(blank=True)
    body = models.TextField(blank=True)
    style = models.TextField(blank=True)
    klass = models.TextField(blank=True)
    title = models.TextField(blank=True)

    class Meta:
        unique_together = (("page", "uuid"),)

    def __unicode__(self):
        return self.body[0:100]
