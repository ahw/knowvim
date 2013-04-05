var ObjectMotions = function () {
    var LOG = new Logger({
        prefix : 'MOTION (object)',
        module : 'motion'
    });

    return {
        forwardParagraph : function(args) {
            var row = args.startRow;
            var col = args.startCol;
            var lines = args.lines;
            var motionResult = args.motionResult;

            var foundNextPosition = false;
            while (!foundNextPosition) {
                row++;
                if (row > lines.length - 1) {
                    LOG.debug('Hit last line of file. Putting cursor at end of last line');
                    row--;
                    col = Math.max(0, lines[row].length - 1);
                    break;
                } else if (lines[row] == "") {
                    foundNextPosition = true;
                    col = 0;
                }
            }

            // Found } position
            motionResult.endRow = row;
            motionResult.endCol = col;
            motionResult.higherPosition.row = row;
            motionResult.higherPosition.col = col;
        },

        backwardParagraph : function(args) {
            var row = args.startRow;
            var col = args.startCol;
            var lines = args.lines;
            var motionResult = args.motionResult;

            var foundNextPosition = false;
            while (!foundNextPosition) {
                row--;
                if (row < 0) {
                    LOG.debug('Hit first line of file. Putting cursor at beginning of line');
                    row++;
                    col = 0;
                    break;
                } else if (lines[row] == "") {
                    foundNextPosition = true;
                    col = 0;
                }
            }

            // Found { position
            motionResult.endRow = row;
            motionResult.endCol = col;
            motionResult.lowerPosition.row = row;
            motionResult.lowerPosition.col = col;
        }
    };
}();
