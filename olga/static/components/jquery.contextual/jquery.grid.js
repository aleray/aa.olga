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

    // Create the defaults once
    var pluginName = "grid",
        defaults = {
            visible: true,
            width: 40,
            height: 40,
            hgutter: 5,
            vgutter: 5,
            color: 'cyan',
            gutterColor: 'rgba(255, 0, 0, 0.25)'
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

        this.init();
    }

    Plugin.prototype = {
        toggle: function() {
            if (this.options.visible) {
                this.hide();
            } else {
                this.show();
            };

        },
        show: function() {
            var o = this.options;
            o.visible = true;

            $(this.element).css({
                'background-size': this._backgroundSizeTemplate(this.options),
                'background-image': this._backgroundImageTemplate(this.options)
            });
        },
        init: function() {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).
            this._backgroundSizeTemplate = _.template('<%= width %>px <%= height %>px');
            this._backgroundImageTemplate = _.template(''
            + '-webkit-linear-gradient('
            + '    left, '
            + '    transparent 0px, ' 
            + '    transparent <%= width - hgutter + 1 %>px, '
            + '    <%= gutterColor %> <%= width - hgutter + 1 %>px, '
            + '    <%= gutterColor %> <%= width %>px '
            + '),'
            + '-webkit-linear-gradient('
            + '    top, '
            + '    transparent 0px, ' 
            + '    transparent <%= height - vgutter + 1 %>px, '
            + '    <%= gutterColor %> <%= height - vgutter + 1 %>px, '
            + '    <%= gutterColor %> <%= height %>px '
            + '),'
            + '-webkit-linear-gradient('
            + '    left, '
            + '    <%= color %> 0px, ' 
            + '    <%= color %> 1px, '
            + '    transparent 1px, '
            + '    transparent <%= width - hgutter %>px, '
            + '    <%= color %> <%= width - hgutter %>px, '
            + '    <%= color %> <%= width - hgutter + 1 %>px, '
            + '    transparent <%= width - hgutter + 1 %>px, '
            + '    transparent <%= width %>px '
            + '),'
            + '-webkit-linear-gradient('
            + '    top, '
            + '    <%= color %> 0px, ' 
            + '    <%= color %> 1px, '
            + '    transparent 1px, '
            + '    transparent <%= height - vgutter %>px, '
            + '    <%= color %> <%= height - vgutter %>px, '
            + '    <%= color %> <%= height - vgutter + 1 %>px, '
            + '    transparent <%= height - vgutter + 1 %>px, '
            + '    transparent <%= height %>px '
            + ')');

            if (this.options.visible) {
                this.show();
            };
        },
        updateRelative: function(options) {
            var o = this.options;
            var n = options;

            if (n.width) {
                o.width += n.width;
            }
            if (n.height) {
                o.height += n.height;
            }
            if (n.hgutter) {
                o.hgutter += n.hgutter;
            }
            if (n.vgutter) {
                o.vgutter += n.vgutter;
            }

            this.show();
        },
        update: function(options) {
            this.options = $.extend({}, this.options, options);
            this.show();
        },
        hgutter: function(size) {
            if (size) {
                this.options.hgutter = size;
                this.show();
            } else {
                return this.options.hgutter;   
            };
        },
        vgutter: function(size) {
            if (size) {
                this.options.vgutter = size;
                this.show();
            } else {
                return this.options.vgutter;   
            };
        },
        width: function(size) {
            if (size) {
                this.options.width = size;
                this.show();
            } else {
                return this.options.width;   
            };
        },
        height: function(size) {
            if (size) {
                this.options.height = size;;
                this.show();
            } else {
                return this.options.height;   
            };
        },
        hide: function() {
            this.options.visible = false;
            $(this.element).css({
                'background-size': 'auto',
                'background-image': 'none'
            });
        },

        destroy: function() {
            this.hide();
            delete $(this.element).data('plugin_' + this._name);
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
