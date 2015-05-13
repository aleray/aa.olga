window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    /* Error Handling */
    AA.AlertView = Backbone.View.extend({
        set: function(typeOfError, instructions, traceback) {
            var error = $('.error');
            error
                .html('<h1>' + typeOfError + '</h1>' + '<p>' + instructions + '</p>') // TODO: create template
                .fadeIn()
                .delay(5000)
                .fadeOut();
        }
    });
    
    $(document).ajaxError(function (e, xhr, options) {
        /* This displays an error message.
         * The error is not actually *caught*,
         * so it keeps showing up in the console */
        if (xhr.status === 401 || xhr.status === 403) {
            AA.alertView.set('Insufficient permissions to save', 'Remember, your changes will not actually be saved when you leave the page');
        } else if (xhr.status === 400) {
            AA.alertView.set('Bad request', 'Some content did not validate. Maybe the value for the annotation uuid is incorect? It should consist only of lowercase letters and digits, or hyphens or undercores. Please fix it before continuing');
        } else if (xhr.status === 500) {
            /* The response-text for the error is in JSON (probably a TastyPie specific format)
               We parse it. */
            var error = JSON.parse(xhr.responseText);
            var errorMessage = error.error_message;
            var traceback = error.traceback;
            AA.alertView.set(errorMessage, traceback);
        }
    });
    
})();  // end of the namespace AA
