window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    AA.UserCollection = Backbone.Collection.extend({
        model: AA.UserModel,
        urlRoot: "/api/v1/user/",
        initialize: function() {
            this.listenTo(AA.userView.model, 'sync', this.fetchConditionally);
        },
        fetchConditionally: function() {
            if (AA.userView.model.loggedIn()) {
                this.fetch();
            }
        }
    });

    
    AA.AnnotationCollection = Backbone.Collection.extend({
        model: AA.AnnotationModel,
        urlRoot: "/api/v1/annotation/",
    });
})();  // end of the namespace AA

