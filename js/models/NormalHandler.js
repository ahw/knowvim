var NormalHandler = Backbone.DeepModel.extend({

    // Defaults.
    defaults : {
        logger : new Logger({
            module : 'normal',
            prefix : 'NORMAL'
        }),
        parser : null,
        tokenizer : null,
        operator : null,
        motion : null,
        count : 1, // Used to hold [count] values temporarily.
        state : 'START',
        operatorCount : 1,
        motionCount : 1,
        buffer : null,
        vim : null
    },

    initialize : function(options) {
        var model = this;
        var parser = new Parser({ normalHandler : model });
        var tokenizer = new Tokenizer({ parser : parser });
        model.set({
            vim : options.vim,
            buffer : options.buffer,
            tokenizer : tokenizer,
            parser : parser
        });
    },

    // Helper function to get the cursorRow.
    cursorRow : function() {
        return this.get('vim').get('cursorRow');
    },

    // Helper function to get the cursorCol.
    cursorCol : function() {
        return this.get('vim').get('cursorCol');
    },

    // Helper for returning this.get('buffer').get('lines')
    lines : function() {
        return this.get('vim').get('buffer').get('lines');
    },

    // Helper to get the logger
    logger : function() {
        return this.get('logger');
    },

    input : function(key) {
        // Send the input to the tokenizer.
        this.get('tokenizer').receiveChar(key);
    },

    receiveNormalCommand : function(normalCommand) {
        this.logger().log('Received normalCommand', normalCommand);
        var deleteOrYank = /^(delete|yank)$/;

        var args = {
            normalCommand : normalCommand,
            startRow : this.cursorRow(),
            startCol : this.cursorCol(),
            lines : this.lines(),
            vim : this.get('vim')
        };

        switch(normalCommand.operationName) {
            case 'd':
                var operationResult = DeleteOperations.getDeleteOperationResult(args);

                var attributes = {
                    row : operationResult.endRow,
                    col : operationResult.endCol,
                    statusBar : operationResult.error ? operationResult.error : ""
                };
                attributes['registers.' + operationResult.registerName] = {
                    type : operationResult.motionResult.type,
                    text : operationResult.text
                };
                this.get('vim').set(attributes);
                this.logger().log('Setting Vim attributes:', attributes);
                this.logger().log('Finished computing delete operation result:', operationResult);

                // Manually fire a change event to change the buffer.
                this.get('vim').trigger('change:buffer');
                break;

            case 'y':
                var operationResult = YankOperations.getYankOperationResult(args);
                var attributes = {
                    row : operationResult.endRow,
                    col : operationResult.endCol,
                    statusBar : operationResult.error ? operationResult.error : ""
                };
                attributes['registers.' + operationResult.registerName] = {
                    type : operationResult.motionResult.type,
                    text : operationResult.text
                };
                this.get('vim').set(attributes);
                this.logger().log('Setting Vim attributes:', attributes);
                this.logger().log('Finished computing yank operation result:', operationResult);
                break;

            case 'm':
                var operationResult = MarkOperations.getMarkOperationResult(args);
                this.logger().log('Finished computing mark operation result:', operationResult);
                // Do nothing with the result.
                // TODO: Why return something we don't do anything with it?
                break;

            default:
                // Assert: No operation given. This must be a motion only.
                // If there is a motion component to the command, get the motion
                // result. If normalCommand.motionCount exists, the motion
                // result will reflect this repetition.
                var motionResult = Motions.getMotionResult({
                    normalCommand : normalCommand,
                    startRow : this.cursorRow(),
                    startCol : this.cursorCol(),
                    lines : this.lines(),
                    vim : this.get('vim')
                });
                this.logger().log('Finished computing motion result:', motionResult);
                this.get('vim').set({
                    row : motionResult.endRow,
                    col : motionResult.endCol,
                    statusBar : motionResult.error ? motionResult.error : ""
                });
        }
    }
});
