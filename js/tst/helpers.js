var TestHelpers = {

    LOG : function() {
        var l1 = new Logger({
            module : 'test',
            prefix : 'TEST'
        });
        var l2 = new Logger({
            module : 'test',
            prefix : 'TEST',
            padding : '    '
        });

        return {
            debug : function(msg, obj) {
                l2.debug(msg, obj);
            },
            info : function(msg, obj) {
                l2.info(msg, obj);
            },
            warn : function(msg, obj) {
                l2.warn(msg, obj);
            },
            error : function(msg, obj) {
                l2.error(msg, obj);
            },
            reportTest : function(testName) {
                if (l2.isEnabled())
                    console.info('%c' + testName, 'color:green;text-decoration:underline');
            }
        };
    }(),

    /**
     * A helper function to compute the positions identified by the caret
     * symbols in an array of strings. Expected properties of args:
     *
     *  lines : An array of strings
     *  higherOrLower : String
     * It is easiest to give an example:
     * 
     *  If
     *      lines = [
     *          'one two three',
     *          '^   ^'
     *      ]
     *
     *  Then this function will return
     *      { startRow : 0,
     *        startCol : 0,
     *        endRow : 0,
     *        endCol : 4 }
     */
    getPositionsFromStrings : function(args) {
        var lowerRow
          , lowerCol
          , higherRow
          , higherCol
          , lines = args.lines
          , higherOrLower = args.higherOrLower;

        var oneCaret  = /^\s*\^\s*$/;
        var twoCarets = /^\s*\^\s*\^\s*$/;

        for (var i = 0; i < lines.length; i++) {
            if (oneCaret.test(lines[i]) && typeof lowerRow == 'undefined') {
                lowerRow = i - 1;
                lowerCol = lines[i].indexOf('^');
            } else if (oneCaret.test(lines[i])) {
                higherRow = i - 2;
                higherCol = lines[i].indexOf('^');
            } else if (twoCarets.test(lines[i])) {
                lowerRow = higherRow = i - 1;
                lowerCol = lines[i].indexOf('^');
                higherCol = lines[i].indexOf('^', lowerCol + 1);
            }
        }

        var startRow, startCol, endRow, endCol;
        if (higherOrLower == 'higher') {
            startRow = lowerRow;
            startCol = lowerCol;
            endRow = higherRow;
            endCol = higherCol;
        } else if (higherOrLower = 'lower') {
            startRow = higherRow;
            startCol = higherCol;
            endRow = lowerRow;
            endCol = lowerCol;
        } else {
            this.LOG.error('Must specify higherOrLower argument');
        }
        var positions = {
            startRow : startRow,
            startCol : startCol,
            endRow : endRow,
            endCol : endCol
        };
        this.LOG.debug('getPositionsFromStrings: returning', positions);
        return positions;
    },

    /**
     * Removes the caret lines from an array of position strings.
     */
    removeCaretsFromStrings : function(lines) {
        var linesWithoutCarets = [];
        lines.forEach(function(line) {
            if (!/^\s*\^\s*\^?\s*$/.test(line))
                linesWithoutCarets.push(line);
        });
        this.LOG.debug('removeCaretsFromStrings: returning', linesWithoutCarets);
        return linesWithoutCarets;
    }
};
