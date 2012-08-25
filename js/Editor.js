/**
 * @class EditorView
 * @extends Backbone.View
 */
var EditorView = Backbone.View.extend({

    el : '#vimwindow',

    /**
     * @method initialize The EditorView constructor.  If
     * <code>options.buffer</code> exists, then it assigns the
     * corresponding value to <code>this.buffer</code>. If
     * <code>options.buffer</code> does not exist then a new
     * <code>Buffer</code> model is created and assigned to
     * <code>this.buffer</code>
     */
    initialize : function(options) {

        if (options && options.buffer) {
            this.buffer = options.buffer;
        } else {
            this.buffer = new Buffer();
        }
    },

    /**
     * @method render Renders the EditorView view. Iterates through
     * <code>this.buffer.get('lines')</code>, wraps the contents with
     * appropriate HTML markup tags, and inserts the entire chunk into
     * <code>this.el</code>.
     */
    render : function() {

        var markup = "";
        var lines = this.buffer.get('lines');
        for (var i = 0; i < lines.length; i++) {
            markup += sprintf("<pre class=\"num\">%3d</pre><pre class=\"line\">%s</pre>\n", i+1, lines[i]);
            console.log(sprintf("%3d %s", i+1, lines[i]));
        }
        this.$el.html(markup);
        return this;
    }

});
