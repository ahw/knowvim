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

    // Helper function to get the current row.
    row : function() {
        return this.get('vim').get('row');
    },

    // Helper function to get the current col.
    col : function() {
        return this.get('vim').get('col');
    },

    // Helper for returning this.get('buffer').get('lines')
    lines : function() {
        return this.get('vim').get('buffer').get('lines');
    },

    // Helper to get the logger
    logger : function() {
        return this.get('logger');
    },

    // Helper to get the filename
    filename : function() {
        return this.get('vim').get('buffer').get('name');
    },

    input : function(key) {
        // Send the input to the tokenizer.
        this.get('tokenizer').receiveChar(key);
    },

    receiveNormalCommand : function(normalCommand) {
        this.logger().log('Received normalCommand', normalCommand);

        if (normalCommand.operationName == 'm') {
            // If this is an mark operation, just do it right here.
            var markName = normalCommand.markName;
            var attributes = {};
            attributes['marks.' + markName] = {
                row : this.cursorRow(),
                col : this.cursorCol(),
                filename : this.filename()
            };
            this.get('vim').set(attributes);

        } else if (normalCommand.operationName) {
            // If there is an operator, apply it. If
            // normalCommand.operationCount exists, the operation will be
            // applied that many times.
            var operationResult = Operations.getOperationResult({
                normalCommand : normalCommand,
                startRow : this.cursorRow(),
                startCol : this.cursorCol(),
                lines : this.lines()
            });
            this.logger().log('Finished computing operation result:', operationResult);
            this.get('vim').set({
                row : operationResult.endRow,
                col : operationResult.endCol,
                statusBar : operationResult.statusBar
            });

        } else if (normalCommand.motionName) {
            // If there is a motion component to the command, get the motion
            // result. If normalCommand.motionCount exists, the motion
            // result will reflect this repetition.
            var motionResult = Motions.getMotionResult({
                normalCommand : normalCommand,
                startRow : this.cursorRow(),
                startCol : this.cursorCol(),
                lines : this.lines()
            });
            this.logger().log('Finished computing motion result:', motionResult);
            this.get('vim').set({
                row : motionResult.endRow,
                col : motionResult.endCol,
            });
        }
    }
});
