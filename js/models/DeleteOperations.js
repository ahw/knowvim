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
        var motionResult = operationResult.motionResult;
        var lowerRow = operationResult.motionResult.lowerPosition.row;
        var higherRow = operationResult.motionResult.higherPosition.row;
        var lowerCol = operationResult.motionResult.lowerPosition.col;
        var higherCol = operationResult.motionResult.higherPosition.col;

        switch(operationResult.motionResult.type) {
            case 'linewise':
                this.logger.log('Removing ' + numLines + ' lines starting at line # ' + (lowerRow + 1));
                lines.splice(lowerRow, numLines);
                var position = Positioning.getPositionAfterLinewiseDelete({
                    lines : lines,
                    motionResult : operationResult.motionResult
                });
                operationResult.endRow = position.row;
                operationResult.endCol = position.col;
                break;

            case 'characterwise':
                // Yank the characters to the left and right of the motion
                // result. Note that lowerRow and higherRow might be
                // references to the same element.

                // If the motion is inclusive, then add 1 to the end index.
                if (motionResult.inclusive)
                    higherCol++;

                // If we hit the end of the line, add 1 to the end index
                if (motionResult.hitEol)
                    higherCol++;

                var leftChars = lines[lowerRow].substring(0, lowerCol);
                var rightChars = lines[higherRow].substring(higherCol);
                this.logger.debug('leftChars = ' + leftChars);
                this.logger.debug('rightChars = ' + rightChars);

                if (higherRow - lowerRow == 0) {
                    this.logger.log('Characterwise delete on same line');
                    // Assert: lowerRow and higherRow are the same thing.
                    lines[lowerRow] = leftChars + rightChars;
                } else {
                    this.logger.log('Characterwise delete on multiple lines');
                    // Assert: characterwise motion spans multiple lines.
                    lines.splice(lowerRow + 1, numLines - 1);
                    lines[lowerRow] = leftChars + rightChars;

                    // An exception for the d{motion} command: If the motion
                    // is not linewise, the start and end of the motion are
                    // not in the same line, and there are only blanks
                    // before the start and after the end of the motion, the
                    // delete becomes linewise.  This means that the delete
                    // also removes the line of blanks that you might expect
                    // to remain.
                    if (/^[\s]*$/.test(rightChars)) {
                        this.logger.debug('Should turn into a linewise');
                        this.logger.debug('lowerRow = ' + lowerRow);
                        this.logger.debug('higherRow = ' + higherRow);
                        lines.splice(higherRow, 1);
                    }
                }

                // If this is a d[count]l delete whose [count]l motion
                // was cut short by the end of line, then we must delete
                // the last character of the line. The above logic will
                // not delete this last character.
                if (motionResult.hitEol) {
                    this.logger.log('Moving column position back by one position since we deleted the last character.');
                    operationResult.endCol = Math.max(0, lines[lowerRow].length - 1);
                }

                break;

            default:
                this.logger.warn('Invalid motion type for delete command "' + args.normalCommand.commandString + '"');
        }
        return operationResult;
    }
};
