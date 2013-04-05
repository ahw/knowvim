/**
 * Module for determining the cursor position after various motions or
 * operations.
 */
var Positioning = {

    logger : new Logger({
        prefix : 'POSITIONING',
        module : 'operations'
    }),

    /**
     * Returns an object whose "row" and "col" properties represent the new
     * cursor position after a linewise delete. Expected properties of args:
     *
     *  lines : the array of Strings representing the buffer after a delete
     *  motionResult : the motionResult object associated with the delete
     */
    getPositionAfterLinewiseDelete : function(args) {
        var lines = args.lines;
        var motionResult = args.motionResult;

        // The row position is usually just lower row of the motion result.
        // The exception is when the index given by startRow doesn't exist
        // anymore. This happens when deleting the last line in the file.
        //
        // Column position: If there is still content on the line indexed by
        // startRow then the col position should be the location of the
        // first non-blank character in that line. If lines[startRow] does
        // not exist (e.g., when deleting the last line in the file), the
        // cursor should go on the line immediately before it.
        var lowerRow = motionResult.lowerPosition.row;
        var row = lowerRow;
        if (typeof lines[lowerRow] == 'undefined')
            row = Math.max(0, lowerRow - 1);

        var col = 0;
        if (typeof lines[row] == 'string')
            col = Math.max(0, lines[row].search(/\S/));

        this.logger.log('Position after linewise delete: row = ' + row + ' col = ' + col);
        return {row: row, col: col};
    },

    /**
     * Returns an object whose "row" and "col" properties represent the new
     * cursor position after a linewise delete. Expected properties of args:
     *
     *  lines : the array of Strings representing the buffer after a put
     *  startRow : Number the starting row before the put
     *  startCol : Number the starting column before the put
     */
    getPositionAfterLinewisePutBelow : function(args) {
        var row = args.startRow + 1;
        var col = Math.max(0, args.lines[row].search(/\S/));
        return {row: row, col: col};
    }
};
