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

    this.getCursorRow = function() {
        return this.vim.get('cursorRow');
    };

    this.getCursorCol = function() {
        return this.vim.get('cursorCol');
    };

    this.done = function() {
        this.vim.trigger('change:buffer');        
    };

    this.receiveKey = function(key) {
        logger.debug('Received key:', key);

        var handler = this;
        var lines = handler.getLines();
        var cursorRow = handler.getCursorRow();
        var cursorCol = handler.getCursorCol();

        switch(key) {
            case Helpers.controlCharacters.ENTER:
                logger.warn('No implementation for the <CR> key.');
                break;

            case Helpers.controlCharacters.ESC:
                // Trim the extra space being used to render the cursor
                if (lines[cursorRow].substring(cursorCol) == " ")
                    lines[cursorRow] = lines[cursorRow].trimRight();

                // Move the cursor one space to the left if possible
                if (cursorCol > 0)
                    cursorCol--;

                // Set the col position silently. It'll get triggered when
                // the mode changes.
                handler.vim.set({col : cursorCol}, {silent : true});

                var mode = Helpers.modeNamesByKey[key];
                logger.info('Setting Vim mode to "' + mode + '" from INSERT');
                handler.vim.changeMode(mode);
                break;

            case Helpers.controlCharacters.BACKSPACE:
                if (cursorCol == 0 && cursorRow == 0) {
                    logger.debug('Backspacing from position (1, 1); not moving');
                    handler.done();

                } else if (cursorCol == 0 && cursorRow != 0) {
                    // Assert: we're at the beginning of a line but can
                    // backspace up into another line.
                    var newCursorCol = lines[cursorRow - 1].length;

                    // Concatenate text from handler row to the end of the
                    // previous row.
                    lines[cursorRow - 1] = lines[cursorRow - 1].concat(lines[cursorRow]);

                    // Remove handler row
                    lines.splice(cursorRow, 1);
                    // TODO: Figure out how to handle column positioning
                    handler.vim.set({
                        row : cursorRow - 1,
                        col : newCursorCol
                    });
                    handler.done();

                } else {
                    var newCursorCol = Math.max(0, cursorCol - 1);
                    var leftChars = lines[cursorRow].substring(0, newCursorCol);
                    var rightChars = lines[cursorRow].substring(cursorCol);
                    lines[cursorRow] = leftChars + rightChars;
                    handler.vim.set({
                        col : newCursorCol
                    });
                    handler.done();
                }
                break;

            case Helpers.controlCharacters.DELETE:
                var leftChars = lines[cursorRow].substring(0, cursorCol);
                var rightChars = lines[cursorRow].substring(cursorCol + 1);
                var cursorChar = lines[cursorRow].charAt(cursorCol);
                logger.debug(sprintf('Left, cursor, right: [%s] [%s] [%s]', leftChars, cursorChar, rightChars));
                if (rightChars == "" && cursorChar == " " && cursorRow == (lines.length - 1)) {
                    logger.info('Received DELETE from end of last line. Doing nothing');
                    // Assert: we're on the end of the last line. Do
                    // nothing.
                } else if (rightChars == "" && cursorRow == (lines.length - 1)) {
                    logger.info('Received DELETE from last char of last line. Removing character under cursor but not slurping.');
                    // Assert: deleting the last character of the last line.
                    // Remove it, but know that there isn't a next line to
                    // slurp.
                    lines[cursorRow] = leftChars + " ";
                } else if (rightChars == "" && cursorChar == " ") {
                    logger.info('Received DELETE from end of line. Slurping next line.');
                    // Assert: there is nothing left on this line. Start
                    // deleting from the next line's contents.  Remember to
                    // delete the space which is making it possible to
                    // render the cursor. If the next line is empty, add a
                    // space to render the cursor.
                    lines[cursorRow] = leftChars + (lines[cursorRow + 1] || " ");
                    // Remove the next line (which was slurped into this one)
                    lines.splice(cursorRow + 1, 1);
                } else {
                    logger.info('Received DELETE from middle of line');
                    // Assert: the easy case. The cursor is somewhere in the
                    // middle of the line and there's stuff to delete.

                    // As per Vim behavior, if there is nothing on the right
                    // side of the cursor, keep it at the current position
                    // anyway and use a space to maintain it.
                    if (rightChars == "")
                        rightChars = " ";
                    lines[cursorRow] = leftChars + rightChars;
                    cursorCol = Math.min(lines[cursorRow].length - 1, cursorCol);
                }

                handler.vim.set({
                    col : cursorCol
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
                var rowIndex = handler.getCursorRow();
                var colIndex = handler.getCursorCol();
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
