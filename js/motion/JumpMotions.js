var JumpMotions = function () {

    var LOG = new Logger({
        prefix : 'JUMPMOTION',
        module : 'motion'
    });

    return {
        /**
         * Expected properties of args:
         *
         *  startRow
         *  startCol
         *  lines
         *  motionResult
         *  searchWord
         */
        '/' : function(args) {
            var row = args.startRow;
            var startCol = args.startCol;
            var lines = args.lines;
            var searchWord = args.searchWord;
            var motionResult = args.motionResult;

            var line = lines[row].substring(startCol + 1);
            var index = line.search(searchWord);
            this.LOG.debug(sprintf('Searching partial line # %3s %s', (row + 1), lines[row].substring(startCol + 1)));
            var foundPattern = true;

            while(index < 0) {
                row += 1;
                row = row % lines.length;
                index = lines[row].search(searchWord);
                this.LOG.debug(sprintf('Searching line # %3s %s', (row + 1), lines[row]));

                if (row == args.startRow && index < 0) {
                    this.LOG.debug('Search has looped back to original row and still not found a match; breaking out');
                    foundPattern = false;
                    motionResult.error = 'E486: Pattern not found';
                    break;
                }
            }

            if (foundPattern) {
                this.LOG.debug('Found search pattern!');
                this.LOG.debug(lines[row]);
                this.LOG.debug(Helpers.getPositionMarkerString(index, lines[row]));
                motionResult.endRow = row;
                motionResult.endCol = index;
                motionResult.higherPosition.row = 'LEFT OFF HERE';
                motionResult.higherPosition.col = 'LEFT OFF HERE';
                motionResult.lowerPosition.row = 'LEFT OFF HERE';
                motionResult.lowerPosition.col = 'LEFT OFF HERE';
            }
        }
    };
}();
