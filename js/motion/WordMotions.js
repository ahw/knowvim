var WordMotions = {

    logger : new Logger({
        prefix : 'MOTION (WORD)',
        module : 'motion'
    }),

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
        var row = args.startRow;
        var col = args.startCol;
        var lines = args.lines;
        var motionResult = args.motionResult;

        var line = lines[row];
        var rightChars = line.substring(col);
        var ch = rightChars.charAt(0);
        var charType = this.getCharacterType(ch);
        // Keeping track of previous character just for the purposes of
        // logging.
        var prevChar = null;
        var prevCharType = this.getCharacterType(prevChar);
        var foundNextPosition = false;

        // Column position decremented by 1 to accomodate for the
        // incrementing logic in the while loop below.
        col--;

        while (foundNextPosition == false) {
            if (rightChars == "") {
                this.logger.warn('Have examined all characters in this line and still not found next w position');
                // this.logger.error('No implementation to handle EOL state');
                // throw new Error('Exiting w-motion early');
            }

            // Get the first character
            ch = rightChars.charAt(0);
            charType = this.getCharacterType(ch);
            // Chop off the first character which we just read
            rightChars = rightChars.substring(1);
            col++;

            this.logger.debug(sprintf('Entering w-motion FSM with prevChar=%s (%s), currentChar=%s (%s)', prevChar, prevCharType, ch, charType));
            switch(prevCharType) {
            case 'NULL':
                if (charType == 'WORD') {
                    // Nothing
                } else if (charType == 'BLANK') {
                    // Nothing
                } else if (charType == 'SPECIAL') {
                    // Nothing
                } else if (charType == 'EMPTY') {
                    // Take the contents of the next line.
                    row++;
                    col = -1;
                    rightChars = lines[row];
                } else {
                    this.logger.error('Invalid character type "' + charType + '"');
                }
                break;

            case 'WORD':
                if (charType == 'WORD') {
                    // Nothing.
                } else if (charType == 'BLANK') {
                    // Nothing
                } else if (charType == 'SPECIAL') {
                    foundNextPosition = true;
                } else if (charType = 'EMPTY') {
                    // Take the contents of the next line.
                    row++;
                    col = -1;
                    rightChars = lines[row];
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
                } else if (charType = 'EMPTY') {
                    // Take the contents of the next line.
                    row++;
                    col = -1;
                    rightChars = lines[row];
                } else {
                    this.logger.error('Invalid character type "' + charType + '"');
                }
                break;

            case 'SPECIAL':
                if (charType == 'WORD') {
                    foundNextPosition = true;
                } else if (charType == 'BLANK') {
                    // Nothing
                } else if (charType == 'SPECIAL') {
                    // Nothing.
                } else if (charType = 'EMPTY') {
                    // Take the contents of the next line.
                    row++;
                    col = -1;
                    rightChars = lines[row];
                } else {
                    this.logger.error('Invalid character type "' + charType + '"');
                }
                break;

            case 'EMPTY':
                if (charType == 'WORD') {
                    foundNextPosition = true;
                } else if (charType == 'BLANK') {
                    // Nothing
                } else if (charType == 'SPECIAL') {
                    foundNextPosition = true;
                } else if (charType = 'EMPTY') {
                    foundNextPosition = true;
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
        this.logger.debug(lines[row]);
        this.logger.debug(Helpers.getPositionMarkerString(col, lines[row]));

        motionResult.endRow = row;
        motionResult.endCol = col;
        motionResult.higherPosition.row = row;
        motionResult.higherPosition.col = col;
    },

    getCharacterType : function(ch) {
        var charType;
        if (ch == null) {
            charType = 'NULL';
        } else if (Helpers.characterTypes.SPECIAL.test(ch)) {
            charType = 'SPECIAL';
        } else if (Helpers.characterTypes.WORD.test(ch)) {
            charType = 'WORD';
        } else if (Helpers.characterTypes.BLANK.test(ch)) {
            charType = 'BLANK';
        } else if (Helpers.characterTypes.EMPTY.test(ch)) {
            charType = 'EMPTY';
        } else {
            this.logger.error('Unknown character type for "' + ch + '"');
            throw new Error('Invalid character type while computing w motion');
        }
        return charType;
    }

};
