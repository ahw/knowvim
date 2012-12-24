var Motions = {

    logger : new Logger({
        module : 'motions',
        prefix : 'MOTION: '
    }),

    /**
     * Returns the result of a motionName motion, in the context of
     * startRow, startCol, and an array of lines.
     */
    getMotionResult : function(args) {
        this.logger.log('getMotionResult() args = ', args);
        var motionName = args.motionName;
        var startRow = args.startRow;
        var startCol = args.startCol;
        var lines = args.lines;
        var isRepeat = args.isRepeat ? args.isRepeat : false;
        var result = {
            type : null, // 'linewise' or 'characterwise'
            startRow : startRow,
            startCol : startCol,
            endRow : startRow, // Default is no row movement
            endCol : startCol, // Default is no col movement
            inclusive : false, // True if it includes last char towards end
            hitEol : false // True if characterwise motion is stopped short due to end of line
        };

        switch(motionName) {

            case 'h':
                var endCol = startCol == 0 ? 0 : startCol - 1;
                result.type = 'characterwise';
                result.endCol = endCol;
                result.inclusive = false;
                break;

            case 'l':
                var length = lines[startRow].length;
                var endCol = startCol == length - 1 ? startCol : startCol + 1;
                result.type = 'characterwise';
                result.endCol = endCol;
                result.inclusive = false;
                result.hitEol = endCol == startCol ? true : false;
                break;

            case 'j':
                var numRows = lines.length;
                var endRow = startRow == numRows - 1 ? startRow : startRow + 1;
                // If the new row is shorter, put the column at the
                // right-most position possible.
                var endCol =
                    startRow != endRow
                    ? endCol = Math.min(lines[endRow].length - 1, startCol)
                    : startCol;
                // End column can't be less than 0.
                endCol = endCol == -1 ? 0 : endCol;

                result.type = 'linewise';
                result.endRow = endRow;
                result.endCol = endCol;
                result.inclusive = true;
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

                result.type = 'linewise';
                result.endRow = endRow;
                result.endCol = endCol;
                result.inclusive = true;
                break;

            case '0':
                result.endCol = 0;
                result.type = 'characterwise';
                result.inclusive = false;
                break;

            case '$':
                // Initially set endCol to what we expect (to the position
                // at the end of the line).
                var endCol = lines[startRow].length - 1;

                if (isRepeat) {
                    // Special case: if this is part of a {count}$ motion,
                    // each successive iteration should move the cursor down
                    // one line and to the end.
                    var numRows = lines.length;
                    var endRow = startRow == numRows - 1 ? startRow : startRow + 1;
                    // End position must be 0 even if length of content 0.
                    endCol = Math.max(0, lines[row].length - 1);
                    result.endRow = endRow;
                }

                result.endCol = endCol;
                result.type = 'characterwise';
                result.hitEol = true;
                result.inclusive = false;
                break;

            case 'd':
            case 'y':
                // If "d" or "y" are given as the motionName we'll assume
                // they were in the context of a "dd" or "yy" command. In
                // this case, the intent is to delete or yank the current
                // line.
                result.type = 'linewise';
                break;

            case 'w':
                result = this.getWMotionResult(startRow, startCol);
                break;

            default:
                this.logger.warn('The "' + motionName + '" motion has not been implemented. Defaulting to no motion.');
        }

        // logger.log(sprintf('%s: start (%s, %s) end (%s, %s)', motionName, startRow, startCol, result.endRow, result.endCol));
        return result;
    },
};
