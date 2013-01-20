var Operations = {

    logger : new Logger({
        module : 'operations',
        prefix : 'OPERATIONS'
    }),

    /**
     * Returns the result of a named operation, in the context of startRow,
     * startCol, and an array of lines. This function handles computing the
     * motionResult if it needs to. It is expected that args containst the
     * following properties:
     *
     *  normalCommand : The object received in
     *      NormalHandler.receiveNormalCommand.
     *  lines : An array of strings representing the buffer
     *  startRow : Number
     *  startCol : Number
     *  Vim : The Vim model
     */
    getOperationResult : function(args) {

        switch(args.normalCommand.operationName) {
            case 'y':
                return YankOperations.getYankOperationResult(args);
                break;
            case 'd':
                this.logger.warn('No implementation for the "d" operation');
                return {
                    endRow : args.startRow,
                    endCol : args.startCol,
                    error : ""
                };
                break;
            case 'm':
                return MarkOperations.getMarkOperationResult(args);
                break;
        }
    }
};
