/**
 * @class ApplicationView
 * @extends Backbone.View
 * @description Primarily listens for keyup, keydown, and keypress events
 * and sends them to the EditorView as appropriate.
 */
var ApplicationView = Backbone.View.extend({

    el : 'body',

    disregardKey : true,

    events : {
        keydown: function(e) {
            var key = null;
            switch(e.which) {
                case 190:
                    // The dot '.'
                    // Trying to cope with Opera.
                    e.preventDefault();
                    key = '.';
                    break;
                case 191:
                    // The slash '/'
                    // Trying to cope with Opera.
                    e.preventDefault();
                    key = '/';
                    break;
                case 32:
                    // The space ' '
                    // Stop page from centering.
                    e.preventDefault();
                    key = ' ';
                    break;
                case 37:
                    key = 'LARROW';
                    break;
                case 38:
                    key = 'UARROW';
                    break;
                case 39:
                    key = 'RARROW';
                    break;
                case 40:
                    key = 'DARROW';
                    break;
                case 27:
                    key = 'ESC';
                    break;
                case 8:
                    e.preventDefault();
                    key = 'BACKSPACE';
                    break;
                case 13:
                    e.preventDefault();
                    key = 'ENTER';
                    break;
                case 46:
                    key = 'DEL';
                    break;
                case 9:
                    e.preventDefault();
                    key = 'TAB';
                    break;
                default:
                    key = null;
                    this.disregardKey = false;
            }
            if (key) {
                this.editorView.keyHandler(key);
            }
        },

        keypress: function(e) {
            if (this.disregardKey == false) {
                // Assert: key was not handled by keydown handler.
                this.disregardKey = true;
                e.stopPropagation();
                var key = String.fromCharCode(e.which);
                if (e.which >= 32 && e.which <= 126) {
                    // Assert: the char code corresponds to an ASCII character.
                    key = String.fromCharCode(e.which);
                    this.editorView.keyHandler(key);
                }
            }
        },

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
