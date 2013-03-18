var PutOperations = function () {
    LOG = new Logger({
        module : 'operations|put',
        prefix : 'PUT'
    });

    return {
        /**
         * Returns the result of a put operation in the context of startRow,
         * startCol, and an array of lines. It is expected that args contains
         * the following properties:
         *
         *  normalCommand : The object received in
         *      NormalHandler.receiveNormalCommand
         *  startRow : Number
         *  startCol : Number
         *  lines : An array of strings representing the buffer
         *  vim : Reference to the Vim model
         */
        getPutOperationResult : function(args) {
            var normalCommand = args.normalCommand;
            var lines = args.lines;
            var startRow = args.startRow;
            var startCol = args.startCol;

            // Default register name is the unnamed register, '"'.
            var registerName = normalCommand.registerName
                ? normalCommand.registerName
                : '"';

            var operationResult = {
                endRow : startRow,
                endCol : startCol
            };

            var register = vim.get('registers')[registerName];
            if (typeof register == 'undefined') {
                operationResult.error = 'E353: Nothing in register ' + registerName;
                LOG.error('Nothing in register ' + registerName);
                return operationResult;
            } else if (register.type == 'linewise') {
                LOG.debug('Linewise put');
                var offset = 1;
                var putLogger = LOG;
                LOG.debug('Putting ' + lines.length + ' lines');
                register.text.forEach(function(line) {
                    lines.splice(startRow + offset, 0, line);
                    putLogger.log('Splicing at index ' + (startRow + offset) + ': "' + line + '" lines.splice(' + (startRow + offset) + ', 0, ' + line + ')');
                    offset++;
                });
                var position = Positioning.getPositionAfterLinewisePutBelow({
                    lines : lines,
                    startRow : startRow,
                    startCol : startCol
                });
                operationResult.endRow = position.row;
                operationResult.endCol = position.col;
            } else if (register.type == 'characterwise' && register.text.length > 1) {
                LOG.debug('Characterwise put spanning multiple lines');
                // Concatenate the characters to the left of the cursor with the
                // first line of text in the register.
                var leftChars = lines[startRow].substring(0, startCol + 1) + register.text[0];
                LOG.debug('leftChars = ' + leftChars);
                // Concatenate the last line of the register with the characters
                // to the right of the cursor.
                var rightChars = register.text[register.text.length - 1] + lines[startRow].substring(startCol + 1);
                LOG.debug('rightChars = ' + rightChars);
                LOG.debug('Original: ' + lines[startRow]);
                lines.splice(startRow, 1, leftChars);
                LOG.debug('Modified: ' + lines[startRow]);
                var offset = 1;
                register.text.forEach(function(line, index) {
                    // If this isn't the first or last line, apply the splice
                    // operation.
                    if (index != 0 && index != register.text.length - 1) {
                        lines.splice(startRow + offset, 0, line);
                        offset++;
                    }
                });
                lines.splice(startRow + register.text.length - 1, 0, rightChars);
                operationResult.endCol = startCol + 1;
            } else if (register.type == 'characterwise' && register.text.length == 1) {
                LOG.debug('Characterwise on single line');
                var newLine = lines[startRow].substring(0, startCol + 1)
                    + register.text[0]
                    + lines[startRow].substring(startCol + 1);
                LOG.debug('Original: ' + lines[startRow]);
                lines.splice(startRow, 1, newLine);
                LOG.debug('Modified: ' + lines[startRow]);
                var offset = 1;
                operationResult.endCol = startCol + 1;

            } else {
                LOG.error('Unknown value "' + register.type + '" for register type');
            }

            return operationResult;
        }
    };
}();
