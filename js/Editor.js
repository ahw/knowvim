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
        console.log("EditorView >>> initialize()");
        if (options && options.model) {
            view.model = options.model;
        } else {
            view.model = new Vim();
        }

        view.model.on('change', function() {
            console.log("EditorView >>> change event");
            view.render();
            console.log("EditorView <<< change event");
        });

        console.log("EditorView <<< initialize()");
    },

    /**
     * @method render Renders the EditorView view. Iterates through
     * <code>this.model.get('buffer').get('lines')</code>, wraps the
     * contents with appropriate HTML markup tags, and inserts the entire
     * chunk into <code>this.el</code>.
     */
    render : function() {

        console.log("Editor >>> render()");
        var markup = "";
        var lines = this.model.get('buffer').get('lines');
        for (var i = 0; i < lines.length; i++) {
            markup += sprintf("<pre class=\"num\">%3d</pre><pre class=\"line\">%s</pre>\n", i+1, lines[i]);
            console.log(sprintf("%3d %s", i+1, lines[i]));
        }
        this.$el.html(markup);
        console.log("Editor <<< render()");
        return this;
    }

});
