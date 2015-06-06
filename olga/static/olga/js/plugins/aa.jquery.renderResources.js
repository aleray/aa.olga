(function( $ ) {
 
    $.fn.renderResources = function() {
        var parseUri = AA.utils.parseUri;
    
        var templates = {
            img:           _.template('<img src="<%= uri %>" />'),
            //img:           _.template('<% if (options.zoomable) { %><div class="panzoom"><a href="<%= uri %>" rel="zoomable" title="Click to zoom in."><img src="<%= uri %>"></a></div><script>$.panzoom();</script><% } else { %><img src="<%= uri %>" /><% } %>'),
            html5video:    _.template('<video class="player" controls="true" preload src="<%= uri %>" />'),
            html5audio:    _.template('<% if (options.small) { %><div class="mini-player paused" rel="<%= uri %>" style="width:32px;height:32px" /></div><audio class="player" src="<%= uri %>" /><% } else { %><audio class="player" controls src="<%= uri %>" /><% } %>'),
            iframe:        _.template('<iframe src="<%= uri %>"></iframe>'),
            externalEmbed: _.template('<div id="<%= options.uid %>" class="embed hosted" data-uri="<%= uri %>"></div>'),
            fallback:      _.template('<a href="<%= uri %>"><%= uri %></a>')
        };
        
        var mimeMap = function (mimeType) {
            /**
             * Find the templatename for a given mimetype
             * @param {string} mimeType - a mimetype i.e. "video/ogg"
             * @returns {string} the name of the corresponding template i.e. "html5video"
             */
            var mimes = {
                img: ["image/jpeg", "image/png", "image/gif"],
                html5video: ["video/ogg", "video/webm", "video/mp4"],
                html5audio: ["audio/ogg", "audio/mpeg"],
                iframe: ["text/html"]
            };
            for (var templName in mimes) {
                if (_.contains(mimes[templName], mimeType)) {
                    return templName;
                }
            }
            return "fallback";
        };
        
        var renderResource = function (uri, filter, options) {
            var options = options || {};
            var renderUri;
            
            var uriForCachedResource = function (uri, filter) {
                /**
                 * @param {string} uri - i.e. 'http://media.boingboing.net/wp-content/themes/2012/sundries/logo_bounce2012.gif'
                 * @param {string} filter - i.e 'size:160|bw'
                 * @returns {string} a url to a locally cached version of the resource. if a filter
                 * was specified, this is appended too, so that the uri refers to a cached version
                 * of the filtered version of the resource.
                 * Example: 
                 * http://localhost:8000/filters/cache/media.boingboing.net/wp-content/themes/2012/sundries/logo_bounce2012.gif..size:160..bw.gif
                 */
                var parsedUri = parseUri(uri);
                var extension = '.' + parsedUri.file.split('.').slice(-1);
                
                // the first 4 elements make up the cache location. TODO: set this in settings.
                return [    location.protocol,
                            '//',
                            location.host,
                            '/filters/processed/',
                            parsedUri.protocol,
                            '://',
                            parsedUri.authority,
                            parsedUri.path,
                            filter ? '..' + filter.replace(/\|/g, '..') : '',
                            filter ? extension : '',
                            ].join('');
            };
        
            var isLocal = function (uri) {
                if (uri.indexOf("http") === -1 || uri.indexOf(document.location.host) !== -1 || uri.indexOf("localhost") !== -1 || uri.indexOf("127.0.0.1") !== -1) {
                    return true;
                }
                return false;
            };
        
            var isHostedService = function(uri) {
                /** Is this a hosted service that popcorn can play for us?
                 * (regexes copied from the Popcorn source) */
               return (/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu)/).test( uri ) ||
                      (/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(soundcloud)/).test( uri ) ||
                      (/player.vimeo.com\/video\/\d+/).test( uri ) ||
                      (/vimeo.com\/\d+/).test( uri );
            };
        
            //if (!filter && isLocal()) {
                //// If the image is already local, and needs no filtering, we can serve it as is:
            if (!filter) {
                renderUri = uri;
            } else if (isHostedService(uri)) {
                // For now, if it is on a hosted service, we´re not going to cache it either:
                renderUri = uri;
            } else {
                renderUri = uriForCachedResource(uri, filter);
            }
            
            // TEST:
            // uriC = uriForCachedResource('http://media.boingboing.net/wp-content/themes/2012/sundries/logo_bounce2012.gif', 'size:160|bw');
            // console.log(uriC, uriC === location.protocol + '//' + location.host + '/filters/processed/http://media.boingboing.net/wp-content/themes/2012/sundries/logo_bounce2012.gif..size:160..bw.gif');
            
            if (isHostedService(uri)) {
                var templateName = 'externalEmbed';
                var uid = 'uid-' + AA.utils.toHash(uri);
                options.uid = uid; // because of the way Popcorn works, we need an id to be able to refer to the div: we can’t just pass the element.
            } else {
                var mimeType = AA.utils.uri2mime(uri);
                var templateName = mimeMap(mimeType);
            }
            return templates[templateName]({
                uri: renderUri,
                options: options
            });
        };
        
        return this.each(function(i, el) {
            $( el )
                .find("[rel='aa:embed']")
                    .each(function(i, el) {
                        var $el = $(el);
                        // TODO this hack exists because we did not yet implement the
                        // wikilink syntax for filters
                        // [[ embed::http://upload.wikimedia.org/wikipedia/commons/4/43/Sherry_Turkle.jpg||bw|thumb ]] ->
                        // <aa rel="aa:embed" href="http://upload.wikimedia.org/wikipedia/commons/4/43/Sherry_Turkle.jpg">|bw|thumb</a> ->
                        // <aa rel="aa:embed" href="http://upload.wikimedia.org/wikipedia/commons/4/43/Sherry_Turkle.jpg" data-filter="bw|thumb">|bw|thumb</a>
                        var text = $el.text();
                        if (text.match(/^\|.*/)) {
                            $el.attr('data-filter', text.substring(1));
                        }
                        //
                        var uri = $el.attr('href');
                        var filter = $el.attr('data-filter');

                        /**
                         * Create the options object
                         *
                         * [[ embed::http://example.com/sherry_turkle.ogv ]]{: class='small nocontrols' } creates html ->
                         * <a ... class="small nocontrols"></a>
                         * from which we create the options object -> {"small": true, "nocontrols" : true}
                         * that we pass to the renderResource function
                         */

                        var ca = $el.attr('class'); // cf http://stackoverflow.com/questions/2787291/use-jquery-to-get-a-list-of-classes
                        var classes = [];
                        if(ca && ca.length && ca.split){
                            ca = jQuery.trim(ca); /* strip leading and trailing spaces */
                            ca = ca.replace(/\s+/g,' '); /* remove double spaces */
                            classes = ca.split(' ');
                        }

                        var options = {};
                        classes.forEach( function(c) { options[c] = true ; } );

                        // TODO: in ADMIN mode:
                        // A replace with spinner
                        // B launch HEAD request that tests if URL exists,
                        // and only replace with the template
                        // on succesful callback
                        $el.replaceWith($(renderResource(uri, filter, options)));
                    });
            
        });
 
    };
 
}( jQuery ));
