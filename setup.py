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
        'django-tastypie',
        'django-guardian==1.3',
        'GitPython==0.1.7'
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
