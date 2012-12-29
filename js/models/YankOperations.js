var YankOperations = {
    logger : new Logger({
        module : 'operations',
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
     *  lines : An array of strings representing the buffer
     *  startRow : Number
     *  startCol : Number
     */
    getYankOperationResult : function(args) {
        this.logger.log('Called getYankOperationResult');

        // Compute convenience variables
        var normalCommand = args.normalCommand;
        var startRow = args.startRow;
        var startCol = args.startCol;
        var lines = args.lines;
        var vim = args.vim;
        var operationCount = normalCommand.operationCount ? normalCommand.operationCount : 1;


        // First, get the motionResult.
        var motionResult = Motions.getMotionResult({
            normalCommand : normalCommand,
            startRow : startRow,
            startCol : startCol,
            lines : lines,
            vim : vim
        });

        // Default register name is the unnamed register, '"'.
        var registerName = normalCommand.registerName
            ? normalCommand.registerName
            : '"';

        // Set up the skeleton operationResult.
        var operationResult = {}
        operationResult = this.applyOperation({
            operationName : normalCommand.operationName,
            motionResult : motionResult,
            lines : lines,
            statusBar : "" // Defines the status bar text.
        });

        // Set the register name.
        operationResult.registerName = registerName;

        this.logger.log('Yanked the following text into register ' + registerName);
        var operationLogger = this.logger;
        operationResult.text.forEach(function(item) {
            operationLogger.log(sprintf('%3d. %s', item.index + 1, item.content));
        });
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
        this.logger.log('Called applyOperation with args:' , args);
        var operationName = args.operationName;
        var motionResult = args.motionResult;
        var lines = args.lines;
        var text = args.text ? args.text : [];
        var isRepeat = args.isRepeat ? args.isRepeat : false;

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
        var motionResult = args.motionResult;
        var lines = args.lines;
        var operationResult = args.operationResult;

        // Compute a bunch of convenience variables.
        var minRow = Math.min(motionResult.startRow, motionResult.endRow);
        var maxRow = Math.max(motionResult.startRow, motionResult.endRow);
        var startCol = motionResult.startCol;

        // Slice function returns elements in range [start, end).
        var yankedLines = lines.slice(minRow, maxRow + 1);
        yankedLines.forEach(function(line, i) {
            operationResult.text.push({
                index : minRow + i,
                content : line
            });
        });

        // Set the status bar text if the number of yanked lines is greater
        // than 2 (seems weird that 2 is the magic number, but that seems to
        // be Vim behavior as far as I can tell.
        if (yankedLines.length > 2)
            operationResult.statusBar = yankedLines.length + ' lines yanked';

        // The cursor always goes on the minimum row regardless of where
        // the cursor was before the yank.
        operationResult.endRow = minRow;

        // The column position is either (1) the same as it was or (2) on
        // the right-most character of minRow
        var newColIndex = Math.min(lines[minRow].length - 1, startCol);
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
        var motionResult = args.motionResult;
        var lines = args.lines;
        var operationResult = args.operationResult;
        var minRow = Math.min(
            motionResult.startRow,
            motionResult.endRow);


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
        if (motionResult.inclusive)
            motionResult.endCol++;

        // If we hit the end of the line, add 1 to the end index
        if (motionResult.hitEol)
            motionResult.endCol++;

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
        this.logger.log('Called yankCharacterwiseSingleLine with args:', args);
        var lines = args.lines;
        var startRow = args.motionResult.startRow;
        var minCol = Math.min(
            args.motionResult.startCol,
            args.motionResult.endCol);
        var maxCol = Math.max(
            args.motionResult.startCol,
            args.motionResult.endCol);
        var operationResult = args.operationResult;
        // Yank all characters in the range [minCol, maxCol)
        var yankedChars = lines[startRow].substring(minCol, maxCol);
        operationResult.text = [{
            index : startRow,
            content : yankedChars
        }];

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
        this.logger.log('Called yankCharacterwiseMultipleLines with args:', args);

        var lines = args.lines;
        var minRow = Math.min(
            args.motionResult.startRow,
            args.motionResult.endRow);
        var maxRow = Math.max(
            args.motionResult.startRow,
            args.motionResult.endRow);
        var startCol = args.motionResult.startCol;
        var endCol = args.motionResult.endCol;
        var operationResult = args.operationResult;
        var yankedLines = [];

        // Yank characters in the start row in the range [startCol, EOL).
        yankedLines.push({
            index : minRow,
            content : lines[minRow].substring(startCol)
        });

        // If there are entire lines between minRow and maxRow, add them to
        // the yankedLines structure.
        if (maxRow - minRow > 1) {
            // Assert: the motion covers more than 2 lines,
            // which means there must be entire lines in
            // between that should be yanked.
            for (var i = minRow + 1; i < maxRow; i++) {
                this.logger.log('Yanking the entire line:', lines[i]);
                yankedLines.push({
                    index : i,
                    content : lines[i]
                });
            }
        }

        // Yank the characters in the last line in the range [0, endCol).
        yankedLines.push({
            index : maxRow,
            content : lines[maxRow].substr(0, endCol)
        });

        // Assign yankedLines to the text property.
        operationResult.text = yankedLines;

        // Update the positions using the operationResult object given in
        // the function arguments.
        this.logger.log('New positions minRow = ' + minRow
            + ' startCol = ' + startCol);
        operationResult.endRow = minRow;
        operationResult.endCol = startCol;

        this.logger.log('Returning operationResult:', operationResult);
    }
};
