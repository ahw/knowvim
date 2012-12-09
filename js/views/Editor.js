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
            view.bufferModel = options.model.get('buffer');
        } else {
            view.model = new Vim();
        }

        view.model.on('change:buffer', function() {
            // TODO: call renderBuffer instead.
            view.renderEntireBuffer();
        });

        view.model.on('change:row change:col', function() {
            view.updateRowAndColCounters();
            view.updateCursor();
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
        // console.log("Updating cursor to (" + row + ", " + col + ")");

        var currentLine, newLine;
        // Remove cursor tags from the current line.
        currentLine = $($('.line')[cursorRow]).html();
        currentLine = this.removeCursorTags(currentLine);

        // If we're jumping to a new line, put the clean contents back into
        // `cursorRow` and pull out the contents in `row`. Otherwise, just
        // re-use the contents in `cursorRow`.
        if (cursorRow != row) {
            $($('.line')[cursorRow]).html(currentLine);
            newLine = $($('.line')[row]).html();
        } else {
            newLine = currentLine;
        }
        // Add cursor tags to the new line.
        newLine = this.addCursorTags(newLine, row, col);
        $($('.line')[row]).html(newLine);

        // Make the current row and col positions the new cursorRow and
        // cursorCol positions.
        this.model.set({
            cursorRow : row,
            cursorCol : col
        });
    },

    /**
     * @method convertEmptyToSpace Helper function for converting an empty
     * string in a `Buffer` to a single space. This is done because the
     * cursor needs at least one character to be visible.
     */
    convertEmptyToSpace : function(index) {
        this.model.get('buffer').get('lines')[index] = " ";
    },

    /**
     * @method addCursorTags Helper function for adding the cursor's
     * `span` tags around the character at the current `col` position.
     */
    addCursorTags : function(line, row, col) {

        if (line) {
            var leftSide = line.substring(0, col);
            var middle = line.charAt(col);
            var rightSide = line.substring(col + 1, line.length);
            var newContents = leftSide + '<span id="cursor_char">' + middle + '</span>' + rightSide;
            return newContents;
        } else {
            this.convertEmptyToSpace(row);
            return '<span id="cursor_char"> </span>';
        }
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
     * @method renderEntireBuffer Renders the "buffer" section of the
     * EditorView.  Iterates through
     * <code>this.model.get('buffer').get('lines')</code>, wraps the
     * contents with appropriate HTML markup tags, and inserts the entire
     * chunk into <code>this.buffer</code>.
     */
    renderEntireBuffer : function() {

        console.log('Rendering entire buffer...');
        var markup = "";
        var lines = this.model.get('buffer').get('lines');
        for (var i = 0; i < lines.length; i++) {
            markup += sprintf("<pre class=\"num\">%3d</pre><pre class=\"line\">%s</pre>\n", i+1, lines[i]);
        }
        $(this.buffer).html(markup);
        return this;
    },

    /**
     * @method renderBuffer Renders the "buffer" section of the EditorView,
     * changing only those lines identified in the Buffer's
     * outOfSyncLineIndices property.
     */
    renderBuffer : function() {

        this.model.get('buffer').get('outOfSyncLineIndices').forEach(function(lineIndex) {
            console.log(sprintf('EDITOR VIEW re-rendering line %s: %s', lineIndex, this.model.get('buffer').get('lines')[lineIndex]));
        });
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
