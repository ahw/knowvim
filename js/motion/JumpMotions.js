var JumpMotions = {

    logger : new Logger({
        prefix : 'MOTION (jump)',
        module : 'motion'
    }),

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
        this.logger.debug(sprintf('Searching partial line # %3s %s', (row + 1), lines[row].substring(startCol + 1)));
        var foundPattern = true;

        while(index < 0) {
            row = ++row % lines.length;
            this.logger.debug(sprintf('Searching line # %3s %s', (row + 1), lines[row]));
            if (row == args.startRow) {
                this.logger.debug('Search has looped back to original row; breaking out');
                foundPattern = false;
                motionResult.error = 'E486: Pattern not found';
            }

            index = lines[row].search(searchWord);
        }

        if (foundPattern) {
            this.logger.debug('Found search pattern!');
            this.logger.debug(lines[row]);
            this.logger.debug(Helpers.getPositionMarkerString(index, lines[row]));
            motionResult.endRow = row;
            motionResult.endCol = index;
            motionResult.higherPosition.row = 'LEFT OFF HERE';
            motionResult.higherPosition.col = 'LEFT OFF HERE';
            motionResult.lowerPosition.row = 'LEFT OFF HERE';
            motionResult.lowerPosition.col = 'LEFT OFF HERE';
        }
    }
};
