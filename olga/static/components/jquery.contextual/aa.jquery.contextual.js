// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    /**
     * function relativeOffset (e [, currentTarget])
     *
     * Computes the relative offset of an event.
     *
     * By default, it is relative to the element the event is
     * bound to, but one can pass an arbitrary target element.
     *
     * Returns an object with top and left attributes.
     */
    var relativeOffset = function (e, currentTarget) {
        var $currentTarget = $(currentTarget || e.currentTarget);
        
        return {
            top: e.offsetY + $currentTarget.offset().top,
            left: e.offsetX + $currentTarget.offset().left,
        };
    };


    // Create the defaults once
    var pluginName = "contextual",
        defaults = {
            iconSize: 40,
            iconSpacing: 5,
            onShow: null
        };

    // The actual plugin constructor
    function Plugin (element, options) {
        this.element = element;

        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;
        this._is_visible = false;
        this._buttonCollections = {};
        this._visibleButtons = [];

        this.init();
    }

    Plugin.prototype = {
        init: function() {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).


            var DELAY = 300, clicks = 0, timer = null;
            var that = this;

            $(this.element)
			// Private implementation to turn two clicks in a dblClick.
			// If they are fired within the delay as set in the default
			// options.
            .on("click", function(event) {
                clicks++;  //count clicks
                if (clicks === 1) {
                    timer = setTimeout(function() {
                        that.onEvent.call(that, event, 'click');
                        clicks = 0;             //after action performed, reset counter
                    }, DELAY);

                } else {
                    clearTimeout(timer);    //prevent single-click action
                    that.onEvent.call(that, event, 'dblclick');
                    clicks = 0;             //after action performed, reset counter
                }

                //return false;
            })
            .on("dblclick", function(event) {
                event.preventDefault();  //cancel system double-click event
            });
        },
        register: function(eventType, location, elt) {
            //if (!this._buttonCollections.hasOwnProperty(eventType)) {
                //console.log('bad');
                //return;
            //};
            if ($.inArray(location, ['cursor', 'top', 'left']) == -1) {
                var msg = ""
                    + "The location must be one of the following values: "
                    + ['"cursor"', '"top"', '"left"'].join(', ')
                    + " but you've passed \""
                    + location
                    + "\"";
                throw new Error(msg)
            };

            this._buttonCollections[eventType] = this._buttonCollections[eventType] || [];
            this._buttonCollections[eventType][location] = this._buttonCollections[eventType][location] || [];
            this._buttonCollections[eventType][location].push(elt);
        },
        onEvent: function(event, eventType) {
	    //console.log (event.target == this.element, event.target, this.element)
            if (this._is_visible) {
                this.hide();
            } else {
                // prevents "Uncaught TypeError: Cannot read property 'cursor' of undefined"
                if (!this._buttonCollections[eventType]) { return; };

                this.showAtCursor(event, this._buttonCollections[eventType]['cursor']);
                this.showOnTop(event, this._buttonCollections[eventType]['top']);
                this.showOnTheLeft(event, this._buttonCollections[eventType]['left']);
                this._is_visible = true;

                if ($.isFunction(this.options.onShow)) {
                    this.options.onShow.call(this);
                };
            };
        },
        showAtCursor: function(event, buttonCollection) {
            if (!buttonCollection) {
                return;
            };

            // the number of menu entries to show
            var number = buttonCollection.length, 

            // the relative offset of the click event
                clickX = relativeOffset(event).left, 
                clickY = relativeOffset(event).top,

            // the number of columns of our grid
                cols = Math.ceil(Math.sqrt(number)),

            // some shortcuts, and the size of an icon + the gutter
                iconSize = this.options.iconSize,
                iconSpacing = this.options.iconSpacing,
                cumulatedSize = iconSize + iconSpacing,

            // where to start the grid
                origin = {
                    left: clickX - (cols * cumulatedSize) / 2,
                    top: clickY - (Math.floor(Math.sqrt(number)) * cumulatedSize) / 2
                };

            for (var i=0; i<number; i++) {
                var btn = buttonCollection[i]
                // sets the initial position of the icon to the location of the click event
                .css({
                    position : 'absolute',
                    left     :  clickX - (iconSize / 2), 
                    top      :  clickY - (iconSize / 2)
                })
                // sets the target position on the grid, with animation
                .animate({
                    left: origin.left + (cumulatedSize * (i % cols)), 
                    top: origin.top + (cumulatedSize * parseInt(i / cols))
                }, 200)
                .appendTo('body');

                this._visibleButtons.push(btn);
            };
        },
        showOnTheLeft: function(event, buttonCollection) {
            if (!buttonCollection) {
               return;
            };

            var number = buttonCollection.length;
            
            // where to start the grid
            var origin = $(event.currentTarget).offset();
            origin.left -= this.options.iconSize + this.options.iconSpacing;

            for (var i=0; i<number; i++) {
                var btn = buttonCollection[i]
                .css({
                    position : 'absolute',
                    left     :  origin.left, 
                    top      :  origin.top + (i * (this.options.iconSize + this.options.iconSpacing))
                })
                .appendTo('body');

                this._visibleButtons.push(btn);
            };
        },
        showOnTop: function(event, buttonCollection) {
            if (!buttonCollection) {
               return;
            };

            var number = buttonCollection.length;
            
            // where to start the grid
            var origin = $(event.currentTarget).offset();
            origin.top -= this.options.iconSize + this.options.iconSpacing;

            for (var i=0; i<number; i++) {
                var btn = buttonCollection[i]
                .css({
                    position : 'absolute',
                    left     :  origin.left + (i * (this.options.iconSize + this.options.iconSpacing)), 
                    top      :  origin.top
                })
                .appendTo('body');

                this._visibleButtons.push(btn);
            };
        },
        hide: function() {
            $.each(this._visibleButtons, function(index, value) {
                value.detach();
            });
            this._visibleButtons = [];
            this._is_visible = false;

            //$('.icon').detach();
        }
    };

    // You don't need to change something below:
    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations and allowing any
    // public function (ie. a function whose name doesn't start
    // with an underscore) to be called via the jQuery plugin,
    // e.g. $(element).defaultPluginName('functionName', arg1, arg2)
    $.fn[pluginName] = function ( options ) {
        var args = arguments;

        // Is the first parameter an object (options), or was omitted,
        // instantiate a new instance of the plugin.
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {

                // Only allow the plugin to be instantiated once,
                // so we check that the element has no plugin instantiation yet
                if (!$.data(this, 'plugin_' + pluginName)) {

                    // if it has no instance, create a new one,
                    // pass options to our plugin constructor,
                    // and store the plugin instance
                    // in the elements jQuery data object.
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });

        // If the first parameter is a string and it doesn't start
        // with an underscore or "contains" the `init`-function,
        // treat this as a call to a public method.
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            // Cache the method call
            // to make it possible
            // to return a value
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);

                // Tests that there's already a plugin-instance
                // and checks that the requested public method exists
                if (instance instanceof Plugin && typeof instance[options] === 'function') {

                    // Call the method of our plugin instance,
                    // and pass it the supplied arguments.
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }

                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                  $.data(this, 'plugin_' + pluginName, null);
                }
            });

            // If the earlier cached method
            // gives a value back return the value,
            // otherwise return this to preserve chainability.
            return returns !== undefined ? returns : this;
        }
    };
})(jQuery, window, document);
