var PutOperations = {
    logger : new Logger({
        module : 'operations',
        prefix : 'PUT'
    }),

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

        // Default register name is the unnamed register, '"'.
        var registerName = normalCommand.registerName
            ? normalCommand.registerName
            : '"';

        var operationResult = {
            endRow : args.startRow,
            endCol : args.startCol
        };

        var register = vim.get('registers')[registerName];
        if (typeof register == 'undefined') {
            operationResult.error = 'E353: Nothing in register ' + registerName;
            this.logger.warn('Nothing in register ' + registerName);
            return operationResult;
        } else if (register.type == 'linewise') {
            var offset = 1;
            var putLogger = this.logger;
            this.logger.debug('lines = ', lines);
            register.text.forEach(function(line) {
                lines.splice(args.startRow + offset, 0, line.content);
                putLogger.log('Splicing at index ' + (args.startRow + offset) + ': "' + line.content + '" lines.splice(' + (args.startRow + offset) + ', 0, ' + line.content + ')');
                putLogger.debug('lines = ', lines);
                offset++;
            });
            var position = Positioning.getPositionAfterLinewisePutBelow({
                lines : lines,
                startRow : args.startRow,
                startCol : args.startCol
            });
            operationResult.endRow = position.row;
            operationResult.endCol = position.col;
        } else if (register.type == 'characterwise') {
            this.logger.warn('Characterwise puts not implemented yet. Doing nothing.');
        } else {
            this.logger.warn('Unknown value "' + register.type + '" for register type');
        }

        return operationResult;


    }
};
