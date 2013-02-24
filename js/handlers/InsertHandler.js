/**
 * The Vim INSERT mode handler. This handler simply inserts all received
 * characters into the Vim model's Buffer. Expected properties of args:
 *
 *  vim : Reference to the Vim model
 */
var InsertHandler = function(args) {

    var logger = new Logger({
        module : 'insert|handler',
        prefix : 'INSERT'
    });

    this.vim = args.vim;

    this.getLines = function() {
        return this.vim.get('buffer').get('lines');
    };

    this.row = function() {
        return this.vim.get('row');
    };

    this.col = function() {
        return this.vim.get('col');
    };

    this.done = function() {
        this.vim.trigger('change:buffer');        
    };

    this.receiveKey = function(key) {
        logger.debug('Received key:', key);

        var handler = this;
        var lines = handler.getLines();
        var row = handler.row();
        var col = handler.col();

        switch(key) {
            case Helpers.controlCharacters.ENTER:
                var leftChars = lines[row].substring(0, col);
                var rightChars = lines[row].substring(col);
                lines[row] = leftChars;
                lines.splice(row + 1, 0, rightChars);

                // TODO: Handle positioning better.
                // Set the col position silently. It'll get updated when the
                // buffer updates.
                handler.vim.set({col : 0, row : row + 1}, {silent : true});
                handler.done();
                break;

            case Helpers.controlCharacters.ESC:
                // Trim the extra space being used to render the cursor
                if (lines[row].substring(col) == " ")
                    lines[row] = lines[row].trimRight();

                // Move the cursor one space to the left if possible
                if (col > 0)
                    col--;

                // Set the col position silently. It'll get triggered when
                // the mode changes.
                handler.vim.set({col : col}, {silent : true});

                var mode = Helpers.modeNamesByKey[key];
                logger.info('Setting Vim mode to ' + mode + ' from INSERT');
                handler.vim.changeMode(mode);
                break;

            case Helpers.controlCharacters.BACKSPACE:
                if (col == 0 && row == 0) {
                    logger.debug('Backspacing from position (1, 1); not moving');
                    handler.done();

                } else if (col == 0 && row != 0) {
                    // Assert: we're at the beginning of a line but can
                    // backspace up into another line.
                    var newCursorCol = lines[row - 1].length;

                    // Concatenate text from handler row to the end of the
                    // previous row.
                    lines[row - 1] = lines[row - 1].concat(lines[row]);

                    // Remove handler row
                    lines.splice(row, 1);
                    // TODO: Figure out how to handle column positioning
                    handler.vim.set({
                        row : row - 1,
                        col : newCursorCol
                    });
                    handler.done();

                } else {
                    var newCursorCol = Math.max(0, col - 1);
                    var leftChars = lines[row].substring(0, newCursorCol);
                    var rightChars = lines[row].substring(col);
                    lines[row] = leftChars + rightChars;
                    handler.vim.set({
                        col : newCursorCol
                    });
                    handler.done();
                }
                break;

            case Helpers.controlCharacters.DELETE:
                var leftChars = lines[row].substring(0, col);
                var rightChars = lines[row].substring(col + 1);
                var cursorChar = lines[row].charAt(col);
                logger.debug(sprintf('Left, cursor, right: [%s] [%s] [%s]', leftChars, cursorChar, rightChars));
                if (rightChars == "" && cursorChar == " " && row == (lines.length - 1)) {
                    logger.info('Received DELETE from end of last line. Doing nothing');
                    // Assert: we're on the end of the last line. Do
                    // nothing.
                } else if (rightChars == "" && row == (lines.length - 1)) {
                    logger.info('Received DELETE from last char of last line. Removing character under cursor but not slurping.');
                    // Assert: deleting the last character of the last line.
                    // Remove it, but know that there isn't a next line to
                    // slurp.
                    lines[row] = leftChars + " ";
                } else if (rightChars == "" && cursorChar == " ") {
                    logger.info('Received DELETE from end of line. Slurping next line.');
                    // Assert: there is nothing left on this line. Start
                    // deleting from the next line's contents.  Remember to
                    // delete the space which is making it possible to
                    // render the cursor. If the next line is empty, add a
                    // space to render the cursor.
                    lines[row] = leftChars + (lines[row + 1] || " ");
                    // Remove the next line (which was slurped into this one)
                    lines.splice(row + 1, 1);
                } else {
                    logger.info('Received DELETE from middle of line');
                    // Assert: the easy case. The cursor is somewhere in the
                    // middle of the line and there's stuff to delete.

                    // As per Vim behavior, if there is nothing on the right
                    // side of the cursor, keep it at the current position
                    // anyway and use a space to maintain it.
                    if (rightChars == "")
                        rightChars = " ";
                    lines[row] = leftChars + rightChars;
                    col = Math.min(lines[row].length - 1, col);
                }

                handler.vim.set({
                    col : col
                });
                handler.done();
                break;

            case Helpers.controlCharacters.LARROW:
            case Helpers.controlCharacters.RARROW:
            case Helpers.controlCharacters.UARROW:
            case Helpers.controlCharacters.DARROW:
                // A  bit of hack: send arrow commands directly to
                // NormalHandler to let it deal with all the motion logic.
                // NormalHandler clears out the statusBar after each
                // successful motion, so we'll manually set it back when
                // we're done.
                logger.debug('Sending an ' + key + ' motion directly to NORMAL handler');
                vim.get('normalHandler').receiveKey(key);
                vim.set({statusBar : '-- INSERT --'});
                break;

            default:
                var rowIndex = handler.row();
                var colIndex = handler.col();
                var leftChars = lines[rowIndex].substring(0, colIndex);
                var rightChars = lines[rowIndex].substring(colIndex);
                lines[rowIndex] = leftChars + key + rightChars;
                handler.vim.set({
                    col : colIndex + 1
                });
                handler.done();
        }
    };
};
