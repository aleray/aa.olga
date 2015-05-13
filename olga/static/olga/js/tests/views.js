var mockPageHash = {
    "annotations" : [{
        "about" : document.location.origin + "/static/components/popcorn-js/test/trailer.ogv",
        "body" : "# Annotations\n\nThis is an introduction. This is how I imagine Camus when I read his diary, and this seems like a good model for living: you go to a swimming pool in Algiers, swim, dry in the sun, look at the beautiful boys and girls, think really hard, look at the beautiful boys and girls, think really hard, write a sentence, rewrite the sentence, swim, dry in the sun, rewrite the sentence, think really hard, rewrite the sentence, look at the beautiful boys and girls, rewrite the sentence.\n\nThe followingn are annotations to the video underneath.\n\n00:04,738 --> 00:16,867\n\nI hope that you'll go along with this rather unusual setting, and the fact that I remain seated when I get introduced, and the fact that I'm going to come to you mostly through this medium here for the rest of the show.\n\n00:16,867-->00:21,867\n\n And now we showthat sound files in comments get triggered automatically. This is an Italian song:\n\n [[ embed::" + document.location.origin + "/static/components/popcorn-js/test/italia.ogg#t=0,5 ]]{: class='small' } \n\n  I should tell you that I'm backed up by quite a staff of people between here and Menlo Park [sp?], where Stanford research is located some thirty miles south of here.  If everyone does their job well, it's all go very interesting, I think.  [Laughs]\n\n00:42,867 --> 00:58,867\n\nThe research program that I'm going to describe to you is quickly characterizable by saying:  If in your office, you as an intellectual worker, were supplied with a computer display backed up by a computer that was alive for you all day, and was instantly responsible, responsive [laughs], instantly responsive to every action you had, how much value could you derive from that?  Well, this basically characterizes what we've been pursuing for many years, and what we we call The Augmentive Human Intellect Research Center at Standford Research Institute.\n",
        "id" : 2,
        "style" : "left: 10px; top: 18px; width: 301; height: 400",
        "page" : "/api/v1/page/Tests/",
        "resource_uri" : "/api/v1/annotation/2/",
    }, {
        "body" : "#A video\n\n\n00:00:01,000 --> 00:01:05,000\n\n[[ embed::" + document.location.origin + "/static/components/popcorn-js/test/trailer.ogv#t=3 ]]\n\n",
        "id" : 9,
        "page" : "/api/v1/page/Tests/",
        "resource_uri" : "/api/v1/annotation/9/",
        "style" : "left: 10px; top: 458px; width: 300px; height: 400px",
    }, {
        "body" : "#Youtube!\n\n[[ embed::http://www.youtube.com/watch?v=v-7kf7OZQtw  ]]\n\nThis is a video embedded from youtube. Look, there’s connected events:\n\n00:04 --> 00:08\n\nI kick in after 4 seconds\n\n\nAnd there’s Soundcloud too:\n\n[[ embed::http://soundcloud.com/redlightradio/subbacultcha-with-palms-trax ]]",
        "about" : "http://www.youtube.com/watch?v=v-7kf7OZQtw",
        "id" : 66,
        "page" : "/api/v1/page/Tests/",
        "resource_uri" : "/api/v1/annotation/66/",
        "style" : "left: 333px; top: 458px; width: 300px; height: 400px",
    }, {
        "body" : "#Filters\n\nFor now, OLGA knows three filters: `thumb`, `resize` and `bw`.\n\nThis image of Sherry Turkle is downloaded from wikipedia, grayscaled and thumbnailed:\n\n[[ embed::http://upload.wikimedia.org/wikipedia/commons/4/43/Sherry_Turkle.jpg||bw|thumb ]]\n\n`[[ embed::http://upload.wikimedia.org/wikipedia/commons/4/43/Sherry_Turkle.jpg||bw|thumb ]]`\n\nWith the order reversed:\n\n[[ embed::http://upload.wikimedia.org/wikipedia/commons/4/43/Sherry_Turkle.jpg||thumb|bw ]]\n\n`[[ embed::http://upload.wikimedia.org/wikipedia/commons/4/43/Sherry_Turkle.jpg||bw|thumb ]]`\n\nJust a thumbnail (another image):\n\n[[ embed::https://farm8.staticflickr.com/7244/14035829911_e077859733_c.jpg||thumb ]]\n\n`[[ embed::https://farm8.staticflickr.com/7244/14035829911_e077859733_c.jpg||thumb ]]`\n\nAnd this is resizing. It has an argument for the width:\n\n[[ embed::http://upload.wikimedia.org/wikipedia/commons/4/43/Sherry_Turkle.jpg||resize:256 ]]\n\n`[[ embed::http://upload.wikimedia.org/wikipedia/commons/4/43/Sherry_Turkle.jpg||resize:256 ]]`",
        "id" : 69,
        "page" : "/api/v1/page/Tests/",
        "resource_uri" : "/api/v1/annotation/69/",
        "style" : "left: 333px; top: 868px; width: 300; height: 400",
    }, {
        "about" : document.location.origin + '/tests/#annotation-24',
        "body" : "#Relative time\n\nThis is an example of a slideshow.\n\n8<\n\nFirst slide\n\n8<\n\nSecond slide\n\n8<\n\nThird slide\n",
        "id" : 24,
        "uuid" : "annotation-24",
        "page" : "/api/v1/page/Tests/",
        "resource_uri" : "/api/v1/annotation/24/",
        "style" : "left: 333px; top: 18px; width: 300; height: 400",
        "klass" : "active-only",
    }],
    "introduction" : "",
    "name" : "test-page",
    "permissions" : {
        "administer_page" : [{
            "current" : true,
            "id" : 1,
            "name" : "osp",
            "type" : "user",
            "uri" : "/api/v1/user/1/"
        }],
        "change_page" : [{
            "current" : true,
            "id" : 1,
            "name" : "osp",
            "type" : "user",
            "uri" : "/api/v1/user/1/"
        }],
        "view_page" : [{
            "current" : true,
            "id" : 1,
            "name" : "osp",
            "type" : "user",
            "uri" : "/api/v1/user/1/"
        }, {
            "current" : false,
            "id" : -1,
            "name" : "AnonymousUser",
            "type" : "user",
            "uri" : "/api/v1/user/-1/"
        }]
    },
    "resource_uri" : "/api/v1/page/test-page/",
    "revisions" : [],
    "slug" : "test-page"
};

describe("The views", function() {

    AA.router = {};
    // To fake the fact that some views are normally bound to the router

    describe("The Site view", function() {

        var mockSiteHash = {
            "domain" : "example.com",
            "id" : 1,
            "name" : "example.com",
            "resource_uri" : "/api/v1/site/1/"
        };
        
        var mockSiteModel = new Backbone.Model(mockSiteHash);
        AA.siteView = new AA.SiteView({
            model : mockSiteModel
        });

        it("can be initialised", function() {
            expect(AA.siteView).toBeDefined();
        });

    });

    describe("The User view", function() {

        var mockUserHash = {
            id : 'me'
        };
        AA.userModel = new AA.UserModel(mockUserHash);
        AA.userView = new AA.UserView({
            model : AA.userModel
        });

        it("can be initialised", function() {
            expect(AA.userView).toBeDefined();
        });

        it("won’t render if not provided with info", function() {
            expect($("#user-meta")).not.toExist();
        });

        // FIXME: user-meta is created on sync event, so the tests below fail

        //it("will be visible once information (from the server) has been incorporated", function() {
            //AA.userView.model.set({
                //date_joined : "2013-10-03T12:52:37.178270",
                //first_name : "",
                //id : 1,
                //last_login : "2013-12-05T11:31:07.726953",
                //last_name : "",
                //resource_uri : "/api/v1/user/1/",
                //username : "mockUser"
            //});
            //expect($("#user-meta")).toExist();
        //});

        //it("will show us the username, if it does not know the first name", function() {
            //expect($("span.user.self")).toHaveText("mockUser");
        //});

        //it("once it does know it, it will present us the first name instead", function() {
            //AA.userView.model.set({
                //first_name : "Albert",
                //last_name : "Camus"
            //});
            //expect($("span.user.self")).toHaveText("Albert");
        //});

    });

    describe("The Page view", function() {

        spyOn($, 'ajax').andCallFake(function(options) {
            options.success(mockPageHash);
        });

        AA.router.annotationCollectionView = new AA.AnnotationCollectionView({
            id : 'test_page'
        });

        var mockPageModel = new AA.PageModel(mockPageHash);

        AA.router.pageView = new AA.PageView({
            model : mockPageModel
        });

        AA.router.pageView.render();

        it("can be initialised", function() {
            expect(AA.router.pageView).toBeDefined();
        });

        it("shows the right page-title", function() {
            expect(document.title).toBe("example.com | test-page");
        });

    });

    describe("The Annotation view", function() {

        Popcorn.player("baseplayer");

        AA.router.multiplexView = new AA.MultiplexView();

        AA.router.annotationCollectionView = new AA.AnnotationCollectionView({
            collection : AA.router.pageView.model.get('annotations')
        });

        it("can be initialised", function() {
            expect(AA.router.annotationCollectionView).toBeDefined();
        });

        it("loads the right number of annotations", function() {
            expect(AA.router.annotationCollectionView.collection.length).toBe(5);
        });

        it("has turned a semantic link to a video into an actual <video> tag", function() {
            expect($("video")).toExist();
        });

        it("has about attributes for all annotations", function() {
            expect($("article > section").map(function(i, el) {
                return $(el).attr('about');
            }).get().length).toBe(5);
        });

        it("the about attributes are absolute hyperlinks", function() {
            expect($("article > section").map(function(i, el) {
                return $(el).attr('about').match(/http:\/\/[^/]+\//) !== null;
            }).get()).toEqual([true, true, true, true, true]);
        });

        it("the about attributes are correct", function() {
            expect($("article > section:nth-child(1)")).toHaveAttr("about", document.location.protocol + '//' + document.location.host + "/static/components/popcorn-js/test/trailer.ogv");
            expect($("article > section:nth-child(2)")).toHaveAttr("about", document.location.origin + document.location.pathname);
            expect($("article > section:nth-child(5)")).toHaveAttr("about", document.location.origin + document.location.pathname + '#annotation-24');
        });

        it("features play buttons for the self-driven annotation, i.e. the slideshow", function() {
            expect($("article > section:nth-child(5) .play")).toExist();
        });

        it("except when the annotation is about the page itself", function() {
            expect($("article > section:nth-child(2) .play")).toBeHidden();
        });

        it("the slideshow has a forward button enabled, and a backwards button disabled", function() {
            expect($("article > section:nth-child(5) .next")).not.toHaveClass("disabled");
            expect($("article > section:nth-child(5) .previous")).toHaveClass("disabled");
        });

        it("there is one video that is a media box: it gets the class media", function() {
            expect($("article > section:nth-child(2)")).toHaveClass("media");
        });
    });

    describe("The Multiplex view", function() {

        it("can be initialised", function() {
            expect(AA.router.multiplexView).toBeDefined();
        });

        it("finds popcorn", function() {
            expect(Popcorn).toBeDefined();
        });

        it("finds the right amount of drivers", function() {
            // 1 driver for the video,
            // 1 for the page
            // 1 for an annotation box
            // 1 for a youtube video found in the annotations
            // 1 for a soundcloud sound found in the annotations
            // 1 for the italian song found in the annotations
            expect(_.keys(AA.router.multiplexView.drivers).length).toBe(6);
        });

        it("the drivers are instances of Popcorn.js", function() {
            expect(AA.router.multiplexView.getDriver(document.location.origin + "/static/components/popcorn-js/test/trailer.ogv")).toBeDefined();
            expect(AA.router.multiplexView.getDriver(document.location.origin + "/static/components/popcorn-js/test/trailer.ogv") instanceof Popcorn).toBe(true);
        });

        it("Popcorn.js and the original element agree", function() {
            expect(AA.router.multiplexView.getDriver(document.location.origin + "/static/components/popcorn-js/test/trailer.ogv").paused()).toBe(true);
            expect(AA.router.multiplexView.getDriver(document.location.origin + "/static/components/popcorn-js/test/trailer.ogv").media.paused).toBe(true);
        });

        it("the video has 3 registered events", function() {
            expect(AA.router.multiplexView.getDriver(document.location.origin + "/static/components/popcorn-js/test/trailer.ogv").getTrackEvents().length).toBe(3);
        });

    });

    describe("The Timeline Player view", function() {
        AA.router.timelinePlayerView = new AA.TimelinePlayerView();

        it("can be initialised", function() {
            expect(AA.router.timelinePlayerView).toBeDefined();
        });
    });
});
