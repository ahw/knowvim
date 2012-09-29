/**
 * @class EditorView
 * @extends Backbone.View
 */
var EditorView = Backbone.View.extend({

    el : '#vimwindow',
    buffer : '#buffer',
    statusBar : '#statusbar',
    row : '#row',
    col : '#col',

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
            view.model = options.model; // Assume model is a Vim.
        } else {
            view.model = new Vim();
        }

        view.model.on('change', function() {
            view.renderBuffer();
        });

        view.model.on('change:row change:col', function() {
            view.updateRowAndColCounters();
            // view.updateCursor();
        });

        view.model.on('change:mode', function() {
            view.renderStatusBar();
        });

    },

    /**
     * @method updateCursor Renders the cursor block by first removing the
     * `span` tags around the old  character and wrapping the current
     * character in `span` tags.
     */
    updateCursor : function() {
        var row = this.model.get('row');
        var col = this.model.get('col');
        var cursorRow = this.model.get('cursorRow');
        var cursorCol = this.model.get('cursorCol');
        console.log("Old cursor position : " + cursorRow + ", " + cursorCol);
        console.log("New cursor position : " + row + ", " + col);

        // Remove cursor tags from the current line.
        var currentLine = $($('.line')[cursorRow]).html();
        currentLine = this.removeCursorTags(currentLine);
        $($('.line')[cursorRow]).html(currentLine);

        // Add cursor tags to the new line.
        var newLine = $($('.line')[row]).html();
        newLine = this.addCursorTags(newLine, col);
        $($('.line')[row]).html(newLine);

        // Make the current row and col positions the new cursorRow and
        // cursorCol positions.
        this.model.set({
            cursorRow : row,
            cursorCol : col
        });
    },

    /**
     * @method addCursorTags Helper function for adding the cursor's
     * `span` tags around the character at the current `col` position.
     */
    addCursorTags : function(line, col) {

        var leftSide = line.substring(0, col);
        var middle = line.charAt(col);
        var rightSide = line.substring(col + 1, line.length);
        var newContents = leftSide
                         + '<span id="cursor_char">' + middle + '</span>'
                         + rightSide;
        return newContents;
    },

    /**
     * @method removeCursorTags Helper function for removing the `span`
     * tags from a `line` of text.
     */
    removeCursorTags : function(line) {

        // TODO: Put this magic text in a variable.
        var spanOpen = line.indexOf('<span id="cursor_char">');
        if (spanOpen == -1) {
            return line;
        }

        // Get all the text up until the `span` opening tag.
        leftSide = line.substring(0, spanOpen);

        // Get the single character sandwiched between `span` tags.
        // Note: "<span id="cursor_char">".length = 23
        // TODO: Put this magic number in a function.
        middle = line.charAt(spanOpen + 23);

        // Get the rest of the text after the <span> closing tag.
        // Note: "</span>".length = 7
        // TODO: Put this magic text and magic number in a variable and/or
        // function.
        spanClose = line.indexOf("</span>");
        rightSide = line.substring(spanClose + 7, line.length);
        return leftSide + middle + rightSide;
    },

    /**
     * @method updateRowAndColCounters Renders the row and column position
     * indicators at the bottom of the editor window.
     */
    updateRowAndColCounters : function() {
        $(this.row).html(this.model.get('row') + 1);
        $(this.col).html(this.model.get('col') + 1);
    },

    renderStatusBar : function() {
        $(this.statusBar).html(this.model.get('statusBarText'));
    },

    /**
     * @method render Renders the "buffer" section of the EditorView.
     * Iterates through <code>this.model.get('buffer').get('lines')</code>,
     * wraps the contents with appropriate HTML markup tags, and inserts the
     * entire chunk into <code>this.buffer</code>.
     */
    renderBuffer : function() {

        var markup = "";
        var lines = this.model.get('buffer').get('lines');
        for (var i = 0; i < lines.length; i++) {
            markup += sprintf("<pre class=\"num\">%3d</pre><pre class=\"line\">%s</pre>\n", i+1, lines[i]);
        }
        $(this.buffer).html(markup);
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
