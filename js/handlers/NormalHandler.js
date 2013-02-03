var NormalHandler = Backbone.DeepModel.extend({

    // Defaults.
    defaults : {
        logger : new Logger({
            module : 'normal|handler',
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
        var parser = new NormalParser({ normalHandler : model });
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

    receiveKey : function(key) {
        this.logger().debug('Received key:', key);
        // Send the input to the tokenizer.
        this.get('tokenizer').receiveChar(key);
    },

    /**
     * Handle any normal command which has an "operation" property. Note
     * that arbitrary motions may be incorporated into command.
     */
    handleOperation : function(normalCommand) {
        this.logger().debug('Handling operation which may include some motion');
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
                    statusBar : operationResult.error || ""
                };
                attributes['registers.' + operationResult.registerName] = {
                    type : operationResult.motionResult.type,
                    text : operationResult.text
                };

                // Always set the " register
                attributes['registers.' + Helpers.registerTypes.UNNAMED] = {
                    type : operationResult.motionResult.type,
                    text : operationResult.text
                };

                if (operationResult.motionResult.type == 'characterwise'
                    && operationResult.text.length ==1) {
                    this.logger().info('Setting the "small delete" register (-)', operationResult.text[1]);
                    // Assert: The amount of deleted text was less than one
                    // line which means this is a "small delete"
                    attributes['registers.' + Helpers.registerTypes.SMALL_DELETE] = {
                        type : operationResult.motionResult.type,
                        text : operationResult.text
                    };
                }

                this.get('vim').set(attributes);
                this.logger().info('Setting Vim attributes:', attributes);
                this.logger().info('Finished computing delete operation result:', operationResult);

                // Manually fire a change event to change the buffer.
                this.get('vim').trigger('change:buffer');
                break;

            case 'y':
                var operationResult = YankOperations.getYankOperationResult(args);

                var attributes = {
                    row : operationResult.endRow,
                    col : operationResult.endCol,
                    statusBar : operationResult.error || ""
                };
                attributes['registers.' + operationResult.registerName] = {
                    type : operationResult.motionResult.type,
                    text : operationResult.text
                };

                // Always set the " register
                attributes['registers.' + Helpers.registerTypes.UNNAMED] = {
                    type : operationResult.motionResult.type,
                    text : operationResult.text
                };
                this.get('vim').set(attributes);
                this.logger().info('Setting Vim attributes:', attributes);
                this.logger().info('Finished computing yank operation result:', operationResult);
                break;

            case 'm':
                var operationResult = MarkOperations.getMarkOperationResult(args);
                this.logger().info('Finished computing mark operation result:', operationResult);
                // Do nothing with the result.
                // TODO: Why return something we don't do anything with it?
                break;

            case 'p':
                var operationResult = PutOperations.getPutOperationResult(args);
                this.logger().info('Finished computing put operation result:', operationResult);
                this.logger().debug('Triggering change:buffer event');
                this.get('vim').trigger('change:buffer');

                this.get('vim').set({
                    row : operationResult.endRow,
                    col : operationResult.endCol,
                    statusBar : operationResult.error ? operationResult.error : ""
                });
                break;

            default:
                this.logger().error('Unknown operation:', normalCommand.operationName);
        }
    },

    /**
     * Handle normal commands which are strictly "motion" commands.
     */
    handleMotion : function(normalCommand) {
        this.logger().debug('Handling motion only');
        // If normalCommand.motionCount exists, the motion result
        // will reflect this repetition.
        var motionResult = Motions.getMotionResult({
            normalCommand : normalCommand,
            startRow : this.cursorRow(),
            startCol : this.cursorCol(),
            lines : this.lines(),
            vim : this.get('vim')
        });
        this.get('vim').set({
            row : motionResult.endRow,
            col : motionResult.endCol,
            statusBar : motionResult.error ? motionResult.error : ""
        });
    },

    /**
     * Handle mode-changing normal commands.
     */
    handleModeChange : function(normalCommand) {
        this.logger().debug('Handling Mode change');

        // If this is a transition to INSERT mode we may have to adjust the
        // cursor position depending on which of the many possible ways to
        // enter INSERT mode was used.
        var modeName = Helpers.modeNamesByKey[normalCommand.mode];
        if (modeName == Helpers.modeNames.INSERT) {
            var cursorRow = this.cursorRow();
            var cursorCol = this.cursorCol();
            var lines = this.lines();
            var bufferHasChanged = false;
            switch(normalCommand.mode) {
                // Default case is 'i', where cursor position doesn't change.
                case 'a':
                    if (cursorCol == lines[cursorRow].length - 1) {
                        lines[cursorRow] = lines[cursorRow] + " ";
                        bufferHasChanged = true;
                    }
                    cursorCol++;
                    break;
                case 'A':
                    lines[cursorRow] = lines[cursorRow] + " ";
                    bufferHasChanged = true;
                    cursorCol = lines[cursorRow].length - 1;
                    break;
                case 'I':
                    cursorCol = Math.max(0, lines[cursorRow].search(/\S/));
                    break;
            }
            // Silently set the new column position. It'll get updated when
            // the mode changes.
            this.get('vim').set({col : cursorCol}, {silent : true});
        }
        this.logger().info('Setting Vim mode to "' + modeName + '" from NORMAL');
        this.get('vim').changeMode(modeName);

        if (bufferHasChanged) {
            // Manually fire a change event to change the buffer.
            this.get('vim').trigger('change:buffer');
        }
    },

    receiveNormalCommand : function(normalCommand) {
        this.logger().info('Received normal command "' + normalCommand.commandString + '"', normalCommand);
        var deleteOrYank = /^(delete|yank)$/;

        var args = {
            normalCommand : normalCommand,
            startRow : this.cursorRow(),
            startCol : this.cursorCol(),
            lines : this.lines(),
            vim : this.get('vim')
        };

        if (normalCommand.operationName) {
            this.handleOperation(normalCommand);
        } else if (normalCommand.motionName) {
            this.handleMotion(normalCommand);
        } else if (normalCommand.mode) {
            this.handleModeChange(normalCommand);
        } else {
            this.logger().error('Invalid normal command:', normalCommand);
        }
    }
});
