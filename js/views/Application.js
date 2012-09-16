/**
 * @class ApplicationView
 * @extends Backbone.View
 * @description Primarily listens for keyup, keydown, and keypress events
 * and sends them to the EditorView as appropriate.
 */
var ApplicationView = Backbone.View.extend({

    el : 'body',
    
    events : {
        keydown: function() {
            console.log('keydown');
        },
        keypress: function() {
            console.log('keypress');
        },
        keyup: function() {
            console.log('keyup');
        }
    },

    /**
     * @method initialize The ApplicationView constructor. If
     * <code>options.editorView</code> is present then it assigns the
     * corresponding value to <code>this.editorView</code>. If
     * <code>options.editorView</code> does not exist then it a new
     * <code>Editor</code> view is created and assigned to
     * <code>this.editorView</code>. 
     */
    initialize : function(options) {
        var view = this;
        if (options && options.editorView) {
            view.editorView = options.editorView;
        } else {
            view.editorView = new EditorView({
                model : new Vim()
            });
        }
    }

});
