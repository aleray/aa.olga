#! /usr/bin/env python2


from setuptools import setup


setup(
    name='olga',
    version='0.1a1',
    author='Alexandre Leray, Eric Schrijver',
    author_email='alexandre@stdin.fr, eric@ericschrijver.nl, The Active Archives Contributors',
    description=('A multimodal wiki.'),
    url='https://github.com/aleray/aa.olga',
    packages=[
        'olga',
        'olga.backends',
    ],
    include_package_data = True,
    install_requires=[
        'django-tastypie==0.12.2-dev',
        'django-guardian==1.3',
        'GitPython==0.1.7'
    ],
    dependency_links=[
        'https://github.com/django-tastypie/django-tastypie/archive/256ebe1de9a78dfb5d4d6e938b813cf4c5c4ac1b.zip#egg=django-tastypie-0.12.2-dev'
    ],
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Operating System :: OS Independent',
        'License :: OSI Approved :: GNU Affero General Public License v3 or later (AGPLv3+)',
        'Intended Audience :: Developers',
        'Environment :: Web Environment',
        'Programming Language :: Python',
        'Topic :: Text Processing :: Markup :: HTML'
    ]
)
