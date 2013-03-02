var YankOperations = {
    logger : new Logger({
        module : 'operations|yank',
        prefix : 'YANK'
    }),

    /**
     * Returns the result of a yank operation, in the context of startRow,
     * startCol, and an array of lines. This function handles computing the
     * motionResult if it needs to. It is expected that args containst the
     * following properties:
     *
     *  normalCommand : The object received in
     *      NormalHandler.receiveNormalCommand.
     *  motionResult : The object returned from Motions.getMotionResult
     *  lines : An array of strings representing the buffer
     *  startRow : Number
     *  startCol : Number
     */
    getYankOperationResult : function(args) {
        this.logger.debug('Called getYankOperationResult');

        // Compute convenience variables
        var normalCommand = args.normalCommand
          , startRow = args.startRow
          , startCol = args.startCol
          , lines = args.lines
          , vim = args.vim
          , motionResult = args.motionResult
          , operationCount = normalCommand.operationCount ? normalCommand.operationCount : 1;

        // Default register name is the unnamed register, '"'.
        var registerName = normalCommand.registerName
            ? normalCommand.registerName
            : Helpers.registerTypes.UNNAMED

        // Set up the skeleton operationResult.
        var operationResult = {}
        operationResult = this.applyOperation({
            operationName : normalCommand.operationName,
            motionResult : motionResult,
            lines : lines,
            error : "" // No error message.
        });

        // Set the register name.
        operationResult.registerName = registerName;

        // Set the status bar text if the number of yanked lines is greater
        // than 2 (seems weird that 2 is the magic number, but that seems to
        // be Vim behavior as far as I can tell.
        if (operationResult.text.length > 2)
            operationResult.error = operationResult.text.length + ' lines yanked';

        this.logger.debug('Yanked the following text into register ' + registerName);
        var operationLogger = this.logger;
        operationResult.text.forEach(function(line) {
            operationLogger.debug(sprintf('=> "%s"', line));
        });
        this.logger.info('Returning operationResult', operationResult);
        return operationResult;
    },

    /**
     * This is a helper function and should not be called directly. It is
     * intended that getYankOperationResult will call this function for
     * each of the {count} times required in order to compute the final
     * operationResult of a repeated operation. The expected properties of
     * args are as follows:
     *
     *  operationName : 'y', 'd'
     *  motionResult : The object returned from Motions.getMotionResult
     *  lines : An array of strings representing the buffer
     *  text : An array of strings representing text already operated on by
     *    this operation
     */
    applyOperation : function(args) {   
        this.logger.debug('Called applyOperation with args:' , args);
        var operationName = args.operationName
          , motionResult = args.motionResult
          , lines = args.lines
          , text = args.text ? args.text : []
          , isRepeat = args.isRepeat ? args.isRepeat : false;

        // Define the operationResult object.
        var operationResult = {
            motionResult : motionResult,
            text : text,
            endRow : motionResult.endRow, // Default is no cursor change
            endCol : motionResult.endCol // Default is no cursor change
        };

        switch(motionResult.type) {
            case 'linewise':
                this.yankLinewise({
                    motionResult : args.motionResult,
                    lines : args.lines,
                    operationResult : operationResult
                });
                break;
            case 'characterwise':
                this.yankCharacterwise({
                    motionResult : args.motionResult,
                    lines : lines,
                    operationResult : operationResult
                });
                break;
            default:
                this.logger.warn('Invalid motion type as part of ' + operationName + ' command.', motionResult);
        }

        return operationResult;
    },

    /**
     * Make a linewise yank.
     */
    yankLinewise : function(args) {
        this.logger.debug('Called yankLinewise with args:', args);

        var lines = args.lines;
        var operationResult = args.operationResult;

        // Compute a bunch of convenience variables.
        var lowerRow = args.motionResult.lowerPosition.row;
        var higherRow = args.motionResult.higherPosition.row;
        var startCol = args.motionResult.startCol;

        // Copy the line contents to the operationResult object.
        // Note that the upper index in slice() is exclusive.
        operationResult.text = lines.slice(lowerRow, higherRow + 1);

        // The cursor always goes on the minimum row regardless of where
        // the cursor was before the yank.
        operationResult.endRow = lowerRow;

        // The column position is either (1) the same as it was or (2) on
        // the right-most character of lowerRow
        var newColIndex = Math.min(lines[lowerRow].length - 1, startCol);
        newColIndex = Math.max(0, newColIndex); // Because newColIndex can't be -1
        operationResult.endCol = newColIndex;
    },

    /**
     * Make a characterwise yank. This function will call helper functions
     * such as "yankCharacterwiseSingleLine" or
     * "yankCharacterwiseMultipleLines" depending on the type of motion
     * involved.
     */
    yankCharacterwise : function(args) {
        var motionResult = args.motionResult
          , lines = args.lines
          , operationResult = args.operationResult
          , lowerRow = args.motionResult.lowerPosition.row;

        var spansMultipleLines =
            motionResult.startRow == motionResult.endRow
            ? false
            : true;

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
        if (motionResult.inclusive) {
            this.logger.debug('Motion result is inclusive; adding 1 to the endCol value');
            this.logger.warn('TODO -- Should not adjust motionResult from within YankOperations');
            motionResult.endCol++;
        }

        // If we hit the end of the line, add 1 to the end index
        if (motionResult.hitEol) {
            this.logger.debug('Motion result hit EOL; adding 1 to the endCol value');
            this.logger.warn('TODO -- Should not adjust motionResult from within YankOperations');
            motionResult.endCol++;
        }

        if (!spansMultipleLines) {
            this.yankCharacterwiseSingleLine({
                motionResult : motionResult,
                lines : lines,
                operationResult : operationResult
            });
        } else {
            this.yankCharacterwiseMultipleLines({
                motionResult : motionResult,
                lines : lines,
                operationResult : operationResult
            });
        }
    },

    /**
     * Helper function (should not call directly).  Make a characterwise
     * yank all within a single line. For example, d{count}l will
     * always (and only) apply within a single line.
     */
    yankCharacterwiseSingleLine : function(args) {
        this.logger.debug('Called yankCharacterwiseSingleLine with args:', args);
        var lines = args.lines
          , startRow = args.motionResult.startRow
          , minCol = Math.min(args.motionResult.startCol, args.motionResult.endCol)
          , maxCol = Math.max(args.motionResult.startCol, args.motionResult.endCol)
          , operationResult = args.operationResult;
        // Yank all characters in the range [minCol, maxCol)
        var yankedChars = lines[startRow].substring(minCol, maxCol);
        operationResult.text.push(yankedChars);

        // Cursor stays on the same startRow.
        operationResult.endRow = startRow;
        // Cursor always goes to the left-most position of the motion.
        operationResult.endCol = minCol;
    },

    /**
     * Helper function (should not call directly).Make a characterwise
     * yank over multiple lines. For example, d{count}$ will almost
     * always apply over multiple lines.
     */
    yankCharacterwiseMultipleLines : function(args) {
        this.logger.debug('Called yankCharacterwiseMultipleLines with args:', args);

        var lines = args.lines
          , lowerRow = args.motionResult.lowerPosition.row
          , lowerCol = args.motionResult.lowerPosition.col
          , higherRow = args.motionResult.higherPosition.row
          , higherCol = args.motionResult.higherPosition.col
          , operationResult = args.operationResult
          , yankedLines = [];

        // Yank characters in the lower row in the range [lowerCol, EOL).
        yankedLines.push(lines[lowerRow].substring(lowerCol));

        this.logger.debug('Yanking "' + yankedLines[0] + '" (partial)');

        // If there are entire lines between lowerRow and higherRow, add them to
        // the yankedLines structure.
        if (higherRow - lowerRow > 1) {
            // Assert: the motion covers more than 2 lines,
            // which means there must be entire lines in
            // between that should be yanked.
            yankedLines = yankedLines.concat(lines.slice(lowerRow + 1, higherRow));
            this.logger.debug('Yanking all lines ' + (lowerRow + 1 + 1) + ' through ' + (higherRow + 1));
        }

        // Yank the characters in the last line in the range [0, higherCol).
        yankedLines.push(lines[higherRow].substr(0, higherCol));
        this.logger.debug('Yanking "' + yankedLines[yankedLines.length-1] + '" (partial)');

        // Assign yankedLines to the text property.
        operationResult.text = yankedLines;

        // Update the positions using the operationResult object given in
        // the function arguments.
        this.logger.debug('Set operationResult row and col ending positions: row = ' + lowerRow + ',  col = ' + lowerCol);
        operationResult.endRow = lowerRow;
        operationResult.endCol = lowerCol;

        this.logger.info('Returning operationResult:', operationResult);
    }
};
