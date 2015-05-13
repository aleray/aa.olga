window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    AA.Router = Backbone.Router.extend({
        currentSlug: '',
        routes: {
            ":slug/": "stripTrailingSlash",
            ":slug(/:rev)": "page",
            "": "index",
        },
        initialize: function() {
            // page-to-page navigation independant code

            AA.siteModel = new AA.SiteModel({ id : 1 });
            AA.siteView = new AA.SiteView({ model: AA.siteModel });
            AA.siteView.model.fetch();
            
            AA.alertView = new AA.AlertView();

            AA.userModel = new AA.UserModel({ id : 'me' });
            AA.userView = new AA.UserView({ model : AA.userModel });
            AA.userView.model.fetch();
            
            AA.toolView = new AA.ToolView();
            AA.sidebarView = new AA.SidebarView();
        },
        index: function() {
            AA.router.navigate('/Index/', {trigger: true});
        },
        stripTrailingSlash: function(slug) {
            AA.router.navigate('/' + slug, {trigger: true});
        },
        page: function(slug, rev) {
            // Makes sure the page slug is indeed a Wiki name
            var wiki_name = AA.utils.wikify(slug);
            if (slug !== wiki_name) {
                AA.router.navigate('/' + wiki_name + '/', { trigger: true });
            }

            var that = this;
            this.currentSlug = slug;

            //this.pageModel = this.pageModel || new AA.PageModel(); /* FIXME: this was for browsing revisions
            this.pageModel = new AA.PageModel();
            this.pageModel.set({id : slug, rev: rev});

            // Some more info on Backbone and ‘cleaning up after yourself’: http://mikeygee.com/blog/backbone.html
            this.pageView && this.pageView.remove();
            this.pageView = new AA.PageView({ model: this.pageModel });
            this.pageView.model.fetch({ data: { rev: rev } });

            this.multiplexView && this.multiplexView.remove();
            this.multiplexView = new AA.MultiplexView();
            
            // empty() is a custom method acting like remove() except that it
            // doesn't remove the container
            this.annotationCollectionView && this.annotationCollectionView.empty();
            // Since we are using backbone-associations.js, An annotation
            // collection is created as a property of the page view model.
            this.annotationCollectionView = new AA.AnnotationCollectionView({collection : this.pageView.model.get('annotations')});

            this.revisionView && this.revisionView.empty() && this.revisionView.undelegateEvents();
            //if(AA.userModel.loggedIn()) {
                this.revisionView = new AA.RevisionView({ model: this.pageView.model });
            //}

            this.timelinePlayerView && this.timelinePlayerView.remove();
            this.timelinePlayerView = new AA.TimelinePlayerView();

            this.userCollection && this.userCollection.remove();
            this.userCollection = new AA.UserCollection();
            
        }
    });
})();  // end of the namespace AA
