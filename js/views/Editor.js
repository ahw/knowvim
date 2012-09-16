/**
 * @class EditorView
 * @extends Backbone.View
 */
var EditorView = Backbone.View.extend({

    el : '#vimwindow',

    /**
     * @method initialize The EditorView constructor.  If
     * <code>options.model</code> exists, then it assigns the
     * corresponding value to <code>this.model</code>. If
     * <code>options.model</code> does not exist then a new
     * <code>Vim</code> model is created and assigned to
     * <code>this.model</code>
     */
    initialize : function(options) {

        var view = this;
        if (options && options.model) {
            view.model = options.model;
        } else {
            view.model = new Vim();
        }

        view.model.on('change', function() {
            view.render();
        });

    },

    /**
     * @method render Renders the EditorView view. Iterates through
     * <code>this.model.get('buffer').get('lines')</code>, wraps the
     * contents with appropriate HTML markup tags, and inserts the entire
     * chunk into <code>this.el</code>.
     */
    render : function() {

        var markup = "";
        var lines = this.model.get('buffer').get('lines');
        for (var i = 0; i < lines.length; i++) {
            markup += sprintf("<pre class=\"num\">%3d</pre><pre class=\"line\">%s</pre>\n", i+1, lines[i]);
        }
        this.$el.html(markup);
        return this;
    },

    /**
     * @method keyHandler Handles character input events. Accepts normal
     * alphanumeric characters as well as the special
     * <code>BACKSPACE</code>, <code>DEL</code>, <code>TAB</code>, etc.,
     * strings returned by the <code>ApplicationView</code>'s keydown
     * handler. This function simply passes the <code>key</code> to
     * <code>this.model.keyHandler(key)</code>. Recall that
     * <code>this.model</code> is a <code>Vim</code> model.
     */
    keyHandler : function(key) {
        this.model.keyHandler(key);
    }

});
