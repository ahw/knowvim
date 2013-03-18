var WordMotions = function () {
    var LOG = new Logger({
        prefix : 'WORD-MOTION',
        module : 'motion'
    });

    function getCharacterType (ch) {
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
            LOG.error('Unknown character type for "' + ch + '"');
            throw new Error('Invalid character type while computing w motion');
        }
        return charType;
    };

    return {
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
            var row = args.startRow
              , col = args.startCol
              , lines = args.lines
              , motionResult = args.motionResult;

            var line = lines[row]
              , rightChars = line.substring(col)
              , ch = rightChars.charAt(0)
              , charType = getCharacterType(ch);
            // Keeping track of previous character just for the purposes of
            // logging.
            var prevChar = null
              , prevCharType = getCharacterType(prevChar)
              , foundNextPosition = false;

            // Column position decremented by 1 to accomodate for the
            // incrementing logic in the while loop below.
            col--;

            while (foundNextPosition == false) {
                if (row > lines.length - 1) {
                    // Assert: we've scanned all the characters on the last
                    // line. There are no more rows!
                    LOG.debug('w-motion has hit EOF; set position to last row and col');
                    row = args.startRow;
                    col = Math.max(0, lines[args.startRow].length - 1);
                    motionResult.hitEol = true;
                    break;
                }

                // Get the first character
                ch = rightChars.charAt(0);
                charType = getCharacterType(ch);
                // Chop off the first character which we just read
                rightChars = rightChars.substring(1);
                col++;

                LOG.debug(sprintf('Entering w-motion FSM with prevChar= %s (%s) currentChar=%s (%s)', prevChar, prevCharType, ch, charType));
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
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;

                case 'WORD':
                    if (charType == 'WORD') {
                        // Nothing.
                    } else if (charType == 'BLANK') {
                        // Nothing
                    } else if (charType == 'SPECIAL') {
                        foundNextPosition = true;
                    } else if (charType == 'EMPTY') {
                        // Take the contents of the next line.
                        row++;
                        col = -1;
                        rightChars = lines[row];
                    } else {
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;

                case 'BLANK':
                    if (charType == 'WORD') {
                        foundNextPosition = true;
                    } else if (charType == 'BLANK') {
                        // Nothing.
                    } else if (charType == 'SPECIAL') {
                        foundNextPosition = true;
                    } else if (charType == 'EMPTY') {
                        // Take the contents of the next line.
                        row++;
                        col = -1;
                        rightChars = lines[row];
                    } else {
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;

                case 'SPECIAL':
                    if (charType == 'WORD') {
                        foundNextPosition = true;
                    } else if (charType == 'BLANK') {
                        // Nothing
                    } else if (charType == 'SPECIAL') {
                        // Nothing.
                    } else if (charType == 'EMPTY') {
                        // Take the contents of the next line.
                        row++;
                        col = -1;
                        rightChars = lines[row];
                    } else {
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;

                case 'EMPTY':
                    if (charType == 'WORD') {
                        foundNextPosition = true;
                    } else if (charType == 'BLANK') {
                        // Nothing
                    } else if (charType == 'SPECIAL') {
                        foundNextPosition = true;
                    } else if (charType == 'EMPTY') {
                        foundNextPosition = true;
                    } else {
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;
                }
                prevCharType = charType;
                prevChar = ch;
            }

            // At this point we've found the next position!
            LOG.debug('Found the next w position!');
            LOG.debug(lines[row]);
            LOG.debug(Helpers.getPositionMarkerString(col, lines[row]));

            motionResult.endRow = row;
            motionResult.endCol = col;
            motionResult.higherPosition.row = row;
            motionResult.higherPosition.col = col;
        },

        /**
         * Get the position of the next b motion.
         *
         * Expected properties of args:
         *  startRow : The starting row position
         *  startCol : The starting col position
         *  lines : An array of Strings representing the Buffer
         *  motionResult : The motino result object to mutate
         */
        b : function(args) {
            var row = args.startRow
              , col = args.startCol
              , lines = args.lines
              , motionResult = args.motionResult;

            var line = lines[row]
              , prevChar = lines[row].charAt(col)
              , prevCharType = getCharacterType(prevChar)
              , leftChars = lines[row].substring(0, col)
              , transitions = 0
              , transitionsNeeded;

            // The next* variables are used in the while loop below. They
            // represent the position of the next character which will be
            // inspected to figure out the b-motion result.
            var nextRow
              , nextCol;

            // Peek at the character to the left of the current one and get
            // its character type. Based on the starting character type and
            // the left neight character type, we'll be looking for a
            // different number of state transitions.
            var neighborChar
              , neighborCharType;
            if (col == 0 && row == 0) {
                // Save ourselves the trouble and just return.
                LOG.debug('Already at position (0, 0); doing nothing.');
                return;
            } else if (col == 0) {
                nextRow = row - 1;
                nextCol = lines[nextRow].length - 1;
                LOG.debug('At first character in the line, left neighbor is EMPTY');
                LOG.debug(sprintf('Setting nextRow = %s, nextCol = %s', nextRow, nextCol));
                var neighborChar = "";
                var neighborCharType = getCharacterType(neighborChar);
            } else {
                nextRow = row;
                nextCol = col;
                LOG.debug('Getting neighbor char type from previous char');
                var neighborChar = lines[row].charAt(col - 1);
                var neighborCharType = getCharacterType(neighborChar);
            }

            switch (prevCharType) {
            case 'WORD':
                if (neighborCharType == 'WORD') {
                    transitionsNeeded = 1;
                } else if (neighborCharType == 'BLANK') {
                    transitionsNeeded = 3;
                } else if (neighborCharType == 'SPECIAL') {
                    transitionsNeeded = 2;
                } else if (neighborCharType == 'EMPTY') {
                    transitionsNeeded = 3;
                } else {
                    LOG.error('No case for handling neighborCharType of', neighborCharType);
                    LOG.debug('Setting setting transitions needed to -1');
                    transitionsNeeded = -1;
                }
                break;

            case 'SPECIAL':
                if (neighborCharType == 'WORD') {
                    transitionsNeeded = 2;
                } else if (neighborCharType == 'BLANK') {
                    transitionsNeeded = 3;
                } else if (neighborCharType == 'SPECIAL') {
                    transitionsNeeded = 1;
                } else if (neighborCharType == 'EMPTY') {
                    transitionsNeeded = 3;
                } else {
                    LOG.error('No case for handling neighborCharType of', neighborCharType);
                    LOG.debug('Setting setting transitions needed to -1');
                    transitionsNeeded = -1;
                }
                break;

            case 'EMPTY':
                if (neighborCharType == 'WORD') {
                    transitionsNeeded = 2;
                } else if (neighborCharType == 'BLANK') {
                    transitionsNeeded = 3;
                } else if (neighborCharType == 'SPECIAL') {
                    transitionsNeeded = 2;
                } else if (neighborCharType == 'EMPTY') {
                    transitionsNeeded = 1;
                } else {
                    LOG.error('No case for handling neighborCharType of', neighborCharType);
                    LOG.debug('Setting setting transitions needed to -1');
                    transitionsNeeded = -1;
                }
                break;
            
            case 'BLANK':
                if (neighborCharType == 'WORD') {
                    transitionsNeeded = 2;
                } else if (neighborCharType == 'BLANK') {
                    transitionsNeeded = 2;
                } else if (neighborCharType == 'SPECIAL') {
                    transitionsNeeded = 2;
                } else if (neighborCharType == 'EMPTY') {
                    transitionsNeeded = 1;
                } else {
                    LOG.error('No case for handling neighborCharType of', neighborCharType);
                    LOG.debug('Setting setting transitions needed to -1');
                    transitionsNeeded = -1;
                }
                break;

            default:
                LOG.error('Unknown character type under cursor', prevCharType);
            }

            LOG.debug(sprintf('Current cursor char type = %s, left neighbor type = %s; expecting %s transition(s)', prevCharType, neighborCharType, transitionsNeeded));

            while (transitions < transitionsNeeded) {

                if (nextRow < 0) {
                    // Assert: we've scanned all the characters on the very
                    // first row and still didn't find a position. Put
                    // cursor at the beginning.
                    LOG.debug('b-motion has hit beginning of file; setting position to 0, 0')
                    row = 0;
                    col = 0;
                    break;
                }

                // Update the row and col variables
                row = nextRow;
                col = nextCol;

                // Get the last character of leftChars.
                ch = leftChars.charAt(leftChars.length - 1);
                charType = getCharacterType(ch);

                // Chop of the last character we just read
                leftChars = leftChars.substring(0, leftChars.length - 1);

                LOG.debug(sprintf('Entering b-motion FSM with prevChar=%s (%s) currentChar= %s (%s) nextRow=%3s nextCol=%3s', prevChar, prevCharType, ch, charType, nextRow, nextCol));
                switch(prevCharType) {

                case 'NULL':
                    if (charType == 'WORD') {
                        // Nothing
                    } else if (charType == 'BLANK') {
                        // Nothing
                    } else if (charType == 'SPECIAL') {
                        // Nothing
                    } else if (charType == 'EMPTY') {
                        // LEFT OFF HERE
                        asdfasdf
                        LOG.warn('NULL > EMPTY transition may have faulty logic');
                        nextRow = Math.max(0, nextRow - 1);
                        LOG.debug('Attempting to jump to line above');
                        leftChars = lines[nextRow];
                        nextCol = leftChars.length - 1;
                    } else {
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;

                case 'WORD':
                    if (charType == 'WORD') {
                        // Nothing.
                    } else if (charType == 'BLANK') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else if (charType == 'SPECIAL') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else if (charType == 'EMPTY' && nextRow > 0) {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                        // Take the contents of the previous line.
                        nextRow--;
                        LOG.debug('Jumping to line above');
                        leftChars = lines[nextRow];
                        nextCol = leftChars.length - 1;
                    } else if (charType == 'EMPTY') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else {
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;

                case 'BLANK':
                    if (charType == 'WORD') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else if (charType == 'BLANK') {
                        // Nothing.
                    } else if (charType == 'SPECIAL') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else if (charType == 'EMPTY' && nextRow > 0) {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                        // Take the contents of the previous line.
                        nextRow--;
                        LOG.debug('Jumping to line above');
                        leftChars = lines[nextRow];
                        nextCol = leftChars.length - 1;
                    } else if (charType == 'EMPTY') {
                        // Assert: we can't back up any farther!
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    }else {
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;

                case 'SPECIAL':
                    if (charType == 'WORD') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else if (charType == 'BLANK') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else if (charType == 'SPECIAL') {
                        // Nothing.
                    } else if (charType == 'EMPTY') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                        nextRow = Math.max(0, nextRow - 1);
                        LOG.debug('Attempting to jump to line above');
                        leftChars = lines[nextRow];
                        nextCol = leftChars.length - 1;
                    } else {
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;

                case 'EMPTY':
                    if (charType == 'WORD') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else if (charType == 'BLANK') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else if (charType == 'SPECIAL') {
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else if (charType == 'EMPTY') {
                        // In the case of EMPTY to EMPTY, this counts as a
                        // transition.
                        transitions += 1;
                        LOG.warn('transitions incremented. new value =', transitions);
                    } else {
                        LOG.error('Invalid character type "' + charType + '"');
                    }
                    break;
                }
                prevCharType = charType;
                prevChar = ch;
                nextCol--;
            }

            LOG.debug(sprintf('Exited b-motion FSM; row=%s, nextRow=%s, col=%s, nextCol=%s', row, nextRow, col, nextCol));
            // At this point we've found the next position
            // Note that "col" points exactly one character to the left of
            // the position we want
            LOG.debug('Found the next b position!');
            LOG.debug(lines[row]);
            LOG.debug(Helpers.getPositionMarkerString(col, lines[row]));

            motionResult.endRow = row;
            motionResult.endCol = col;
            motionResult.lowerPosition.row = row;
            motionResult.lowerPosition.col = col;
        }
    };
}();
