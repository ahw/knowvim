var MarkOperations = {

    logger : new Logger({
        module : 'operations|mark',
        prefix : 'MARK'
    }),

    /**
     * Returns the result of a mark operation, in the context of startRow,
     * startCol, and an array of lines. This operation is very simple. It is
     * expected that args has the following properties:
     *
     *  normalCommand : The object received in
     *      NormalHandler.receiveNormalCommand.
     *  lines : An array of strings representing the buffer
     *  startRow : Number
     *  startCol : Number
     *  vim : The Vim model.
     */
    getMarkOperationResult : function(args) {
        var startRow = args.startRow;
        var startCol = args.startCol;
        var markName = args.normalCommand.markName;
        var attributes = {};
        attributes['marks.' + markName] = {
            row : startRow,
            col : startCol
        };
        vim.set(attributes);
        var operationResult = {
            endRow : startRow,
            endCol : startCol
        };
        this.logger.log('Set mark "' + markName + '"');
        this.logger.log('All marks:', vim.get('marks'));
        return operationResult;
    }
};
