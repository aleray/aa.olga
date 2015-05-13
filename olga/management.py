"""
this file is used to hook an initial checkout (working copy)
into django's syncdb process

Based on django-rcsfield
<https://code.google.com/p/django-rcsfield/>
Copyright (c) 2008, Arne Brodowski
All rights reserved.
Distributed under the New BSD License, see
<http://opensource.org/licenses/BSD-3-Clause> for the terms of use.
"""

import os
from django.conf import settings
from django.db.models import get_models, signals



def initial_checkout(sender, created_models, verbosity, **kwargs):
    """
    creates the repository / does the initial checkout
    for all fields that are versionized.
    called via post_syncdb signal from django.

    """
    from olga.backends import backend
    from olga.models import RCSModel
    sender_name = sender.__name__.split('.')[-2]
    for model in created_models:
        app_label = model._meta.app_label
        if issubclass(model, RCSModel):
            if sender_name == app_label:
                if verbosity >= 1:
                    print("Found versionned model: %s.models.%s" % (sender_name, model.__name__))
                    print("Will run init procedure for %s backend" % backend.__module__.split('.')[-1])
                backend.initial("%s/%s" % (app_label, model.__name__))

signals.post_syncdb.connect(initial_checkout)
