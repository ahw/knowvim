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
    console : '#console',
    cursor : {
        openingTag : '<span id="cursor_char">',
        closingTag : '</span>'
    },
    logger : new Logger({
        module : 'editor|view',
        prefix : 'EDITOR'
    }),

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
        var logger = this.logger;
        if (options && options.model) {
            view.model = options.model; // Assume model is a Vim.
        } else {
            view.model = new Vim();
        }

        view.model.on('change:buffer', function() {
            // TODO: call renderBuffer instead.
            view.renderEntireBuffer();
            view.updateCursor();
        });

        view.model.on('change:row change:col', function() {
            view.updateRowAndColCounters();
            view.updateCursor();
        });

        view.model.on('change:mode', function() {
            view.renderStatusBar();
        });

        view.model.on('change:statusBar', function() {
            logger.debug('Rendering status bar');
            view.renderStatusBar();
        });

        view.model.on('change:statusBarCol', function() {
            logger.warn('Status bar cursor position has changed, but doing nothing');
            // --- view.updateStatusBarCursor();
        });

        view.model.on('change:console', function() {
            logger.debug('Rendering console');
            view.renderConsole();
        });
    },

    /**
     * @method updateCursor Renders the cursor block at the position given
     * by "cursorRow" and "cursorCol".
     */
    updateCursor : function() {
        var row = this.model.get('row'); // The row we're moving to
        var col = this.model.get('col'); // The col we're moving to
        var cursorRow = this.model.get('cursorRow'); // The current row position of the cursor
        var cursorCol = this.model.get('cursorCol'); // The current col position of the cursor
        this.logger.info("Updating cursor to (" + row + ", " + col + ")");

        var currentLine, newLine;
        // Get the text of the current line. Note that <span> tags will be
        // automatically removed using jQuery's text() function.
        currentLine = $($('.line')[cursorRow]).text();
        this.logger.debug('Current line = "' + currentLine + '"');

        // If we're jumping to a new line, put the clean contents back into
        // `cursorRow` and pull out the contents in `row`. Otherwise, just
        // re-use the contents in `cursorRow`.
        if (cursorRow != row) {
            if (currentLine == " ") {
                this.logger.debug('Converting space to empty string (mutating markup only).');
                currentLine = "";
            }

            $($('.line')[cursorRow]).html(currentLine);
            newLine = $($('.line')[row]).text();
            this.logger.debug('Jumping to a new line: "' + newLine + '"');
        } else {
            newLine = currentLine;
            this.logger.debug('Moving within same lines = "' + newLine + '"');
        }
        // Add cursor tags to the new line.
        newLine = this.addCursorTags({
            line : newLine,
            row : row,
            col : col
        });
        $($('.line')[row]).html(newLine);

        // Make the current row and col positions the new cursorRow and
        // cursorCol positions.
        this.model.set({
            cursorRow : row,
            cursorCol : col
        });
    },

    /**
     * @method updateStatusBarCursor Renders the cursor block at the
     * position given by "statusBarCol".
     */
    updateStatusBarCursor : function() {
        var col = this.model.get('statusBarCol');
        var statusBar = this.model.get('statusBar');
        // Sort of abusing the addCursorTags function. If we call it with
        // null as the 'row' argument then nothing bad should happen.
        var statusBar = this.addCursorTags({
            line : statusBar,
            row : null,
            col : col
        });
        this.model.set({ statusBar : statusBar });
    },

    /**
     * @method convertEmptyToSpace Helper function for converting an empty
     * string in a `Buffer` to a single space. This is done because the
     * cursor needs at least one character to be visible.
     */
    convertEmptyToSpace : function(index) {
        this.logger.error('Converting empty to space at line #' + (index + 1));
        this.model.get('buffer').get('lines')[index] = " ";
    },

    /**
     * @method addCursorTags Helper function for adding the cursor's
     * `span` tags around the character at the current `col` position.
     */
    addCursorTags : function(args) {
        if (args.line) {
            var leftSide = args.line.substring(0, args.col);
            var middle = args.line.charAt(args.col);
            var rightSide = args.line.substring(args.col + 1, args.line.length);
            var newContents = leftSide
                + this.cursor.openingTag
                + middle
                + this.cursor.closingTag
                + rightSide;
            return newContents;
        } else {
            // this.convertEmptyToSpace(args.row);
            this.logger.debug('Rendering the curosr on an empty line');
            return this.cursor.openingTag + ' ' + this.cursor.closingTag;
        }
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
        $(this.statusBar).html(this.model.get('statusBar'));
    },

    /**
     * @method renderEntireBuffer Renders the "buffer" section of the
     * EditorView.  Iterates through
     * <code>this.model.get('buffer').get('lines')</code>, wraps the
     * contents with appropriate HTML markup tags, and inserts the entire
     * chunk into <code>this.buffer</code>.
     */
    renderEntireBuffer : function() {
        this.logger.debug('Rendering entire buffer');
        var markup = "";
        var lines = this.model.get('buffer').get('lines');

        // If the buffer has been cleared (i.e., lines.length == 0), then we
        // have to manually insert a single line here.
        if (lines.length == 0)
            markup = sprintf('<pre class="num">%3d</pre><pre class="line">%s</pre>\n', 1, "");

        for (var i = 0; i < lines.length; i++) {
            this.logger.debug(sprintf('Rendering %3d %s', i+1, lines[i]));
            markup += sprintf('<pre class="num">%3d</pre><pre class="line">%s</pre>\n', i+1, lines[i]);
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
            this.logger.info(sprintf('Re-rendering line %s: %s', lineIndex, this.model.get('buffer').get('lines')[lineIndex]));
        });
    },

    /**
     * @method renderConsole
     */
    renderConsole : function() {
        this.logger.debug('Called renderConsole');
        var markup = "";
        var console = this.model.get('console');
        console.forEach(function(line) {
            markup += sprintf('<pre class="console-line">%s</pre>\n', line);
        });
        this.logger.debug('Markup for rendering console given below');
        this.logger.debug(markup);
        $(this.console).html(markup);
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
        this.model.receiveKey(key);
    }

});
