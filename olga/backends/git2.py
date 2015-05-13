"""
pygit2 backend for django-rcsfield.

Uses Git to versionize content.
"""

import os
import pygit2
import time
from django.conf import settings

from olga.backends.base import BaseBackend


class GitBackend(BaseBackend):
    """
    Rcsfield backend which uses GitPython to versionize content.

    """

    def __init__(self, repo_path):
        self.repo_path = os.path.normpath(repo_path)


    def initial(self, prefix):
        """
        Set up the git repo at ``settings.GIT_REPO_PATH``.
        And add initial directory to the repo.

        """
        pygit2.init_repository(self.repo_path, True)  # a bare repository


        #field_path = os.path.normpath(os.path.join(self.repo_path, prefix))
        #if not os.path.exists(field_path):
            #os.makedirs(field_path)

    #def fetch(self, key, rev):
        #"""
        #fetch revision ``rev`` of entity identified by ``key``.

        #"""
        #repo = Repo(self.repo_path)
        #try:
            #tree = repo.tree(rev)
            #for bit in key.split('/'):
                #tree = tree/bit
            #return tree.data
        #except:
            #return ''

    def commit(self, key, data, message='auto commit from django'):
        """
        commit changed ``data`` to the entity identified by ``key``.

        """

        repo = pygit2.Repository(self.repo_path)

        # create a tree with blob out of memory
        blob_oid = repo.create_blob(data)
        builder = repo.TreeBuilder()
        builder.insert(key, blob_oid, pygit2.GIT_FILEMODE_BLOB)
        tree_oid = builder.write()

        author = committer = pygit2.Signature('foo bar', 'foo@bar.de', 120, int(time.time()))

        try:
            parent_oid = [repo.head.oid]
        except pygit2.GitError:
            parent_oid = []

        # commit everything (as initial commit)
        repo.create_commit(
            'HEAD',
            author,
            committer,
            message,
            tree_oid,
            parent_oid
        )

        #try:
            #fobj = open(os.path.join(self.repo_path, key), 'w')
        #except IOError:
            ##parent directory seems to be missing
            #self.initial(os.path.dirname(os.path.join(self.repo_path, key)))
            #return self.commit(key, data)
        #fobj.write(data)
        #fobj.close()
        #repo = Repo(self.repo_path)
        #try:
            #repo.git.add(os.path.join(self.repo_path, key))
        #except:
            #raise
        #repo.git.commit(message=message)


    #def get_revisions(self, key):
        #"""
        #returns a list with all revisions at which ``key`` was changed.
        #Revisions are Git hashes.

        #"""
        #repo = Repo(self.repo_path)
        #crevs = [r.id for r in repo.log(path=key)]
        #return crevs[1:] # cut of the head revision-number

    #def move(self, key_from, key_to):
        #"""
        #Moves an entity from ``key_from`` to ``key_to`` while keeping
        #the history. This is useful to migrate a repository after the
        #``rcskey_format`` of a ``RcsTextField`` was changed.

        #"""
        #repo = Repo(self.repo_path)
        #try:
            #repo.git.mv(key_from, key_to)
            #repo.git.commit(message="Moved %s to %s" % (key_from, key_to))
            #return True
        #except:
            #return False



rcs = GitBackend(settings.GIT_REPO_PATH)

