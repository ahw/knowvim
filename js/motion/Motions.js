var Motions = {
    logger : new Logger({
        module : 'motion',
        prefix : 'MOTION'
    }),

    /**
     * Returns the result of a named motion, in the context of startRow,
     * startCol, and an array of lines. It is expected that args contains
     * the following properties:
     *
     *  normalCommand : The object received in
     *      NormalHandler.receiveNormalCommand.
     *  lines : An array of strings representing the buffer
     *  startRow : Number
     *  startCol : Number
     *  vim : The Vim model
     */
    getMotionResult : function(args) {
        this.logger.debug('Called getMotionResult with args', args);

        if (args.lines.length == 0) {
            this.logger.warn('Buffer is entirely empty; returning early');
            this.logger.info('Returning null motionResult');
            return null;
        }

        // Compute convenience variables
        var normalCommand = args.normalCommand
          , startRow = args.startRow
          , startCol = args.startCol
          , lines = args.lines
          , vim = args.vim
          , totalMotionCount = 1; // Default motion count value is 1.

        // If this normalCommand has an operationCount, multiply the
        // motionCount by that value since it is equivalent to simply apply
        // the motion (operationCount * motionCount) number of times.
        if (normalCommand.motionCount && normalCommand.operationCount)
            totalMotionCount = normalCommand.motionCount * normalCommand.operationCount;
        else if (normalCommand.motionCount)
            totalMotionCount = normalCommand.motionCount;
        else if (normalCommand.operationCount)
            totalMotionCount = normalCommand.operationCount;

        var motionResult = {};

        this.logger.debug('Calling applyMotion for "' + normalCommand.motionName + '" motion.');
        motionResult = this.applyMotion({
            normalCommand : normalCommand,
            startRow : startRow,
            startCol : startCol,
            lines : lines,
            vim : vim
        });

        for (var i = 0; i < totalMotionCount - 1; i++) {
            this.logger.debug('Calling applyMotion for "' + normalCommand.motionName + '" motion iteration #' + (i+2));
            // For each iteration, compute the motionResult starting
            // from the previous motion's end positions.
            motionResult = this.applyMotion({
                normalCommand : normalCommand,
                startRow : motionResult.endRow,
                startCol : motionResult.endCol,
                lines : lines,
                vim : vim,
                isRepeat : true
            });

            // If the motionResult hasn't changed, then drop out of the
            // loop for efficiency.
            if (motionResult.startRow == motionResult.endRow
                && motionResult.startCol == motionResult.endCol) {
                break;
            }
        }

        // Reset the starting position to the original starting
        // position (if there was any totalMotionCount iteration, the
        // starting position values change with each iteration).
        motionResult.startRow = startRow;
        motionResult.startCol = startCol;

        // If the overall motion moved the cursor to a higher row/col
        // position, then reset lower position. Conversely, if the overall
        // motion moved the cursor to a lower row/col position, then reset
        // the higher position.
        if (motionResult.startRow > motionResult.endRow) {
            motionResult.higherOrLower = 'lower';
            motionResult.lowerPosition.row = motionResult.endRow;
            motionResult.lowerPosition.col = motionResult.endCol;
            motionResult.higherPosition.row = motionResult.startRow;
            motionResult.higherPosition.col = motionResult.startCol;

        } else if (motionResult.startRow < motionResult.endRow) {
            motionResult.higherOrLower = 'higher';
            motionResult.lowerPosition.row = motionResult.startRow;
            motionResult.lowerPosition.col = motionResult.startCol;
            motionResult.higherPosition.row = motionResult.endRow;
            motionResult.higherPosition.col = motionResult.endCol;

        } else if (motionResult.startCol < motionResult.endCol) {
            motionResult.higherOrLower = 'higher';
            motionResult.lowerPosition.row = motionResult.startRow;
            motionResult.lowerPosition.col = motionResult.startCol;
            motionResult.higherPosition.row = motionResult.endRow;
            motionResult.higherPosition.col = motionResult.endCol;

        } else if (motionResult.startCol > motionResult.endCol) {
            motionResult.higherOrLower = 'lower';
            motionResult.lowerPosition.row = motionResult.endRow;
            motionResult.lowerPosition.col = motionResult.endCol;
            motionResult.higherPosition.row = motionResult.startRow;
            motionResult.higherPosition.col = motionResult.startCol;

        } else {
            this.logger.warn('Not changing motionResult.higherPosition or motionResult.lowerPosition because startRow == endRow, startCol == endCol');
        }

        this.logger.info('Returning motionResult', motionResult);
        return motionResult;
    },

    /**
     * This is a helper function and should not be called directly. It is
     * intended that getMotionResult will call this function for each of the
     * {count} times required in order to compute the final motionResult of
     * a repeated motion. Applies an individual motion, identified by
     * normalCommand.motionName, in the context of startRow, startCol, and
     * an array of lines. The expected properties of args are as follows:
     *
     *  normalCommand : The object received from
     *      NormalHandler.receiveNormalCommand
     *  startRow : Number
     *  startCol : Number
     *  lines : An array of strings representing the buffer
     *  isRepeat : true if this is the Nth iteration of some {count}{motion}
     *  command, for all N in {2, 3, 4, ...}
     */
    applyMotion : function(args) {
        this.logger.debug('Called applyMotion with args', args);
        var normalCommand = args.normalCommand
          , startRow = args.startRow
          , startCol = args.startCol
          , lines = args.lines
          , count = args.count
          , vim = args.vim
          , isRepeat = args.isRepeat ? args.isRepeat : false;

        // Define the default motionResult object.
        var motionResult = {
            type : null, // 'linewise' or 'characterwise'
            higherOrLower : null,
            lowerPosition : {
                row : startRow,
                col : startCol
            },
            higherPosition : {
                row : startRow,
                col : startCol
            },
            startRow : startRow,
            startCol : startCol,
            endRow : startRow, // Default is no row movement
            endCol : startCol, // Default is no col movement
            inclusive : false, // True if it includes last char towards end
            hitEol : false // True if characterwise motion is stopped short due to end of line
        };

        switch(normalCommand.motionName) {
        case 'h':
            var endCol = startCol == 0 ? 0 : startCol - 1;
            motionResult.type = 'characterwise';
            motionResult.endCol = endCol;
            motionResult.inclusive = false;
            motionResult.higherOrLower = 'lower';
            motionResult.lowerPosition.col = endCol;
            break;

        case 'l':
            var endCol = startCol == lines[startRow].length - 1 ? startCol : startCol + 1;
            if (lines[startRow] == "")
                endCol = 0;

            motionResult.type = 'characterwise';
            motionResult.endCol = endCol;
            motionResult.inclusive = false;
            motionResult.hitEol = endCol == startCol ? true : false;
            motionResult.higherOrLower = 'higher';
            motionResult.higherPosition.col = endCol;
            break;

        case 'j':
            var numRows = lines.length;
            var endRow = startRow == numRows - 1 ? startRow : startRow + 1;
            // If the new row is shorter, put the column at the
            // right-most position possible.
            var endCol = startRow != endRow
                ? endCol = Math.min(lines[endRow].length - 1, startCol)
                : startCol;
            // End column can't be less than 0.
            endCol = endCol == -1 ? 0 : endCol;

            motionResult.type = 'linewise';
            motionResult.endRow = endRow;
            motionResult.endCol = endCol;
            motionResult.inclusive = true;
            motionResult.higherOrLower = 'higher';
            motionResult.higherPosition.row = endRow;
            motionResult.higherPosition.col = endCol;
            break;

        case 'k':
            var endRow = startRow == 0 ? 0 : startRow - 1;
            // If the new row is shorter, put the column at the
            // right-most position possible.
            var endCol =
                startRow != endRow
                ? endCol = Math.min(lines[endRow].length - 1, startCol)
                : startCol;
            // End column can't be less than 0.
            endCol = endCol == -1 ? 0 : endCol;

            motionResult.type = 'linewise';
            motionResult.endRow = endRow;
            motionResult.endCol = endCol;
            motionResult.inclusive = true;
            motionResult.higherOrLower = 'lower';
            motionResult.lowerPosition.row = endRow;
            motionResult.lowerPosition.col = endCol;
            break;

        case '0':
            motionResult.endCol = 0;
            motionResult.type = 'characterwise';
            motionResult.inclusive = false;
            motionResult.higherOrLower = 'lower';
            motionResult.lowerPosition.col = 0;
            break;

        case '$':
            // Initially set endCol to what we expect (to the position
            // at the end of the line).
            var endCol = lines[startRow].length - 1;
            if (lines[startRow] == "")
                endCol = 0;

            if (isRepeat) {
                // Special case: if this is part of a {count}$ motion,
                // each successive iteration should move the cursor
                // down one line and to the end.
                var numRows = lines.length;
                var endRow =
                    startRow == numRows - 1
                    ? startRow
                    : startRow + 1;
                // End position must be 0 even if length of content 0.
                endCol = Math.max(0, lines[endRow].length - 1);
                motionResult.endRow = endRow;
                motionResult.higherOrLower = 'higher';
                motionResult.higherPosition.row = endRow;
            }

            motionResult.endCol = endCol;
            motionResult.higherPosition.col = endCol;
            motionResult.type = 'characterwise';
            motionResult.hitEol = true;
            motionResult.inclusive = false;
            motionResult.higherOrLower = 'higher';
            break;

        case '}':
            motionResult.inclusive = false;
            motionResult.type = 'characterwise';
            motionResult.higherOrLower = 'higher';
            ObjectMotions.forwardParagraph({
                startRow : startRow,
                startCol : startCol,
                lines : lines,
                motionResult : motionResult
            });
            break;

        case '{':
            motionResult.inclusive = false;
            motionResult.type = 'linewise';
            motionResult.higherOrLower = 'lower';
            ObjectMotions.backwardParagraph({
                startRow : startRow,
                startCol : startCol,
                lines : lines,
                motionResult : motionResult
            });
            break;

        case 'G':
            // The [count] given to G is a special case, instead of
            // repeating the motion [count] times, we jump to the line
            // number given by [count]. See :help G
            motionResult.inclusive = true;
            motionResult.type = 'linewise';

            // If normalCommand.motionCount == null then we move to last line of file by
            // default.
            if (typeof normalCommand.motionCount == 'undefined') {
                this.logger.warn('Received G command with null count; moving to bottom of file');
                normalCommand.motionCount = lines.length;
            }

            var lineNo = normalCommand.motionCount - 1;
            // Bound lineNo between 0 and last line
            lineNo = Math.min(lines.length - 1, lineNo);
            lineNo = Math.max(0, lineNo);

            var endCol = Math.max(0, lines[lineNo].search(/\S/));
            motionResult.endRow = lineNo;
            motionResult.endCol = endCol;
            break;


        case 'w':
            motionResult.inclusive = false;
            motionResult.type = 'characterwise';
            motionResult.higherOrLower = 'higher';
            WordMotions.w({
                startRow : startRow,
                startCol : startCol,
                lines : lines,
                motionResult : motionResult
            });
            break;

        case '/':
            motionResult.inclusive = false;
            motionResult.type = 'characterwise';
            motionResult.higherOrLower = 'UKNOWN';
            JumpMotions['/']({
                startRow : startRow,
                startCol : startCol,
                lines : lines,
                motionResult : motionResult,
                searchWord : normalCommand.searchWord
            });

        case Helpers.controlCharacters.BACKSPACE:
            var endRow = startRow;
            var endCol = startCol;
            if (startCol > 0) {
                endCol = startCol - 1;
            } else if (startRow > 0) {
                endRow = startRow - 1;
                endCol = lines[endRow].length - 1;
            }
            motionResult.type = 'characterwise';
            motionResult.endCol = endCol;
            motionResult.endRow = endRow;
            motionResult.inclusive = false;
            motionResult.higherOrLower = 'lower';
            motionResult.lowerPosition.col = endCol;
            break;

        case 'd':
        case 'y':
            // If "d" or "y" are given as the motionName we'll assume
            // they were in the context of a "dd" or "yy" command. In
            // this case, the intent is to delete or yank the current
            // line. Note that the default values for
            // motionResult.startRow and motinoResult.endRow should
            // remain as-is.
            motionResult.type = 'linewise';
            motionResult.higherOrLower = null;
            break;

        case "'":
            var markName = normalCommand.markName;
            if (typeof vim.get('marks')[markName] == 'undefined') {
                this.logger.error('Mark "' + markName + '" not set');
                motionResult.error = 'E20: Mark not set';
                break;
            }
            var newRow = vim.get('marks')[markName].row;
            var newCol = Math.max(0, lines[newRow].search(/\S/));
            motionResult.endRow = newRow;
            motionResult.endCol = newCol;
            motionResult.type = 'linewise';
            motionResult.inclusive = true;

            if (newRow == startRow && newCol > startCol) {
                motionResult.higherOrLower = 'higher';
                motionResult.higherPosition.col = newCol;
            } else if (newRow == startRow && newCol < startCol) {
                motionResult.higherOrLower = 'lower';
                motionResult.lowerPosition.col = newCol;
            } else if (newRow < startRow) {
                motionResult.higherOrLower = 'lower';
                motionResult.lowerPosition.row = newRow;
                motionResult.lowerPosition.col = newCol;
            } else if (newRow > startRow) {
                motionResult.higherOrLower = 'higher';
                motionResult.higherPosition.row = newRow;
                motionResult.higherPosition.col = newCol;
            }
            break;

        case '`':
            var markName = normalCommand.markName;
            if (typeof vim.get('marks')[markName] == 'undefined') {
                this.logger.warn('Mark "' + markName + '" not set');
                motionResult.error = 'E20: Mark not set';
                break;
            }
            var newRow = vim.get('marks')[markName].row;
            var newCol = vim.get('marks')[markName].col;

            if (newRow == startRow && newCol > startCol) {
                motionResult.higherOrLower = 'higher';
                motionResult.higherPosition.col = newCol;
            } else if (newRow == startRow && newCol < startCol) {
                motionResult.higherOrLower = 'lower';
                motionResult.lowerPosition.col = newCol;
            } else if (newRow < startRow) {
                motionResult.higherOrLower = 'lower';
                motionResult.lowerPosition.row = newRow;
                motionResult.lowerPosition.col = newCol;
            } else if (newRow > startRow) {
                motionResult.higherOrLower = 'higher';
                motionResult.higherPosition.row = newRow;
                motionResult.higherPosition.col = newCol;
            }

            motionResult.endRow = vim.get('marks')[markName].row;
            motionResult.endCol = vim.get('marks')[markName].col;
            motionResult.type = 'characterwise';
            motionResult.inclusive = false;
            break;

        case 't':
            var endOffset = -1;
            // If this is {count}t{letter} then add 1 to the startCol so
            // we don't just end up finding the same letter position
            // {count} times.
            if (isRepeat) {
                startCol++;
            }
            // Don't break. Fall through to the 'f' motion logic.

        case 'f':
            var endOffset = endOffset || 0;
            var startOffset = startCol + 1;
            var searchString = lines[startRow].substring(startOffset);
            var letter = normalCommand.findLetter;
            // Note that charIndex represents a relative position and
            // must be added to startOffset to get the absolute position of
            // this character.
            var charIndex = searchString.indexOf(letter);
            this.logger.debug('Searching for "' + letter + '" in string "' + searchString + '"');
            if (charIndex > -1) {
                this.logger.debug('Found character "' + letter + '" at index ' + (startOffset + charIndex));
                motionResult.higherOrLower = 'higher';
                motionResult.higherPosition.col = startOffset + charIndex + endOffset;
                motionResult.endCol = startOffset + charIndex + endOffset;
                motionResult.type = 'characterwise';
                motionResult.inclusive = true;
            } else {
                this.logger.debug('Did not find character "' + letter + '". Doing nothing.');
            }
            break;

        case 'T':
            var endOffset = 1;
            // If this is {count}T{letter} then subtract 1 from the
            // startCol so that we don't just end up finding the same
            // letter position {count} times.
            if (isRepeat) {
                startCol--;
            }
            // Don't break. Fall through to 'F' motion logic.

        case 'F':
            var searchString = lines[startRow].substring(0, startCol);
            var letter = normalCommand.findLetter;
            var charIndex = searchString.lastIndexOf(letter);
            if (charIndex > -1) {
                motionResult.higherOrLower = 'lower';
                motionResult.lowerPosition.col = charIndex + endOffset;
                motionResult.endCol = charIndex + endOffset;
                motionResult.type = 'characterwise';
                motionResult.inclusive = false;
            } else {
                this.logger.debug('Did not find character "' + letter + '". Doing nothing.');
            }
            break;

        default:
            this.logger.warn('The "' + normalCommand.motionName + '" motion has not been implemented. Defaulting to no motion.');
        }
        return motionResult;
    }
};
