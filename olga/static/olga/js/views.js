window.AA = window.AA || {};

(function(undefined) {
    'use strict';

    Backbone.View.prototype.empty = function() {
        this.el.innerHTML = "";
        this.stopListening();
        return this;
    };


    AA.PopUpView = Backbone.View.extend({
        tagName: 'div',
        attributes: { class: 'popup-wrapper' },
        events: {
            'click input[value="cancel"]': 'remove',
            'submit #dialog-form': 'submit',
            'keypress #dialog-form input[value="submit"]': "submitOnEnter"
        },
        initialize: function() {
            this.render();
        },
        submitOnEnter: function(event) {
            // cf http://japhr.blogspot.be/2011/11/submitting-backbonejs-forms-with-enter.html
            if ( event.keyCode === 13 ) { // 13 is the code for ENTER KEY
                this.submit(event);
            }
        },
    });


    AA.ImportExportView = AA.PopUpView.extend({
        template: _.template($('#import-export-view-template').html()),
        events: function(){
            return _.extend({}, AA.PopUpView.prototype.events, {
                'submit #import-form' : 'importData',
                'click input[value="close"]': 'remove',
            });
        },
        render: function() {
            var audacity = markdown.Markdown.dialects.AaTiny.toAudacity(this.model.get('body'));
            var audacityData = base64EncArr(strToUTF8Arr(audacity));

            var srt = markdown.Markdown.dialects.AaTiny.toSRT(this.model.get('body'));
            var srtData = base64EncArr(strToUTF8Arr(srt));

            this.$el.html(this.template({
                audacityData: audacityData,
                srtData: srtData,
                name: this.model.get('uuid'),
            }));

            $('body').append(this.$el);

            return this;
        },
        importData: function (event){
            event.preventDefault();

            var that = this;

            var f = $('#file').get(0).files[0];
            var reader = new FileReader();

            reader.onload = function(e) {
                var t = $('input[name="type"]:checked').val();
                var ret;

                if (t === "audacity") {
                    ret = AA.utils.fromAudacity(reader.result);
                } else if (t === "srt") {
                    ret = AA.utils.fromSRT(reader.result);
                }

                that.model.set('body', ret).save();
            };

            reader.readAsText(f);
        },
        submit: function (event){
            event.preventDefault();

            this.remove();
        },
    });


    AA.EditPermissionsView = AA.PopUpView.extend({
        template: _.template($('#edit-permissions-view-template').html()),
        render: function() {
            var permissions = this.model.get('permissions');

            var ids = _.pluck(permissions.view_page, 'id');
            var visitorCollection = new Backbone.Collection(AA.router.userCollection.models);
            visitorCollection.each(function(user) {
                if (_.indexOf(ids, user.get("id"))) {
                    user.set('selected', true);
                }
            });

            ids = _.pluck(permissions.change_page, 'id');
            var editorCollection = new Backbone.Collection(AA.router.userCollection.models);
            editorCollection.each(function(user) {
                if (_.indexOf(ids, user.get("id"))) {
                    user.set('selected', true);
                }
            });

            ids = _.pluck(permissions.administer_page, 'id');
            var adminCollection = new Backbone.Collection(AA.router.userCollection.models);
            adminCollection.each(function(user) {
                if (_.indexOf(ids, user.get("id"))) {
                    user.set('selected', true);
                }
            });

            this.$el.html(this.template({
                users: AA.router.userCollection,
                can_view_ids: _.pluck(permissions.view_page, 'id'),
                can_change_ids: _.pluck(permissions.change_page, 'id'),
                can_administer_ids: _.pluck(permissions.administer_page, 'id')
            }));

            $('body').append(this.$el);

            return this;
        },
        submit: function (event){
            var getPermissionEntries = function($elt) {
                var ids = _.map($elt.val(), function(val) { return parseInt(val); });

                var users = AA.router.userCollection.filter(function(model) {
                    return _.contains(ids, model.get('id'));
                });

                return _.map(users, function(user) {
                    var name = user.get('first_name');
                    name = name ? name : user.get('username');
                    var id = user.get('id');

                    return {
                        'current': (id === current_user_id),
                        'type' : 'user',
                        'id'   : id,
                        'name' : name,
                        'uri'  : '/api/v1/user/' + id + '/'
                    };
                });
            };

            event.preventDefault();

            this.$el.find('select, input').prop('disabled', true);

            var current_user_id = AA.userView.model.get('id');

            var permissions = this.model.get('permissions');

            permissions.view_page = getPermissionEntries(this.$el.find('[name="visitors"]'));
            permissions.change_page = getPermissionEntries(this.$el.find('[name="editors"]'));
            permissions.administer_page = getPermissionEntries(this.$el.find('[name="administrators"]'));

            var that = this;

            this.model.set('permissions', permissions);
            this.model.save(null, {
                error: function() {
                    this.$el.find('select, input').prop('disabled', false);
                },
                success: function() {
                    that.remove();
                }
            });
        },
    });


    AA.EditIntroductionView = AA.PopUpView.extend({
        template: _.template($('#edit-introduction-view-template').html()),
        render: function() {
            this.$el.html(this.template({ introduction: this.model.toFrontMatter() }));
            $('body').append(this.$el);

            return this;
        },
        submit: function (event){
            event.preventDefault();

            this.model
                .loadFront($('textarea[name="introduction"]', this.$el).val(), 'introduction')
                .save();

            this.remove();
        },
    });


    AA.LoginView = AA.PopUpView.extend({
        template: _.template($('#login-view-template').html()),
        render: function() {
            this.$el.html( this.template( {} ) );

            $('body').append( this.$el );

            return this;
        },
        submit: function (event){
            event.preventDefault();

            var that = this;

            var data = JSON.stringify({
                username: $("input[name=username]", this.$el).val(),
                password: $("input[name=password]", this.$el).val()
            });

            $.ajax({
                url: '/api/v1/user/login/',
                type: 'POST',
                contentType: 'application/json',
                data: data,
                dataType: 'json',
                processData: false,
                success: function(data) {
                    AA.globalEvents.trigger('aa:changeUser');

                    that.remove();
                },
            });
        },
    });


    AA.SiteView = Backbone.View.extend({
        el: '#site-meta-container', // <div id="user-meta"></div>
        template: _.template($('#site-view-template').html()),
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },
        render: function() {
            this.$el.html( this.template( _.clone(this.model.attributes) ) );

            return this;
        },
    });


    AA.UserView = Backbone.View.extend({
        el: '#user-meta-container',
        template: _.template($('#user-view-template').html()),
        events: {
            "click #login-link"         : "login",
            "click #logout-link"        : "logout",
        },
        render: function() {
            // Adds an anonymous class if not connected so we can "unpublish"
            // wip annotations using css
            var id = this.model.get('id');

            if (typeof id === "undefined" || id === -1) {
                $('body').addClass('anonymous');
            } else {
                $('body').removeClass('anonymous');
            }

            this.$el.html( this.template( _.clone(this.model.attributes) ) );

            return this;
        },
        initialize: function() {
            this.listenTo(AA.globalEvents, 'aa:changeUser', this.onChangeUser);
            this.listenTo(this.model, 'sync', this.render);
        },
        onChangeUser: function() {
            this.model.reset().fetch();
        },
        login: function(e) {
            e.preventDefault();

            new AA.LoginView();
        },
        logout: function(e) {
            e.preventDefault();

            $.ajax({
                url: '/api/v1/user/logout/',
                type: 'GET',
                contentType: 'application/json',
                processData: false,
                success: function(data) {
                    AA.globalEvents.trigger('aa:changeUser');
                },
            });
        },
    });


    AA.PageView = Backbone.View.extend({
        el: '#page-meta-container',
        template: _.template($('#page-view-template').html()),
        events: {
            //"click #commit-list a"              : "wayback",
            //"change #permissions-visible"       : "updatePermissionsVisible",
            //"change #permissions-editable"      : "updatePermissionsEditable",
            //"change #permissions-administrated" : "updatePermissionsAdministrated",
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },
        render: function() {
            var context = _.clone(this.model.attributes)
            context.introduction = markdown.toHTML(context.introduction, "Aa");

            this.$el.html( this.template( context ) );

            AA.router.annotationCollectionView.$el.attr('style', this.model.get('style'));
            AA.router.annotationCollectionView.$el.attr('class', this.model.get('klass'));

            $('#extra-stylesheet').remove();
            var stylesheet = this.model.get('stylesheet');
            if (stylesheet) {
                $('<link>', {
                    id: 'extra-stylesheet',
                    rel: 'stylesheet',
                    href: stylesheet
                }).appendTo('head');
            }

            this.setTitle();
            return this;
        },
        //wayback: function(event) {
            //event.preventDefault();
            //var href = $(event.currentTarget).attr('href');
            //AA.router.navigate(href.substring(6), {trigger: true});
        //},
        setTitle: function() {
            document.title = AA.siteView.model.get('name') + ' | ' + this.model.get('name');
        },
        //publicUser: {
            //"current": false,
            //"id": -1,
            //"name": "AnonymousUser",
            //"type": "user",
            //"uri": "/api/v1/user/-1/"
        //},
        //updatePermissionsVisible: function() {
            //var permissions = this.model.get("permissions");

            //if ($("#permissions-visible").find("input[type=radio]:checked").val() === "public") {
                //// add public user
                //permissions.view_page.push(this.publicUser);
            //} else {
                //// remove public user
                //permissions.view_page = _.reject(permissions.view_page, function(p) { return p.id === -1; });
            //}

            //this.model.set("permissions", permissions);
            //this.model.save();
        //},
    });


    AA.ToolView = Backbone.View.extend({
        el: '#tools',
        events: {
            "click .toggleDrawer": "toggleDrawer",
        },
        toggleDrawer: function(event) {
            $('body').toggleClass('show-tool');
        },
        initialize: function() {
            $('.tabs', this.$el).tabs();
        }
    });


    AA.SidebarView = Backbone.View.extend({
        el: '#sidebar',
        events: {
            "click .toggleDrawer": "toggleDrawer",
        },
        toggleDrawer: function(event) {
            $('body').toggleClass('hide-sidebar');
        }
    });


    AA.RevisionView = Backbone.View.extend({
        el: '#commits',
        template: _.template($('#revisions-browser-template').html()),
        events: {
            "click .revert":     "revert",
            "click .revision_list a":     "navigate",
            "click #revisions_browser_next a":     "navigate",
            "click #revisions_browser_prev a":     "navigate",
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },
        render: function() {
            this.$el
            .empty()
            .html(this.template({
                prev: this.model.prev_rev(),
                next: this.model.next_rev(),
                rev: this.model.current_rev(),
                revisions: this.model.get('revisions'),
                slug: AA.router.currentSlug
            }));
        },
        navigate: function(event) {
            event.preventDefault();
            var href = $(event.currentTarget).attr('href');
            AA.router.navigate(href.substring(6), { trigger: true });
        },
        revert: function(event) {
            event.preventDefault();

            var answer = window.confirm("You are about to revert to an old version. It will erase the working version permanently. Make sure you take a snapshot of the working version before reverting. Proceed?");

            if (answer) {
                var clone = this.model.clone();
                var current = new AA.PageModel();
                current.set({id : AA.router.currentSlug});
                current.fetch({success: function(model, response, options) {
                    current.get('annotations').each(function(model, index) {
                        model.destroy({wait: true});
                    });
                    clone.unset('rev');
                    clone.unset('revisions');
                    clone.get('annotations').each(function(model, index) {
                        model.unset('id');
                        model.unset('resource_uri');
                    });
                    clone.get('annotations').each(function(model, index) {
                        model.save(null, {wait: true});
                    });
                    clone.set('permissions', current.get('permissions'));
                    clone.unset("annotations");
                    clone.save(null, {success: function(model, response) {
                        AA.router.navigate(AA.router.currentSlug, { trigger: true });
                    }});
                }});
            }
        }
    });


    AA.MultiplexView = Backbone.View.extend({
        initialize: function() {
            this.drivers = {};
        },
        registerDriver : function(uri) {
            var that = this;
            if (typeof(this.drivers[uri]) === 'undefined') {

                if (uri === document.location.origin + document.location.pathname) {
                    // If the about is the current page, attach to the general timeline
                    this.drivers[uri] = Popcorn.baseplayer( "#timeline" );
                    this.drivers[uri].media.src = uri; // just to have some reference from the popcorn object to the driver
                }
                else if (uri.indexOf(document.location.origin + document.location.pathname) !== -1 && uri.indexOf('#') !== -1 ) {
                    // example uri: http://localhost:8000/pages/tests/#annotation-0024
                    // If the about refers to a part of the page, we try to create
                    // a separate abstract player for that part

                    var hash = '#' + uri.split('#').slice(-1);
                    if ($(hash).length === 0) {
                        return null;
                    }
                    this.drivers[uri] = Popcorn.baseplayer( hash );
                    this.drivers[uri].media.src = uri; // just to have some reference from the popcorn object to the driver
                } else {
                    // we assume that the driver is a media element we can manipulate
                    // such as <video class="player" controls="" preload="" src="http://localhost:8000/static/components/popcorn-js/test/trailer.ogv"></video>

                    // the uri, or the uri with an added hash for media-query (#t=3)
                    var driverMediaEl  = document.querySelector('[src="' + uri + '"], [src^="' + uri + '#"]');
                    var driverMediaRef = document.querySelector('[data-uri="' + uri + '"], [data-uri^="' + uri + '#"]');
                    if (driverMediaEl &&
                           ( driverMediaEl.tagName.toLowerCase() === "video" ||
                             driverMediaEl.tagName.toLowerCase() === "audio" )
                           ) {
                        this.drivers[uri] = Popcorn(driverMediaEl);
                    } else if (driverMediaRef) {
                        // We go to lengths to specify id’s,
                        // because Popcorn.smart only supports id´s and not elements themselves.
                        this.drivers[uri] = Popcorn.smart('#' + driverMediaRef.getAttribute('id'), uri, { defaults: { controls : true }});
                    } else {

                        // And else we don’t know what to do
                        console.log('driver not found ' + uri);
                        return null;
                    }
                }
                if (this.drivers[uri] instanceof Popcorn && !(/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu)/).test( uri ) ) {
                    // Sent out time update events to our Backbone event funnel
                    // FIXME: Disabled this now for Youtube drivers as for some reason or another they emit events continuously
                    // maybe a bug upstream?
                    this.drivers[uri].on("timeupdate", function() {
                         AA.globalEvents.trigger('aa:timeUpdate', uri);
                    });

                    /* Adding the appropriate classes to the miniplayers based on pause and play events */
                    // I’m not sure this is the right way to go about this:
                    var miniPlayerPlayUI = function() {
                        $('.mini-player[rel="' + uri + '"]').removeClass("paused").addClass("playing");
                        that.playChildren(uri);
                    };
                    var miniPlayerPauseUI = function() {
                        $('.mini-player[rel="' + uri + '"]').removeClass("playing").addClass("paused");
                        that.pauseChildren(uri);
                    };
                    this.drivers[uri].on("play", miniPlayerPlayUI).on("playing", miniPlayerPlayUI);
                    this.drivers[uri].on("pause", miniPlayerPauseUI).on("ended", miniPlayerPauseUI).on("abort", miniPlayerPauseUI);
                }
                return this.drivers[uri];
            } else {
                // already registered, just return it
                return this.drivers[uri];
            }
        },
        getDriver: function(uri) {
            // strip media-query like #t=3:
            uri = uri.match(/[^\#]+/)[0];
            return this.drivers[uri];
        },
        findChildren: function(uri) {
            return $('section[about="' + uri+ '"]');
        },
        findChildrenMedia: function(uri) {
            var that = this;
            var $childrenSections = this.findChildren(uri);

            var uris = [];

            var $activeAnnotations = $childrenSections.find('section[typeof="aa:annotation"].active');

            $activeAnnotations.each(function(i, el) {
                $(el).find(".embed.hosted").each(function(i, el) {
                    uris.push( $(el).attr("data-uri") );
                });
                $(el).find("video[src],audio[src]").each(function(i, el) {
                    uris.push( $(el).attr("src") );
                });
            });

            return uris;
        },
        pauseChildren: function(uri) {
            var activeChildDriverUris = this.findChildrenMedia(uri);

            for (var i=0; i<activeChildDriverUris.length; i++) {
                var driver = AA.router.multiplexView.getDriver(activeChildDriverUris[i]);
                if (typeof driver !== "undefined" && !driver.paused()) {
                    driver.pause();
                }
            }
        },
        playChildren: function(uri) {
            var activeChildDriverUris = this.findChildrenMedia(uri);

            for (var i=0; i<activeChildDriverUris.length; i++) {
                var driver = AA.router.multiplexView.getDriver(activeChildDriverUris[i]);
                if (typeof driver !== "undefined" && driver.paused()) {
                    driver.play();
                }
            }
        }
    });


    AA.AbstractPlayer = {
        playPause: function(e) {
            /**
             * Sends a ‘play’ event to the driver,
             * or a pause event if it is already playing.
             *
             * (The Popcorn instance wraps the HTML5 audio/video player,
             *  so it shares the same base methods)
             *  */
            if (this.driver.paused()) {
                this.driver.play();
            } else {
                this.driver.pause();
            }
            this.render();
        },
        nextEvent: function() {
            var currentTime = this.driver.currentTime();
            var sortedEvents = _.sortBy(this.driver.getTrackEvents(), "start");
            // returns undefined if no such element encountered:
            return _.find(sortedEvents, function(event){ return currentTime < event.start; });
        },
        next: function(e) {
            var nextEvent = this.nextEvent();
            if (nextEvent) {
                this.driver.currentTime(nextEvent.start);
            }
        },
        previousEvent: function() {
            var currentTime = this.driver.currentTime();
            var sortedEvents = _.sortBy(this.driver.getTrackEvents(), "end");
            // returns undefined if no such element encountered:
            return _.find(sortedEvents, function(event){ return currentTime > event.start; });

        },
        previous: function(e) {
            var previousEvent = this.previousEvent();
            if (previousEvent) {
                this.driver.currentTime(previousEvent.start);
            }
        },
        duration: function() {
            var duration = this.driver.duration();
            if (duration === 0) {
                return _.max( _.pluck(this.driver.getTrackEvents(), 'end') );
            }
            return duration;
        },
        seek: function(e) {
           if (!this.driver.paused()) {
                this.driver.pause();
            }
            this.driver.currentTime( this.duration() * e.target.valueAsNumber / 100 );
        },
        renderPlayerConditionally: function(uri) {
            if (this.model) {
               if (uri !== this.model.get("about")) { // annotation player
                   return;
               }
            } else { // timeline player
                if (uri !== document.location.origin + document.location.pathname) {
                    return;
                }
            }
            var duration = this.duration();
            if (this.driver.currentTime() > duration) {
                this.driver.pause();
                this.driver.currentTime(duration);
            }
            this.renderPlayer();
        },
        renderPlayer: function() {
            var that = this;
            if (typeof this.hasPlay === "undefined") { return null; }
            if (!this.driver) { return null; }

            if (this.hasPlay()) {
                this.$el.find(".controls").removeClass("hidden");

                // if the driver is paused and there is still a pause button showing,
                // we should make sure it becomes a play button (and vice versa):
                var playButtonShowsPause = function() {
                    return that.$el.find('.controls .fa-pause').length !== 0;
                };
                if (this.driver.paused() === playButtonShowsPause()) {
                    this.$el.find('.play').toggleClass("fa-play fa-pause");
                }

                // update time based values:
                this.$el.find('.current_time').text(AA.utils.ss2tc(this.driver.currentTime()));
                this.$el.find('.duration').text(AA.utils.ss2tc(this.duration()));
                this.$el.find('.next').toggleClass("disabled", !this.nextEvent());
                this.$el.find('.previous').toggleClass("disabled", !this.previousEvent());
                this.$el.find('#seek-bar').val( 100 / this.duration()  * this.driver.currentTime() );
                this.$el.find('#faux-seek-bar-interior').css("width", 100 / this.duration()  * this.driver.currentTime() + "px" );
            } else {
                this.$el.find(".controls").addClass("hidden");
            }
            return this;
        }
    };


    AA.TimelinePlayerView = Backbone.View.extend({
        el: '#timeline',
        template: _.template($('#timeline-player-template').html()),
        events: {
            "click .play":     "playPause",
            "click .next":     "next",
            "click .previous": "previous",
            "input #seek-bar": "seek", // continuously emit; bind to `change #seek-bar` to only update when mouse is released
                                       // at the moment the seek bar is disabled
        },
        initialize: function() {
            this.listenTo(AA.globalEvents, "aa:timeUpdate", this.renderPlayerConditionally, this);
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.render, this);
            this.listenTo(AA.globalEvents, "aa:updateAnnotationEvents", this.render, this);

            this.driver = AA.router.multiplexView.registerDriver(document.location.origin + document.location.pathname);

            this.render();
        },
        render: function() {
            // Once this view has first rendered, subsequent updates target specific dom elements.
            //
            // This is because the constant rerendering through timeupdate events made the
            // controls unclickable.
            var that = this;
            // do we already have the controls?
            if (this.$el.find('.controls').length === 0) {
                this.$el.html(this.template({}));
            }
            return this.renderPlayer();
        },
        hasPlay: function() {
            return this.driver.getTrackEvents().length > 0;
        },
    }).extend(AA.AbstractPlayer);


    AA.AnnotationView = Backbone.View.extend({
        /**
         * This is the workhorse of OLGA
         *
         * Each annotation is connected to a driver.
         * This driver can be a sound, a video, the page, or the annotation itself.
         *
         * The view takes care of quite some different actions.
         *
         * 1) It renders Markdown content, and allows it to be edited
         * 2) In this Markdown content, one can embed time based annotations
         * 3) The view keeps track of the timed annotations, and registers them
         *    with the corresponding driver in the MultiPlexView
         *    It reruns this process when the Markdown content is updated.
         * 4) The view has a series of controls to play and scroll through
         *    the corresponding driver.
         *
         * The driver where the events are registered is a PopCorn instance.
         * For the Popcorn player API,
         * see: https://gist.github.com/boazsender/729213
         *
         * */
        tagName: 'section',
        templates: {
            view: _.template($('#annotation-view-template').html()),
            edit: _.template($('#annotation-edit-template').html()),
        },
        events: {
            "start [typeof='aa:annotation']" : "activateAnnotation",
            "end [typeof='aa:annotation']" : "deactivateAnnotation",
            "click"                     : "focus",
            "click .icon-edit"          : "edit",
            "click .icon-ok"            : "save",
            "click .icon-cancel"        : "render",
            "click .icon-transition"    : "toggleTransition",
            "click .icon-visibility"    : "toggleCollapsing",
            "click .icon-delete"        : "deleteAnnotation",
            "click .icon-export"        : "exportAnnotationToAudacityMarkers",
            "mousedown .icon-layers"    : "changeZIndex",
            "click .controls .play"     : "playPause",
            "click .next"               : "next",
            "click .previous"           : "previous",
            "click .mini-player"        : "playPauseMiniPlayer",
            'click span[property="aa:begin"],span[property="aa:end"]' : "jumpToAnnotation",
            'click a[target="multiplex"]': "crossDriverLink",
            'drag'                      : "drag",
            "dragstop"                  : "dragstop",
            'click a[target="multiplex"],span[property="aa:begin"],span[property="aa:end"],video,audio,.mini-player,.controls' : function(e) { e.stopPropagation(); }
        },
        initialize: function() {
            // references to timed annotations
            this.driverEventIDs = [];

            // local events
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model.collection, 'focus', this.onFocus);

            // global events
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.registerDriver, this);
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.registerChildrenAsDrivers, this);
            this.listenTo(AA.globalEvents, "aa:timeUpdate", this.renderPlayerConditionally, this);

            this.render();
        },
        drag: function (event, ui) {
            if (event.ctrlKey) {
                $("#canvas").addClass("grid");
                ui.position.left = Math.floor(ui.position.left / 20) * 20;
                ui.position.top = Math.floor(ui.position.top / 20) * 20;
            } else {
                $("#canvas").removeClass("grid");
            }
        },
        dragstop: function(event, ui) {
            console.log("dragstop!");
            this.positionMenu();

            $("#canvas").removeClass("grid");

            var style = $('<div>')
                .attr('style', this.model.get('style'))
                .css({
                    left: ui.position.left + 'px',
                    top: ui.position.top + 'px',
                }).attr('style');

            this.model.set({ style: style }, { silent: true }).saveIfAuthorized();
        },
        render: function() {
            /*
             * It is necessary that #canvas > section elements have a z-index
             * set to auto to allow for the .menu elements to be painted on top
             * (it is not very handy otherwise to click button of an overlaping
             * box with a lower z-index).
             *
             * See <http://jsfiddle.net/Fzn5T/3/> for a proof-of-concept.
             */
            var that = this;
            var model = this.model;
            var isFocused = this.$el.hasClass('focused');

            var $tmp = $('<div>').attr('style', that.model.get('style'));

            this.$el
            .attr({
                'id': this.model.get('uuid'),  // id="annotation-4"
                'title': this.model.get('title'),
                'class': this.model.get('klass'),
                'about': this.model.get('about')
            })
            .css({
                left: $tmp.css('left'),
                top: $tmp.css('top')
            })
            .html(this.templates.view({
                body: markdown.toHTML(this.model.get("body"), "Aa"),
                isSlideshow: this.isSlideshow(),
                canChange: AA.userModel.canChange(),
                isHead: AA.router.pageView.model.get('rev') === null
            }))
            .draggable({
                handle: '.icon-drag',
                containment: "parent",
                distance: 10,
                scroll: true,
                scrollSensitivity: 100,
                addClasses: false,
            })
            .droppable({
                accept: ".icon-target",
                addClasses: false,
                greedy: true,
                hoverClass: "drop-hover",
                over: function( event, ui ) {
                    event.stopImmediatePropagation();
                },
                drop: function( event, ui ) {
                    var about = ui.draggable.attr('href');
                    var answer = window.confirm("You are about to connect the annotation to " + about + ". Proceed?");

                    if (answer) {
                        that.model.set({ about: about }).save();
                        that.render();
                    };
                }
            })
            .renderResources();

            $('.wrapper', this.$el)
            .attr('style', this.model.get('style'))
            .resizable({
                resize: function (event, ui) {
                    if (event.ctrlKey) {
                        $("html").addClass("grid");

                        ui.element.width((Math.floor(ui.size.width / 20) * 20) - (ui.position.left % 20));
                        ui.element.height((Math.floor(ui.size.height / 20) * 20) - (ui.position.top % 20));
                    } else {
                        $("html").removeClass("grid");
                    }
                },
                stop: function(event, ui) {
                    $("html").removeClass("grid");

                    var style = $('<div>')
                        .attr('style', that.model.get('style'))
                        .css({
                            width: ui.size.width + 'px',
                            height: ui.size.height + 'px',
                        }).attr('style');

                    model.set({ style: style }, { silent: true }).saveIfAuthorized();
                }
            });

            $('.icon-target', this.$el)
                .attr('href', document.location.origin + document.location.pathname + '#' + this.model.get('uuid'))
                .draggable({ helper: "clone" })
            ;

            if (this.isMedia()) {
                this.$el.addClass("media");
            }

            if (this.isSlideshow()) {
                this.$el.addClass("slideshow");
            }


            if(this.driver) {
                this.updateAnnotationEvents();
            }

            if (isFocused) {
                this.$el.addClass('focused');
            }

            return this;
        },
        edit: function() {
            var that = this;
            this.$el.attr('title', this.model.get('title'));

            this.$el
            .addClass('editing')
            .html(this.templates.edit({
                body: this.model.toFrontMatter(),
                isHead: AA.router.pageView.model.get('rev') === null
            }))
            .find('textarea')
            .bind('keydown', "Ctrl+Shift+down", function timestamp(event) {
                event.preventDefault();

                $(this).insertAtCaret('\n\n' + AA.utils.ss2tc(that.driver.currentTime()) + ' -->\n\n');
            })
            .bind('keydown', "Ctrl+Shift+up", function toggle(event) {
                event.preventDefault();

                if (that.driver.paused()) {
                    that.driver.play();
                } else {
                    that.driver.pause();
                    //AA.router.navigate('t=' + mediaElt.currentTime + 's', {trigger: false, replace: true})
                }
            })
            .bind('keydown', "Ctrl+Shift+left", function rewind(event) {
                event.preventDefault();

                var nextTime = Math.max(that.driver.currentTime() - 5, 0);
                that.driver.currentTime(nextTime);
                //AA.router.navigate('t=' + mediaElt.currentTime + 's', {trigger: false, replace: true})
            })
            .bind('keydown', "Ctrl+Shift+right", function fastForward(event) {
                event.preventDefault();

                var nextTime = Math.min(that.driver.currentTime() + 5, that.driver.duration());
                that.driver.currentTime(nextTime);
                //AA.router.navigate('t=' + mediaElt.currentTime + 's', {trigger: false, replace: true})
            });
        },
        save: function() {
            var that = this;

            this.model
                .loadFront($('textarea', this.$el).val(), 'body', { silent: true })
                .save(null, {
                    success: function(model, result, xhr) {
                        // we explicitly call render here. We cannot rely on the change
                        // event in case: we want to switch back to the view mode even if
                        // the user hasn't done any changes.
                        // The option {silent: true} was passed above to avoid calling
                        // render twice
                        that.render();
                    },
                    error: function(model, xhr, options) {
                        var error = xhr.responseJSON.error_message;
                        if (error === "UNIQUE constraint failed: olga_annotation.page_id, olga_annotation.uuid") {
                            window.alert('the annotation uuid must be unique within the page. Please fix it.');
                        }
                    }
                });
        },
        positionMenu: function() {
            var position = this.$el.position();
            var $left = this.$el.find('.menu-left');
            var $top = this.$el.find('.menu-top');

            if (position.left < 45) {
                $left.removeClass('left').addClass('right');
            } else {
                $left.removeClass('right').addClass('left');
            };

            if (position.top < 45) {
                $top.removeClass('top').addClass('bottom');
            } else {
                $top.removeClass('bottom').addClass('top');
            };
        },
        activateAnnotation: function(event) {
            var playChildren = function($annotEl) {
                /**
                * Given an annotation element, play the media elements contained in there.
                * @param {jQuery element} $annotEl - section[typeof='aa:annotation']
                * @returns no return value
                * */
                var hostedUris = $annotEl.find(".embed.hosted").map(function(i, el) {
                    return $(el).attr("data-uri");
                }).get();
                var mediaUris = $annotEl.find("video[src],audio[src]").map(function(i, el) {
                    return $(el).attr("src");
                }).get();
                var allUris = hostedUris.concat(mediaUris);
                for (var i=0; i<allUris.length; i++) {
                    var uri = allUris[i];
                    var driver = AA.router.multiplexView.getDriver(uri);
                    if (typeof driver !== "undefined" && driver.paused()) {
                        driver.play();
                    }
                }
            };

            var $el = $(event.currentTarget);
            var $wrapper = $el.closest(".wrapper");
            $el.addClass("active");

            if (! this.$el.hasClass('active-only')) {
                $wrapper.animate({
                    scrollTop: $el.position().top + $wrapper.scrollTop()
                }, 600);
            }

            playChildren($el); // play any audio/videos that are in this annotation
        },
        deactivateAnnotation: function(event) {
            var $el = $(event.currentTarget);
            $el.removeClass("active");
        },
        onFocus: function(event, instance) {
            if (instance === this.model) {
                this.positionMenu();
                this.$el.addClass('focused');
            } else {
                this.$el.removeClass('focused');
            }
        },
        focus: function(event) {
            this.model.collection.trigger('focus', event, this.model);

            event.stopPropagation();
        },
        onPositionChange: function(model, value, options) { // FIXME this code should allow for animations but is not called right now
            var defaults = {
                animate: false
            };

            var options = $.extend({}, defaults, options);
            var that = this;

            if (options.animate === true) {
                this.$el.animate({
                    left: model.changed.left,
                    top: model.changed.top
                }, {
                    duration: 2000,
                    easing: 'easeOutExpo',
                });
            };
        },
        deleteAnnotation: function(event) {
            if (window.confirm('This will permanently delete this annotation. Proceed?')) {
                this.model.destroy();
            };
            return false;
        },
        exportAnnotationToAudacityMarkers: function(event) {
            new AA.ImportExportView({model: this.model});

            return false;
        },
        changeZIndex: function(event) {
            var that = this;
            var min = this.model.collection.min(function(model) {
                return model.zIndex();
            }).zIndex();
            var max = this.model.collection.max(function(model) {
                return model.zIndex();
            }).zIndex();

            AA.widgets.slider(event, function(x, y) {
                $('.wrapper', that.$el).css('z-index', (x < 0) ? min - 1 : max + 1);
            }, function(x, y) {
                var style = $('<div>')
                    .attr('style', that.model.get('style'))
                    .css('z-index', (x < 0) ? min - 1 : max + 1)
                    .attr('style');

                that.model.set({ style: style }, { silent: true }).save();
            });

            return false;
        },
        toggleCollapsing: function() {
            var $tmp = $('<div>').attr('class', this.model.get('klass'));

            if ($tmp.hasClass('collapsed') && $tmp.hasClass('hidden')) {
                $tmp.removeClass('collapsed hidden');
            } else if ($tmp.hasClass('collapsed')) {
                $tmp.removeClass('collapsed');
                $tmp.addClass('hidden');
            } else if ($tmp.hasClass('hidden')) {
                $tmp.removeClass('hidden');
            } else {
                $tmp.addClass('collapsed');
            }

            this.model.set("klass", $tmp.attr('class')).saveIfAuthorized();

            this.render();

            return false;
        },
        toggleTransition: function() {
            var $tmp = $('<div>').attr('class', this.model.get('klass'));

            $tmp.toggleClass('active-only');

            this.model.set("klass", $tmp.attr('class'));
            this.model.save();
            this.render();

            return false;
        },
        jumpToAnnotation: function(e) {
            this.driver.currentTime(e.target.getAttribute("content"));
        },
        crossDriverLink: function(e) {
            var position, href, times, driver;
            e.preventDefault();
            href = e.target.getAttribute("href"); // "http://repo.sarma.be/soiree%20parole/Alessandro%20Bosetti%20in%202spaces.ogv#t=100"
            // if no link found:
            if (!href) { return; }
            times = href.match(/#t=([0-9]+)/);    // ["#t=100", "100"]
            // if no fragment found, we go to the beginning (the author used multiplex for a reason!)
            if ( !times || times.length<2 ) { position = 0; } else { position = times[1]; }
            // console.log("CrossDriverLink!");
            // console.log("AA.router.multiplexView.getDriver('" + href + "').currentTime(" + position + ")");
            driver = AA.router.multiplexView.getDriver(href);
            driver.currentTime(position);
            if (driver.paused()) { driver.play(); }
        },
        setAsSlideshow: function() {
            if (window.confirm('Set as slideshow?')) {
                this.model.set("about", document.location.origin + document.location.pathname + '#' + this.model.get('uuid') );
            }
            this.model.save();
            this.renderPlayer();
            return false;
        },
        registerDriver : function() {
            /**
             * This annotation has an `about` value. It represents what is annotated,
             * also called the ‘driver’ because this time based resource can trigger
             * time-based behaviour in the annotations.
             *
             * With this time-based resource we initialise the driver,
             * if it has not yet been initialised, and we call the function to register
             * the annotations as events.
             */
            this.driver = AA.router.multiplexView.registerDriver(this.model.get('about'));
            this.updateAnnotationEvents();
            this.renderPlayer();
        },
        registerChildrenAsDrivers: function() {
            var hostedUris = this.$el.find(".embed.hosted").map(function(i, el) {
                return $(el).attr("data-uri");
            }).get();
            var mediaUris = this.$el.find("video[src],audio[src]").map(function(i, el) {
                return $(el).attr("src");
            }).get();
            var allUris = hostedUris.concat(mediaUris);
            for (var i=0; i<allUris.length; i++) {
                var uri = allUris[i];
                // strip media-query like #t=3:
                uri = uri.match(/[^\#]+/)[0];
                AA.router.multiplexView.registerDriver(uri);
            }
        },
        deleteAnnotationEvents: function() {
            /**
             * Delete all references to annotations at this annotation’s driver.
             */
            for (var i=0; i<this.driverEventIDs.length; i++) {
                var eventID = this.driverEventIDs[i];
                this.driver.removeTrackEvent( eventID );
            }
            this.driverEventIDs = [];
        },
        updateAnnotationEvents: function() {
            /**
             * Scan the contents of the annotation view: parse out all annotations,
             * and register them with the driver.
             *
             * This is rerun every time the content changes (with the old events
             * emptied out beforehand)
             */
            if (!this.driver) {
                return false;
            }
            var that = this;
            this.deleteAnnotationEvents();
            this.$el.find("[typeof='aa:annotation']").each(function (i, el) {
                 var $annotation = $(el);
                 var start = parseFloat($annotation.attr("data-begin"));

                 var end   = parseFloat($annotation.attr("data-end"));
                 var p = that.driver.aa({
                     start: start,
                     end: end,
                     $el: $annotation
                 });
                 that.driverEventIDs.push(p.getLastTrackEventId());
             });
             AA.globalEvents.trigger('aa:updateAnnotationEvents');
             this.renderPlayer();
        },
        hasPlay : function() {
            /**
             * Should this annotation feature player controls?
             *
             * For now we only feature player controls for self-driven annotations, i.e. slideshows.
             * */
            var uri = this.model.get('about');
            return uri.indexOf(document.location.origin + document.location.pathname) !== -1 && uri.indexOf('#') !== -1 ;
        },
        isSlideshow: function() {
            // for now the same as hasPlay
            return this.hasPlay();
        },
        isMedia: function() {
            // We need to find one and only one audio or video,
            // inside one and only one annotation,
            // then we know this is a media box

            var annotations = this.$el.find("[typeof='aa:annotation']");
            if (annotations.length !== 1) { return false; }

            var media = annotations.find("audio[src], video[src]");
            if (media.length !== 1) {
                return false;
            }
            return true;
        },
        playPauseMiniPlayer: function(e) {
            var miniPlayerDriver = AA.router.multiplexView.getDriver($(e.target).attr("rel"));
            if (miniPlayerDriver.paused()) {
                miniPlayerDriver.play();
            } else {
                miniPlayerDriver.pause();
            }
        },
    }).extend(AA.AbstractPlayer);


    AA.AnnotationCollectionView = Backbone.View.extend({
        collection: new AA.AnnotationCollection(),
        el: '#canvas',
        events: {
            "click"            : "focus",
        },
        initialize: function() {
            this.cursorMenu = new AA.widgets.Menu ({iconSize: 40, iconSpacing: 5, position: 'cursor'});

            this.cursorMenu.register ([
                // Create Annotation Button
                new AA.widgets.MenuButton ({title: 'new box', class: 'icon-new'})
                    .on('click', this.addAnnotation.bind(this)),

                // Create Organize annotations Button
                new AA.widgets.MenuButton ({title: 'organize boxes', class: 'icon-pack'})
                    .on('click', this.organizeAnnotations.bind(this)),

                // Create Snapshot Button
                new AA.widgets.MenuButton ({title: 'take a snapshot', class: 'icon-star'})
                    .on('click', this.commit.bind(this)),

                // Create Edit introduction Button
                new AA.widgets.MenuButton ({title: 'edit introduction', class: 'icon-edit'})
                    .on('click', function() {
                        if (AA.router.annotationCollectionView.cursorMenu.visible()) {
                            AA.router.annotationCollectionView.cursorMenu.hide ();
                        };

                        new AA.EditIntroductionView({model: AA.router.pageView.model });
                    }),

                // Create Manage permissions Button
                new AA.widgets.MenuButton ({title: 'manage permissions', class: 'icon-ok'})
                    .on('click', this.editPermissions.bind(this)),

                // Create Set About Value Button
                new AA.widgets.MenuButton({title: 'drag to connect', class: 'icon-target'})
                    .draggable({ helper: "clone" })
                    .attr('href', document.location.origin + document.location.pathname),

                // Create Set About Value Button
                new AA.widgets.MenuButton({title: 'view the page source', class: 'icon-target'})
                    .on('click', this.viewSource.bind(this)),
            ]);

            this.listenTo(this.collection, 'focus', this.onFocus);
            this.listenTo(this.collection, 'add', this.renderOne);
            this.listenTo(AA.userModel, 'sync', this.render);
            this.render();
        },
        renderOne: function(model, collection) {
            var $el = this.$el;
            var annotationView = new AA.AnnotationView({model: model});
            $el.append(annotationView.el);

            // As the registration function queries the document, the
            // annotation needs to be appended first in order for the program
            // to find the drivers

            AA.globalEvents.trigger('aa:newDrivers');

            return this;
        },
        render: function() {
            var $el = this.$el;
            $el.empty();

            this.collection.each(function(annotation) {
                var annotationView = new AA.AnnotationView({model: annotation});
                $el.append(annotationView.el);

                // As the registration function queries the document, the
                // annotation needs to be appended first in order for the program
                // to find the drivers
            });

            AA.globalEvents.trigger('aa:newDrivers');
            return this;
        },
        focus: function(event) {
            this.collection.trigger('focus', event, this.collection);

            event.stopPropagation();
        },
        onFocus: function(event, instance) {
            if (instance === this.collection &&
                ! this.cursorMenu.visible() &&
                AA.userModel.loggedIn() &&
                (AA.userModel.canChange() || AA.userModel.canAdminister()) &&
                ! AA.router.pageView.model.get('rev')) {
                if (this.focused) {
                    this.focused = undefined;
                } else {
                    this.cursorMenu.show(event);
                }
            } else {
                this.cursorMenu.hide();
            }

            if (instance !== this.collection) {
                this.focused = instance;
            }
        },
        commit: function(event) {
            this.cursorMenu.hide();

            var msg = prompt("Commit message", "My modifications");

            if (msg) {
                AA.router.pageView.model.commit(msg);
            }
        },
        addAnnotation: function(event) {
            var offsetBtn = $(event.currentTarget).position();
            var offsetCanvas = this.$el.position();
            var top = offsetBtn.top - offsetCanvas.top + this.$el.scrollTop();
            var left = offsetBtn.left - offsetCanvas.left + this.$el.scrollLeft();
            this.collection.create({style: 'top: ' + top + 'px; left: ' + left + 'px'});
            this.cursorMenu.hide();
        },
        organizeAnnotations: function (event) {
            var proceed = window.confirm("This will rearrange your layout… Proceed?");

            if (proceed) {
                // sort the annotations by z-index;
                var sorted = this.collection.sortBy(function(model) {
                    return model.zIndex();
                });

                _.each(sorted, function(model, index) {
                    var $tmp = $('<div>')
                        .attr('style', model.get('style'))
                        .css({
                            top: 20 + (index * 20) + 'px',
                            left: 20 + (index * 20) + 'px'
                        });

                    model.set({style: $tmp.attr('style')}, {animate: false}).save();
                });
            }

            this.cursorMenu.hide();
        },
        editPermissions: function (event) {
            if (this.cursorMenu.visible()) {
                this.cursorMenu.hide();
            };

            new AA.EditPermissionsView({ model: AA.router.pageView.model });
        },
        viewSource: function (event) {
            //var src = Backbone.sync('read', AA.router.pageModel, {});
            //var src = AA.router.pageModel.sync('read', AA.router.pageModel, {});
            //var model = AA.router.pageModel;
            //var foo = model.trigger('sync', model, {wait: true});

            //console.log(foo);
            $.ajax({
                url: AA.router.pageModel.url(),
                dataType: 'text',
                async: false,
                success: function (data){
                    console.log(data);
                }
            });
        },
    });
})();  // end of the namespace AA

// vim: set foldmethod=indent:
