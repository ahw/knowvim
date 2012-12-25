var YankOperations = {
    logger : new Logger({
        module : 'operations',
        prefix : 'YANK: '
    }),

    getYankOperationResult : function(args) {
        this.logger.log('Called getYankOperationResult');
        var motionResult = args.motionResult;
        // Default register name is the unnamed register, '"'.
        var registerName = args.normalCommand.registerName
            ? args.normalCommand.registerName
            : '"';
        var lines = args.lines;

        var operationResult = {
            registerName : registerName,
            motion : motionResult,
            text : [],
            operationName : 'y',
        };

        if (motionResult.type == 'linewise') {
            this.yankLinewise({
                motionResult : args.motionResult,
                lines : args.lines,
                operationResult : operationResult
            });
        } else if (motionResult.type == 'characterwise') {
            // Assert: this motion spans multiple rows.
            this.yankCharacterwise({
                motionResult : args.motionResult,
                lines : lines,
                operationResult : operationResult
            });
        } else {
            // Should never get here.
            logger.warn('Invalid motion type as part of yank command.', motionResult);
        }

        return operationResult;
    },

    /**
     * Make a characterwise deletion. This function will call helper
     * functions such as "yankCharacterwiseSingleLine" or
     * "yankCharacterwiseMultipleLines" depending on the type of motion
     * involved.
     */
    yankCharacterwise : function(args) {
        var motionResult = args.motionResult;
        var lines = args.lines;
        
        // Compute a bunch of convenience variables.
        var startCol = Math.min(motionResult.startCol, motionResult.endCol);
        var endCol = Math.max(motionResult.startCol, motionResult.endCol);
        var startRow = Math.min(motionResult.startRow, motionResult.endRow);
        var endRow = Math.max(motionResult.startRow, motionResult.endRow);
        var spansMultipleLines = startRow == endRow ? false : true;

        var isBackwardsYank;
        if (motionResult.startRow > motionResult.endRow) {
            isBackwardsYank = true;
        } else if (motionResult.startRow < motionResult.endRow) {
            isBackwardsYank = false;
        } else if (motionResult.startCol > motionResult.endCol) {
            isBackwardsYank = true;
        } else {
            isBackwardsYank = false;
        }

        // If the motion is inclusive, then add 1 to the end index.
        if (motionResult.inclusive)
            endCol++;

        // If we hit the end of the line, add 1 to the end index
        if (motionResult.hitEol)
            endCol++;

        if (!spansMultipleLines) {
            this.yankCharacterwiseSingleLine({
                startRow : startRow,
                endRow : endRow,
                startCol : startCol,
                endCol : endCol,
                lines : lines,
                operationResult : operationResult
            });
        } else {
            this.yankCharacterwiseMultipleLines({
                startRow : startRow,
                endRow : endRow,
                startCol : startCol,
                endCol : endCol,
                lines : lines,
                operationResult : operationResult
            });
        }
        
        // If this is a d[count]l yank whose [count]l motion
        // was cut short by the end of line, then we must yank
        // the last character of the line. The above logic will
        // not yank this last character.
        if (motionResult.hitEol) {
            this.logger.log('Moving column position back by one position since we yanked the last character.');
            operationResult.col = Math.max(0, lines[startRow].length - 1);
        }

        return operationResult;
    },

    /**
     * Make a linewise deletion.
     */
    yankLinewise : function(args) {
        var motionResult = args.motionResult;
        var lines = args.lines;
        var operationResult = args.operationResult;

        // Compute a bunch of convenience variables.
        var startRow = Math.min(motionResult.startRow, motionResult.endRow);
        var endRow = Math.max(motionResult.startRow, motionResult.endRow);
        var startCol = motionResult.startCol;

        // Slice function returns elements in range [start, end).
        var yankedLines = lines.slice(startRow, endRow + 1);
        yankedLines.forEach(function(line, i) {
            operationResult.text.push({
                index : startRow + i,
                content : line
            });
        });

        // The cursor always goes on the minimum of startRow and endRow,
        // regardless of where the cursor was before the yank.
        operationResult.row = startRow;

        // The column position is either (1) the same as it was or (2) on
        // the right-most character of startLine, if startLine has been
        // switched with endLine
        var newColIndex = Math.min(lines[startRow].length - 1, startCol);
        newColIndex = Math.max(0, newColIndex); // Because newColIndex can't be -1
        operationResult.col = newColIndex;
        return operationResult;
    },

    /**
     * Helper function (should not call directly).  Make a characterwise
     * deletion all within a single line. For example, d{count}l will always
     * (and only) apply within a single line.
     */
    yankCharacterwiseSingleLine : function(args) {
        var lines = args.lines;
        var row = args.startRow;
        var startCol = args.startCol;
        var endCol = args.endCol;
        var operationResult = args.operationResult;

        this.logger.log('Characterwise does not span multiple lines');
        this.logger.log('Original line = ' + lines[row]);
        // Remove all characters in the range [startCol, endCol)
        lines[row] = lines[row].substr(0, startCol) + lines[row].substr(endCol);
        this.logger.log('Modified line = ' + lines[row]);

        operationResult.row = row;
        operationResult.col = startCol;
    },

    /**
     * Helper function (should not call directly).Make a characterwise
     * deletion over multiple lines. For example, d{count}$ will almost
     * always apply over multiple lines.
     */
    yankCharacterwiseMultipleLines : function(args) {
        var lines = args.lines;
        var startRow = args.startRow;
        var endRow = args.endRow;
        var startCol = args.startCol;
        var endCol = args.endCol;
        var operationResult = args.operationResult;

        this.logger.log('Characterwise DOES span multiple lines');
        this.logger.log('First line original = ' + lines[startRow]);

        // Chop of the end of firstLine by taking only
        // characters in the range [0, startCol).
        var firstLine = lines[startRow];
        firstLine = firstLine.substr(0, startCol);
        lines[startRow] = firstLine;
        this.logger.log('First line modified = ' + lines[startRow]);
        this.logger.log('Last line original = ' + lines[endRow]);

        // Chop of the beginning of lastLine by taking only
        // characters from index endCol to the end.
        var lastLine = lines[endRow];
        lastLine = lastLine.substr(endCol);
        lines[endRow] = lastLine;
        this.logger.log('Last line modified = ' + lastLine);

        if (endRow - startRow > 1) {
            // Assert: the motion covers more than 2 lines,
            // which means there must be entire lines in
            // between that should be yanked.
            var yankedLines = lines.splice(startRow + 1, endRow - startRow - 1);
            var operationsLogger = this.logger;
            yankedLines.forEach(function(line) {
                operationsLogger.log('Inner line yanked entirely = ' + line);
            });
        }

        // As per :help d:
        // An exception for the d{motion} command: If the
        // motion is not linewise, the start and end of the
        // motion are not in the same line, and there are
        // only blanks before the start and after the end of
        // the motion, the yank becomes linewise.  This
        // means that the yank also removes the line of
        // blanks that you might expect to remain.

        // Combine the firstLine and lastLine.
        lines[startRow] = firstLine + lastLine;
        // Yank the lastLine.
        lines.splice(endRow, 1);

        // Update the positions using the operationResult object given in
        // the function arguments.
        this.logger.log('New positions row = ' + startRow + ' col = ' + startCol);
        operationResult.row = startRow;
        operationResult.col = startCol;

        return operationResult;
    }
};
