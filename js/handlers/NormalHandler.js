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

    // Helper function to get the row.
    row : function() {
        return this.get('vim').get('row');
    },

    // Helper function to get the col.
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
        var motionResult = Motions.getMotionResult({
            normalCommand : normalCommand,
            lines : this.lines(),
            startRow : this.row(),
            startCol : this.col(),
            vim : this.get('vim')
        });

        if (motionResult == null) {
            this.logger().warn('Motion result returned null; returning early from handleOperation');
            return;
        }

        // :help operator:
        //
        // Which motions are linewise, inclusive or exclusive is mentioned
        // with the command.  There are however, two general exceptions:
        //
        // 1. If the motion is exclusive and the end of the motion is in
        //    column 1, the end of the motion is moved to the end of the
        //    previous line and the motion becomes inclusive.  Example: "}"
        //    moves to the first line after a paragraph, but "d}" will not
        //    include that line.
        var charsBeforeCursor = this.lines()[motionResult.lowerPosition.row].substring(0, motionResult.lowerPosition.col);
        this.logger().debug('Chars before lowerPosition.col = "' + charsBeforeCursor + '"');
        var lowerPositionFollowsBlanks = /^\s+$/.test(charsBeforeCursor);
        this.logger().debug('lowerPositionFollowsBlanks => ', lowerPositionFollowsBlanks);
        var spansMultipleLines = motionResult.lowerPosition.row != motionResult.higherPosition.row;
        if (motionResult.inclusive == false
                && motionResult.higherPosition.col == 0
                && spansMultipleLines) {

            this.logger().warn('Motion is exclusive and the end of motion is in column 1. End of motion moved to end of previous line');
            motionResult.endRow--;
            motionResult.higherPosition.row--;
            motionResult.endCol = this.lines()[motionResult.endRow].length - 1;
            motionResult.higherPosition.col = motionResult.endCol;
            motionResult.hitEol = true;
            this.logger().debug('motionResult = ', motionResult);
        }
        
        // 2. If the motion is exclusive, the end of the motion is in column
        //    1 and the start of the motion was at or before the first
        //    non-blank in the line, the motion becomes linewise.  Example: If
        //    a paragraph begins with some blanks and you do "d}" while
        //    standing on the first non-blank, all the lines of the paragraph
        //    are deleted, including the blanks.  If you do a put now, the
        //    deleted lines will be inserted below the cursor position.
        if (motionResult.inclusive == false
                && motionResult.higherPosition.col == 0
                && lowerPositionFollowsBlanks) {

            this.logger().warn('Motion is exclusive, end of motion is in column 1, and start of motion was at or before first non-blank.');
            this.logger().warn('Motion is becoming linewise');
            motionResult.type = 'linewise';
        }

        // :help word
        //
        // Another special case: When using the "w" motion in combination
        // with an operator and the last word moved over is at the end of a
        // line, the end of that word becomes the end of the operated text,
        // not the first word in the next line.
        if (normalCommand.motionName == 'w' && spansMultipleLines) {

            this.logger().warn('Motion "w" moved over EOL; setting endRow to startRow and endCol to end of word');
            motionResult.endRow = motionResult.startRow;
            motionResult.higherPosition.row = motionResult.startRow;
            motionResult.endCol = this.lines()[motionResult.endRow].length - 1;
            motionResult.higherPosition.col = motionResult.endCol;
            motionResult.hitEol = true;
        }

        if (normalCommand.motionName == 'w' && this.lines()[motionResult.startRow] == "") {

            this.logger().warn('Motion "w" occurred on an empty line; motion is becoming linewise');
            motionResult.type = 'linewise';
        }

        var args = {
            normalCommand : normalCommand,
            motionResult : motionResult,
            startRow : this.row(),
            startCol : this.col(),
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

                // Set the small delete register, if appropriate
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

                // If all the lines were deleted from the buffer, make sure
                // there is at least one empty one.
                if (this.lines().length == 0) {
                    this.logger().warn('Buffer is entirely empty.');
                }
            

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
            startRow : this.row(),
            startCol : this.col(),
            lines : this.lines(),
            vim : this.get('vim')
        });

        if (motionResult == null) {
            this.logger().warn('Received null motion result; returning early');
            this.logger().debug('Positions before return:', {
                row : this.get('vim').get('row'),
                col : this.get('vim').get('col')
            });
            return;
        }

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
            var row = this.row();
            var col = this.col();
            var lines = this.lines();
            var bufferHasChanged = false;

            // If there are no lines in the buffer, push an empty string to
            // make the following logic work.
            if (lines.length == 0)
                lines.push("");

            switch(normalCommand.mode) {
                case 'i':
                    if (lines[row] == "") {
                        lines[row] = " ";
                        bufferHasChanged = true;
                    }
                    break;

                case 'a':
                    if (col == lines[row].length - 1) {
                        lines[row] = lines[row] + " ";
                        bufferHasChanged = true;
                    }
                    col++;
                    break;

                case 'A':
                    lines[row] = lines[row] + " ";
                    bufferHasChanged = true;
                    col = lines[row].length - 1;
                    break;

                case 'I':
                    col = Math.max(0, lines[row].search(/\S/));
                    if (lines[row] == "") {
                        lines[row] = " ";
                        bufferHasChanged = true;
                    }
                    break;

                case 'o':
                    lines.splice(row + 1, 0, " ");
                    col = 0; // TODO: Position column correctly.
                    row++;
                    bufferHasChanged = true;
                    break;

                case 'O':
                    lines.splice(row, 0, " ");
                    col = 0; // TODO: Position column correctly.
                    bufferHasChanged = true;
                    break;
                    
            }
            // Silently set the new column position. It'll get updated when
            // the mode changes.
            this.get('vim').set({
                col : col,
                row : row
            }, {silent : true});
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

        var args = {
            normalCommand : normalCommand,
            startRow : this.row(),
            startCol : this.col(),
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
