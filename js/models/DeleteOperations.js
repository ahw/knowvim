var DeleteOperations = {

    logger : new Logger({
        module : 'operations',
        prefix : 'DELETE: '
    }),

    /**
     * Make a characterwise deletion all within a single line. For example,
     * d{count}l will always (and only) apply within a single line.
     */
    deleteCharacterwiseSingleLine : function(args) {
        var lines = args.lines;
        var row = args.startRow;
        var startCol = args.startCol;
        var endCol = args.endCol;

        this.logger.log('DELETE Characterwise does not span multiple lines');
        this.logger.log('DELETE Original line = ' + lines[row]);
        // Remove all characters in the range [startCol, endCol)
        lines[row] = lines[row].substr(0, startCol) + lines[row].substr(endCol);
        this.logger.log('DELETE Modified line = ' + lines[row]);

        args.operationResult.row = row;
        args.operationResult.col = startCol;
    },

    /**
     * Make a characterwise deletion over multiple lines. For example,
     * d{count}$ will almost always apply over multiple lines.
     */
    deleteCharacterwiseMultipleLines : function(args) {
        var lines = args.lines;
        var startRow = args.startRow;
        var endRow = args.endRow;
        var startCol = args.startCol;
        var endCol = args.endCol;

        this.logger.log('DELETE characterwise DOES span multiple lines');
        this.logger.log('DELETE First line original = ' + lines[startRow]);

        // Chop of the end of firstLine by taking only
        // characters in the range [0, startCol).
        var firstLine = lines[startRow];
        firstLine = firstLine.substr(0, startCol);
        lines[startRow] = firstLine;
        this.logger.log('DELETE First line modified = ' + lines[startRow]);
        this.logger.log('DELETE Last line original = ' + lines[endRow]);

        // Chop of the beginning of lastLine by taking only
        // characters from index endCol to the end.
        var lastLine = lines[endRow];
        lastLine = lastLine.substr(endCol);
        lines[endRow] = lastLine;
        this.logger.log('DELETE Last line modified = ' + lastLine);

        if (endRow - startRow > 1) {
            // Assert: the motion covers more than 2 lines,
            // which means there must be entire lines in
            // between that should be deleted.
            var deletedLines = lines.splice(startRow + 1, endRow - startRow - 1);
            var operationsLogger = this.logger;
            deletedLines.forEach(function(line) {
                operationsLogger.log('DELETE Inner line deleted entirely = ' + line);
            });
        }

        // As per :help d:
        // An exception for the d{motion} command: If the
        // motion is not linewise, the start and end of the
        // motion are not in the same line, and there are
        // only blanks before the start and after the end of
        // the motion, the delete becomes linewise.  This
        // means that the delete also removes the line of
        // blanks that you might expect to remain.

        // Combine the firstLine and lastLine.
        lines[startRow] = firstLine + lastLine;
        // Delete the lastLine.
        lines.splice(endRow, 1);

        // Update the positions using the operationResult object given in
        // the function arguments.
        this.logger.log('DELETE New positions row = ' + startRow + ' col = ' + startCol);
        args.operationResult.row = startRow;
        args.operationResult.col = startCol;
    },

    /**
     * Make a characterwise deletion. This function will call helper
     * functions such as "deleteCharacterwiseSingleLine" or
     * "deleteCharacterwiseMultipleLines" depending on the type of motion
     * involved.
     */
    deleteCharacterwise : function(args) {
        var motionResult = args.motionResult;
        var lines = args.lines;
        
        // Compute a bunch of convenience variables.
        var startCol = Math.min(motionResult.startCol, motionResult.endCol);
        var endCol = Math.max(motionResult.startCol, motionResult.endCol);
        var startRow = Math.min(motionResult.startRow, motionResult.endRow);
        var endRow = Math.max(motionResult.startRow, motionResult.endRow);
        var spansMultipleLines = startRow == endRow ? false : true;

        // Encapsulates the result of this operation. "row" and "col"
        // represent the final position of the cursor.
        var operationResult = {
            row : motionResult.startRow,
            col : motionResult.startCol
        }

        var isBackwardsDelete;
        if (motionResult.startRow > motionResult.endRow) {
            isBackwardsDelete = true;
        } else if (motionResult.startRow < motionResult.endRow) {
            isBackwardsDelete = false;
        } else if (motionResult.startCol > motionResult.endCol) {
            isBackwardsDelete = true;
        } else {
            isBackwardsDelete = false;
        }

        // If the motion is inclusive, then add 1 to the end index.
        if (motionResult.inclusive)
            endCol++;

        // If we hit the end of the line, add 1 to the end index
        if (motionResult.hitEol)
            endCol++;

        if (!spansMultipleLines) {
            this.deleteCharacterwiseSingleLine({
                startRow : startRow,
                endRow : endRow,
                startCol : startCol,
                endCol : endCol,
                lines : lines,
                operationResult : operationResult
            });
        } else {
            this.deleteCharacterwiseMultipleLines({
                startRow : startRow,
                endRow : endRow,
                startCol : startCol,
                endCol : endCol,
                lines : lines,
                operationResult : operationResult
            });
        }
        
        // If this is a d[count]l delete whose [count]l motion
        // was cut short by the end of line, then we must delete
        // the last character of the line. The above logic will
        // not delete this last character.
        if (motionResult.hitEol) {
            this.logger.log('DELETE Moving column position back by one position since we deleted the last character.');
            operationResult.col = Math.max(0, lines[startRow].length - 1);
        }

        // -- // Create an attributes hash of the form {'lines.3' :
        // -- // 'foo'}. We'll have to create this in a somewhat
        // -- // convoluted way since the property name ('lines.3') is
        // -- // dynamically generated -- it depends on which line
        // -- // index is being updated.
        // -- var attributes = {};
        // -- attributes[sprintf('lines.%s', motionResult.startRow)] = line;
        // -- this.get('vim').get('buffer').set(attributes, {silent : true});

        return operationResult;
    },

    /**
     * Make a linewise deletion.
     */
    deleteLinewise : function(args) {

        var motionResult = args.motionResult;
        var lines = args.lines;
        
        // Compute a bunch of convenience variables.
        var startRow = Math.min(motionResult.startRow, motionResult.endRow);
        var endRow = Math.max(motionResult.startRow, motionResult.endRow);

        // Encapsulates the result of this operation. "row" and "col"
        // represent the final position of the cursor.
        var operationResult = {
            row : motionResult.startRow,
            col : motionResult.startCol
        }

        var numLinesToDelete = endRow - startRow + 1;
        lines.splice(startRow, numLinesToDelete);

        // If there is still content on the line indexed by startRow then
        // the col position should be the location of the first non-blank
        // character in that line. If lines[startRow] does not exist (e.g.,
        // when deleting the last line in the file), the cursor should go on
        // the line immediately before it.
        var newRowIndex = startRow;
        if (typeof lines[startRow] == 'undefined')
            newRowIndex = Math.max(0, startRow - 1);

        var newColIndex = 0;
        if (typeof lines[newRowIndex] == 'string')
            newColIndex = Math.max(0, lines[newRowIndex].search(/\S/));

        operationResult.row = newRowIndex;
        operationResult.col = newColIndex;
        return operationResult;
    }

};
