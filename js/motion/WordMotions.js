var WordMotions = {

    logger : new Logger({
        prefix : 'MOTION (WORD)',
        module : 'motion'
    }),

    BLANK_CHAR     : /\s/,
    SPECIAL_CHAR   : /[^\w\s]/,
    ALPHA_NUM_CHAR : /\w/,
    NON_BLANK_CHAR : /[^\s]/,

    /**
     * Get the position of the next w motion.
     *
     * :help w
     * -------
     * A word consists of a sequence of letters, digits and
     * underscores, or a sequence of other non-blank characters,
     * separated with white space (spaces, tabs, <EOL>).  This
     * can be changed with the 'iskeyword' option.  An empty
     * line is also considered to be a word.
     *
     * Expected properties of args:
     *
     *  startRow : The starting row position
     *  startCol : The starting col positino
     *  lines : An array of Strings representing the buffer
     *  motionResult : The motion result object to mutate
     */
    w : function(args) {
        var startRow = args.startRow;
        var startCol = args.startCol;
        var lines = args.lines;
        var motionResult = args.motionResult;

        var rowOffset = 0;
        var colOffset = 0;
        var line = lines[startRow];
        var rightChars = line.substring(startCol);
        var ch = rightChars.charAt(0);
        var charType = this.getCharacterType(ch); // This will get changed soon.
        var prevChar = ch; // Just for convenience
        var prevCharType = charType;
        var foundNextPosition = false;

        while (foundNextPosition == false) {
            if (rightChars == "") {
                this.logger.warn('Have examined all characters in this line and still not found next w position');
                this.logger.error('No implementation to handle EOL state');
            }

            rightChars = rightChars.substring(1);
            ch = rightChars.charAt(0);
            charType = this.getCharacterType(ch);
            colOffset++;

            this.logger.debug(sprintf('Entering w-motion FSM with prevChar=%s (%s), currentChar=%s (%s)', prevChar, prevCharType, ch, charType));
            switch(prevCharType) {
            case 'WORD':
                if (charType == 'WORD') {
                    // Nothing.
                } else if (charType == 'BLANK') {
                    prevCharType = 'BLANK';
                } else if (charType == 'SPECIAL') {
                    foundNextPosition = true;
                } else {
                    this.logger.error('Invalid character type "' + charType + '"');
                }
                break;

            case 'BLANK':
                if (charType == 'WORD') {
                    foundNextPosition = true;
                } else if (charType == 'BLANK') {
                    // Nothing.
                } else if (charType == 'SPECIAL') {
                    foundNextPosition = true;
                } else {
                    this.logger.error('Invalid character type "' + charType + '"');
                }
                break;

            case 'SPECIAL':
                if (charType == 'WORD') {
                    foundNextPosition = true;
                } else if (charType == 'BLANK') {
                    prevCharType = 'BLANK';
                } else if (charType == 'SPECIAL') {
                    // Nothing.
                } else {
                    this.logger.error('Invalid character type "' + charType + '"');
                }
                break;
            }
            prevCharType = charType;
            prevChar = ch;
        }

        // At this point we've found the next position!
        this.logger.debug('Found the next w position!');
        this.logger.debug(lines[startRow]);
        this.logger.debug(Helpers.getPositionMarkerString(startCol, startCol + colOffset, lines[startRow]));

        motionResult.endRow = startRow + rowOffset;
        motionResult.endCol = startCol + colOffset;
        motionResult.higherPosition.row = startRow + rowOffset;
        motionResult.higherPosition.col = startCol + colOffset;
    },

    getCharacterType : function(ch) {
        var charType;
        if (Helpers.characterTypes.SPECIAL.test(ch)) {
            charType = 'SPECIAL';
        } else if (Helpers.characterTypes.WORD.test(ch)) {
            charType = 'WORD';
        } else if (Helpers.characterTypes.BLANK.test(ch)) {
            charType = 'BLANK';
        } else {
            this.logger.error('Unknown character type for "' + ch + '"');
            throw new Error('Invalid character type while computing w motion');
        }
        return charType;
    },

    // --- w_old : function(args) {
    // ---     var cursorChar = lines[startRow].charAt(startCol);
    // ---     var prevChar = startCol > 0 ? lines[startRow].charAt(startCol - 1) : "";
    // ---     var BLANK_CHAR = this.BLANK_CHAR,
    // ---         SPECIAL_CHAR = this.SPECIAL_CHAR,
    // ---         ALPHA_NUM_CHAR = this.ALPHA_NUM_CHAR;
    // ---         NON_BLANK_CHAR = this.NON_BLANK_CHAR;

    // ---     var nextWordRe = null;

    // ---     if (!ALPHA_NUM_CHAR.test(prevChar) && ALPHA_NUM_CHAR.test(cursorChar)) {
    // ---         // Cursor is on the beginning of an alphanumeric word. Next word
    // ---         // can be any word.
    // ---         nextWordRe = NON_BLANK_CHAR;

    // ---     } else if (ALPHA_NUM_CHAR.test(prevChar) && APHA_NUM_CHAR.test(cursorChar)) {
    // ---         // Cursor is in the middle of an alphanumeric word. Next word
    // ---         // will be a special character word.
    // ---         nextWordRe = SPECIAL_CHAR;
    // ---     } else if (SPECIAL_CHAR.test(cursorChar)) {
    // ---         // Cursor is on a special character word. Next word will
    // ---         // be an alphanumeric word.
    // ---         nextWordRe = /\w/;
    // ---     } else if (/\s/.test(cursorChar)) {
    // ---         // Cursor is on whitespace. Next word can any
    // ---         // non-whitespace word.
    // ---         nextWordRe = /[^\s]/;
    // ---     }
    // ---     this.logger.debug('Cursor is on character "' + cursorChar + '". Next word will match regexp ' + nextWordRe);

    // ---     var line = lines[startRow],
    // ---         searchOffset = startCol + 1,
    // ---         rightChars = line.substring(searchOffset),
    // ---         isLastLine = (startRow == lines.length - 1),
    // ---         nextLineIsEmpty = isLastLine ? false : /^\s?$/.test(lines[startRow + 1]);

    // ---     this.logger.debug('Result of isLastLine =>', isLastLine);
    // ---     this.logger.debug('Result of nextLineIsEmpty =>', nextLineIsEmpty);
    // ---     this.logger.debug('Searching for next word in substring:', rightChars);
    // ---     var wordIndex = rightChars.search(nextWordRe);
    // ---     if (wordIndex >= 0) {
    // ---         motionResult.endCol = wordIndex + searchOffset;
    // ---         motionResult.higherPosition.col = wordIndex + searchOffset;
    // ---         this.logger.debug('Found next word on same line');
    // ---         this.logger.debug(line);
    // ---         this.logger.debug(Helpers.getPositionMarkerString(startCol, wordIndex + searchOffset, line));
    // ---     } else if (!isLastLine && nextLineIsEmpty) {
    // ---         motionResult.endRow = startRow + 1;
    // ---         motionResult.endCol = 0;
    // ---         motionResult.higherPosition.row = startRow + 1;
    // ---         motionResult.higherPosition.col = 0;
    // ---         this.logger.debug('Found next word on next line (which is empty)');
    // ---     } else if (!isLastLine && !nextLineIsEmpty) {
    // ---         var newWordIndex = lines[startRow + 1].search(/[^\s]/);
    // ---         motionResult.endRow = startRow + 1;
    // ---         motionResult.higherPosition.row = startRow + 1;
    // ---         motionResult.endCol = newWordIndex;
    // ---         motionResult.higherPosition.col = newWordIndex;
    // ---         this.logger.debug('Found next word on next line at column ' + newWordIndex);
    // ---         this.logger.debug(lines[startRow + 1]);
    // ---         this.logger.debug(Helpers.getPositionMarkerString(0, newWordIndex, lines[startRow + 1]));
    // ---     } else if (isLastLine) {
    // ---         motionResult.endCol = line.length - 1;
    // ---         motionResult.higherPosition.col = line.length - 1;
    // ---         motionResult.hitEol = true;
    // ---         this.logger.debug('There is no next word! On the last line. Setting position to end of line.');
    // ---     }
    // --- }
};
