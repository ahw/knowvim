var DeleteOperations = {
    logger : new Logger({
        module : 'operations',
        prefix : 'DELETE'
    }),

    /**
     * Returns the result of a delete operation, in the context of startRow,
     * startCol, and an array of lines. This function first calls functions
     * in the YankOperations module and then simply iterates through the
     * returned result and deletes the previously yanked lined. This
     * function handles computing the motionResult if it needs to. It is
     * expected that args containst the following properties:
     *
     *  normalCommand : The object received in
     *      NormalHandler.receiveNormalCommand.
     *  lines : An array of strings representing the buffer
     *  startRow : Number
     *  startCol : Number
     */
    getDeleteOperationResult : function(args) {
        this.logger.debug('Called getDeleteOperationResult');

        // Yank with the exact same arguments.
        var operationResult = YankOperations.getYankOperationResult(args);

        var lines = args.lines;
        var numLines = operationResult.text.length;
        var lowerRow = operationResult.motionResult.lowerPosition.row;
        var higherRow = operationResult.motionResult.higherPosition.row;
        var lowerCol = operationResult.motionResult.lowerPosition.col;
        var higherCol = operationResult.motionResult.higherPosition.col;

        switch(operationResult.motionResult.type) {
            case 'linewise':
                this.logger.log('Removing ' + numLines + ' lines starting at line # ' + (lowerRow + 1));
                lines.splice(lowerRow, numLines);
                break;

            case 'characterwise':
                // Yank the characters to the left and right of the motion
                // result. Note that lowerRow and higherRow might be
                // references to the same element.
                var leftChars = lines[lowerRow].substring(0, lowerCol);
                var rightChars = lines[higherRow].substring(higherCol);
                this.logger.debug('leftChars = ' + leftChars);
                this.logger.debug('rightChars = ' + rightChars);
                if (higherRow - lowerRow == 0) {
                    this.logger.log('Characterwise delete on same line');
                    // Assert: lowerRow and higherRow are the same thing.
                    lines[lowerRow] = leftChars + rightChars;
                }  else if (higherRow - lowerRow == 1) {
                    this.logger.log('Characterwise delete on consecutive lines');
                    // Assert: lowerRow and higherRow are consecutive.
                    lines[lowerRow] = leftChars;
                    lines[higherRow] = rightChars;
                } else {
                    this.logger.log('Characterwise delete on multiple lines');
                    // Assert: characterwise motion spans multiple lines.
                    lines.splice(lowerRow + 1, numLines - 2);
                    lines[lowerRow] = leftChars + rightChars;
                }
                break;

            default:
                this.logger.warn('Invalid motion type for delete command "' + args.normalCommand.commandString + '"');
        }
        return operationResult;
    }
};
