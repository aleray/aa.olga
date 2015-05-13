window.AA = window.AA || {};


(function(undefined) {
    'use strict';
    
    // the globalEvents object allows to setup some events
    // that are common to all Backbone views / models
    // cf: http://lostechies.com/derickbailey/2012/04/03/revisiting-the-backbone-event-aggregator-lessons-learned/
    
    AA.globalEvents = _.extend({}, Backbone.Events);
})();  // end of the namespace AA
