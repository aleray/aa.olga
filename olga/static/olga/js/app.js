$(function() {
    // load the void player, so that later it can be initialised to turn the page
    // and annotation boxes into drivers.
    Popcorn.player( "baseplayer" );

    // loads the views that change from page to page
    AA.router = new AA.Router();
    
    // make Backbone handle page changes
    // TODO: this is not actually active, as long as we don’t do a
    // preventDefault() on hyperlink-click event.
    // We can enable this later on, as for now it is OK to actually reload all the time—
    // it makes debugging easier.
    Backbone.history.start({pushState: true, root: "/pages/"});
});

if (window.chrome) { // cf http://davidwalsh.name/detecting-google-chrome-javascript
    
    /* Work around the problem that chrome only goes to a # link if it is there in the initial HTML
     We make it look again after the annotations have loaded

    cf http://stackoverflow.com/questions/10654244/chrome-bug-or-coding-error-anchor-id-links-within-destination-page-not-working */
    Pace.on("done", function() {
        // we use the Pace.on event, not $(window).load, because it takes a few more things into account
        var hash = location.hash;
        location.hash = '';
        location.hash = hash;
    });
}
