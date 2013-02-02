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
        switch(key) {
            case Helpers.controlCharacters.ESC:
                var mode = Helpers.modeNamesByKey[key];
                logger.log('Setting Vim mode to "' + mode + '" from INSERT');
                this.vim.changeMode(mode);
                break;

            case Helpers.controlCharacters.BACKSPACE:
                var lines = this.getLines();
                var cursorRow = this.getCursorRow();
                var cursorCol = this.getCursorCol();
                if (cursorCol == 0 && cursorRow == 0) {
                    logger.debug('Backspacing from position (1, 1); not moving');
                    this.done();

                } else if (cursorCol == 0 && cursorRow != 0) {
                    // Assert: we're at the beginning of a line but can
                    // backspace up into another line.
                    var newCursorCol = lines[cursorRow - 1].length;

                    // Concatenate text from this row to the end of the
                    // previous row.
                    lines[cursorRow - 1] = lines[cursorRow - 1].concat(lines[cursorRow]);

                    // Remove this row
                    lines.splice(cursorRow, 1);
                    // TODO: Figure out how to handle column positioning
                    this.vim.set({
                        row : cursorRow - 1,
                        col : newCursorCol
                    });
                    this.done();

                } else {
                    var newCursorCol = Math.max(0, cursorCol - 1);
                    var leftChars = lines[cursorRow].substring(0, newCursorCol);
                    var rightChars = lines[cursorRow].substring(cursorCol);
                    lines[cursorRow] = leftChars + rightChars;
                    this.vim.set({
                        col : newCursorCol
                    });
                    this.done();
                }
                break;

            case Helpers.controlCharacters.DELETE:
                var lines = this.getLines();
                var cursorRow = this.getCursorRow();
                var cursorCol = this.getCursorCol();
                var leftChars = lines[cursorRow].substring(0, cursorCol);
                var rightChars = lines[cursorRow].substring(cursorCol + 1);
                var cursorChar = lines[cursorRow].charAt(cursorCol);
                logger.debug(sprintf('Left, cursor, right: [%s] [%s] [%s]', leftChars, cursorChar, rightChars));
                if (rightChars == "" && cursorChar == " " && cursorRow == (lines.length - 1)) {
                    logger.info('Received DELETE from end of (last) line. Doing nothing');

                    // Assert: we're on the end of the last line. Do
                    // nothing.
                } else if (rightChars == "" && cursorRow == (lines.length - 1)) {
                    logger.info('Received DELETE from end of last line. Not slurping.');
                    // Assert: deleting the last character of the last line.
                    // Remove it, but know that there isn't a next line to
                    // slurp.
                    lines[cursorRow] = leftChars;
                    cursorCol--;
                } else if (rightChars == "") {
                    logger.info('Received DELETE from end of line. Slurping next line.');
                    // Assert: there is nothing left on this line. Start
                    // deleting from the next line's contents.  Remember to
                    // delete the space which is making it possible to
                    // render the cursor.
                    lines[cursorRow] = leftChars + lines[cursorRow + 1];
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

                this.vim.set({
                    col : cursorCol
                });
                this.done();
                break;

            default:
                var lines = this.getLines();
                var rowIndex = this.vim.get('cursorRow');
                var colIndex = this.vim.get('cursorCol');
                var leftChars = lines[rowIndex].substring(0, colIndex);
                var rightChars = lines[rowIndex].substring(colIndex);
                lines[rowIndex] = leftChars + key + rightChars;
                this.vim.set({
                    col : colIndex + 1
                });
                this.done();
        }
    };
};
