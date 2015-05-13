window.AA = window.AA || {};


(function(undefined) {
    'use strict';


    AA.widgets = AA.widgets || {};
    /**
    * Button factory for contextual menus
    */
    AA.widgets.CreateBtn = function(options) {
        var defaults = {
            title: 'undefined',
            class: ''
        };

        var options = $.extend({}, defaults, options);

        var btn = $('<div>')
        .attr({
            title: options.title,
            draggable: false,
            class: 'icon ' + options.class
        });

        return btn;
    };
    
    AA.widgets.Menu = function (options) {
        this.options = {
            position: 'left',
            layout: 'grid',
            iconSize: 40,
            iconSpacing: 5,
            element: null,
        };
        
        this.positionLeft = 'left';
        this.positionTop =  'top';
        this.positionAtCursor = 'cursor';
 
        return this.init (options);
    };
    
    AA.widgets.Menu.prototype = {
            init: function (options) {
            this._visible = false;
            this._buttonCollection = [];
            this._visibleButtons = [];
            this.options = $.extend ({}, this.options, options);
            
            return this;
        },

        // Register given button object in this menu
        register: function (button) {
            if (button instanceof Array) {
                while (button.length > 0) {
                    this._buttonCollection.push (button.shift());
                }
            } else {
                this._buttonCollection.push (button);
            }
        },

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
        relativeOffset: function (e, currentTarget) {
            var $currentTarget = $(currentTarget || e.currentTarget);
            
            return {
                top: e.offsetY + $currentTarget.offset().top,
                left: e.offsetX + $currentTarget.offset().left,
            };
        },
 
        visible: function () {
            return this._visible;
        },
           
        toggle: function (event) {
            if (this._visible) {
                this.hide (event);
            } else {
                this.show (event);
            }
        },
        
        show: function (event) {
            if (this._visible === false) {
                switch (this.options.position) {
                    case this.positionLeft:
                        this.showOnTheLeft (event);
                        break;
                    case this.positionTop:
                        this.showOnTop (event);
                        break;
                    default:
                        this.showAtCursor (event);
                }
            }
        },
 
        hide: function () {
            $.each(this._visibleButtons, function(index, value) {
                value.detach();
            });
            
            this._visibleButtons = [];
            this._visible = false;
        },
        
        showAtCursor: function(event) {
            if (!this._buttonCollection) {
                return;
            };
            
            // the number of menu entries to show
            var number = this._buttonCollection.length;

            // the relative offset of the click event
            var clickX = event.pageX; //this.relativeOffset(event).left, 
            var clickY = event.pageY; //this.relativeOffset(event).top,

            // the number of columns of our grid
            var cols = Math.ceil(Math.sqrt(number));

            // the size of an icon + the gutter
            var cumulatedSize = this.options.iconSize + this.options.iconSpacing;

            // where to start the grid
            var origin = {
                left: clickX - (cols * cumulatedSize) / 2,
                top: clickY - (Math.floor(Math.sqrt(number)) * cumulatedSize) / 2
            };

            for (var i=0; i<number; i++) {
                var btn = this._buttonCollection[i]
                // sets the initial position of the icon to the location of the click event
                .css({
                    position : 'absolute',
                    left     :  clickX - (this.options.iconSize / 2), 
                    top      :  clickY - (this.options.iconSize / 2)
                })
                // sets the target position on the grid, with animation
                .animate({
                    left: origin.left + (cumulatedSize * (i % cols)), 
                    top: origin.top + (cumulatedSize * parseInt(i / cols))
                }, 200)
                .appendTo('body');

                this._visibleButtons.push(btn);
            };
            
            this._visible = true;
        },
        
        showOnTheLeft: function(event) {
            if (!this._buttonCollection || !!this.options.element == false) {
                // return false if we either have no buttons
                // or a falsey value in the element
                return;
            };
            
            var number = this._buttonCollection.length;
            
            // where to start the grid
            var origin = $(this.options.element).offset();
            origin.left -= this.options.iconSize + this.options.iconSpacing;
   
            for (var i=0; i<number; i++) {
                var btn = this._buttonCollection[i]
                .css({
                    position : 'absolute',
                    left     :  origin.left, 
                    top      :  origin.top + (i * (this.options.iconSize + this.options.iconSpacing))
                })
                .appendTo('body');

                this._visibleButtons.push(btn);
            };
            
            this._visible = true;
        },
        
        showOnTop: function(event) {
            if (!this._buttonCollection || !!this.element == false) {
                return;
            };

            var number = this._buttonCollection.length;
            
            // where to start the grid
            var origin = $(this.element).offset();
            origin.top -= this.options.iconSize + this.options.iconSpacing;

            for (var i=0; i<number; i++) {
                var btn = this._buttonCollection[i]
                .css({
                    position : 'absolute',
                    left     :  origin.left + (i * (this.options.iconSize + this.options.iconSpacing)), 
                    top      :  origin.top
                })
                .appendTo('body');

                this._visibleButtons.push(btn);
            };
            
            this._visible = true;
        },
 
        redraw: function () {
            if (this.visible()) {
                this.hide();
                this.show();
            }
        },
 
        destroy: function () {
            for (var i=0;i<this._buttonCollection.length;i++) {
                this._buttonCollection[i].remove();
            }
        }
    };

    AA.widgets.MenuButton = function (options) {
        this.options = {
            title: 'undefined',
            class: ''
        };
        
        return this.init (options);
    };
    
    AA.widgets.MenuButton.prototype = {
        init: function (options) {
            this.options = $.extend({}, this.options, options);

            this.btn = $('<div>')
            .attr({
                title: options.title,
                draggable: false,
                class: 'icon ' + options.class
            });
            
            return this.btn;
        }
    };


    /* Taken from hotglue, GPL License*/
    AA.widgets.slider = function(event, change, stop) {
        var oldEvent = event;
        var mousemove = function(event) {
            if (typeof change == 'function') {
                change(event.pageX - oldEvent.pageX, event.pageY - oldEvent.pageY, event);
            }
            return false;
        };
        var mouseup = function(event) {
            $('html')
            .unbind('mousemove', mousemove)
            .unbind('mouseup', mouseup);

            if (typeof change == 'function') {
                change(event.pageX - oldEvent.pageX, event.pageY - oldEvent.pageY, event);
            }
            if (typeof stop == 'function') {
                stop(event.pageX - oldEvent.pageX, event.pageY-oldEvent.pageY, event);
            }
            return false;
        };

        $('html')
        .bind('mousemove', mousemove)
        .bind('mouseup', mouseup);	
    };
})();  // end of the namespace AA
