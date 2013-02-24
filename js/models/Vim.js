var Vim = Backbone.DeepModel.extend({

    defaults : {
        // The logger.
        logger : new Logger({
            module : 'vim',
            prefix : 'VIM'
        }),

        // The keystroke logger. Used for recording all keystrokes in a session.
        keystrokeLogger : new KeystrokeLogger({
            vim : this
        }),

        buffer : null,
        mode : Helpers.modeNames.NORMAL,
        normalHandler : null,
        insertHandler : null,
        cmdlineHandler : null,

        // Where the row position _should_ be. This is not always the same
        // as cursorRow, which represents the row position of the cursor.
        // While computing the result of a "j" motion, for example, the row
        // position will be different than cursorRow until the view is
        // updated the cursor is actually moved.
        row : 0,

        // Where the col position _should_ be. This is not always the same
        // as cursorRow, which represents the col position of the cursor.
        // While computing the result of a "k" motion, for example, the col
        // position will be different than cursorCol until the view is
        // updated the cursor is actually moved.
        col : 0,

        // The row position of the cursor. Unlike "row", this variable is
        // only updated when the cursor actually moves. (The "row" variable
        // above may change mid-command as new positions are computed.)
        cursorRow : 0,

        // The col position of the cursor. Unlike "col", this variable is
        // only updated when the cursor actually moves. (The "col" variable
        // above may change mid-command as new positions are computed.)
        cursorCol : 0,

        // The lower left-hand corner text. Indicates the mode or error
        // messages.
        statusBar : '',

        // The list of all marks in a buffer.
        marks : {},

        // The set of all Registers
        registers : {},

        // The cursor position within the statu bar.
        statusBarCol : 0,

        // The text displayed in the console area of Vim.
        console : ''
    },

    initialize : function(options) {
        var model = this;

        // If there was a buffer option, set it.
        if (options && options.buffer) {
            model.set({buffer : options.buffer});
        } else {
            model.set({buffer : new Buffer()});
        }

        // Initialize the NormalHandler and InsertHandler
        model.set({
            normalHandler : new NormalHandler({ vim : model }),
            insertHandler : new InsertHandler({ vim : model }),
            cmdlineHandler : new CmdlineHandler({ vim : model })
        });

    },

    // Helper function to get the Logger.
    logger : function() {
        return this.get('logger');
    },

    openBuffer : function(name, callback) {
        this.logger().log('Opening buffer '  + name);
        var model = this;
        var buffer = new Buffer({name : name});
        buffer.fetch({
            success : function() {
                // Set the new buffer and reset state.
                model.set({
                    buffer : buffer,
                    row : 0,
                    col : 0,
                    cursorRow : 0,
                    cursorCol : 0,
                    marks : {},
                    registers : {
                        '%' : { // The filename register
                            type : 'linewise',
                            text : [name]
                        }
                    }
                });

                // Call the callback function
                if (callback)
                    callback();
            },
            error : function() {
                model.logger().error('Error fetching buffer with name "' + name + '". Keeping current buffer as-is.');
            }
        });
    },

    receiveKey : function(key) {
        var model = this;
        model.get('keystrokeLogger').log(key);
        switch(model.get('mode')) {
            case Helpers.modeNames.NORMAL:
                model.get('normalHandler').receiveKey(key);
                break;
            case Helpers.modeNames.INSERT:
                model.get('insertHandler').receiveKey(key);
                break;
            case Helpers.modeNames.CMDLINE:
                model.get('cmdlineHandler').receiveKey(key);
                break;
            default:
                model.logger().error('Somehow got into unknown mode "' + model.get('mode') + '"');
        }
    },

    changeMode : function(mode) {
        // First change the status bar.
        switch(mode) {
            case Helpers.modeNames.INSERT:
                this.set({statusBar : '-- INSERT --'});
                break;
            case Helpers.modeNames.CMDLINE:
                this.set({statusBar : ':'});
                break;
            case Helpers.modeNames.SEARCH:
                this.set({statusBar : '/'});
                break;
            case Helpers.modeNames.NORMAL:
                this.set({
                    statusBar : '',
                    statusBarCol : 0
                });
                break;
        }
        // Now that the status bar has been updated, change the actual mode.
        // This will trigger the view to change.
        this.logger().log('Mode change : ' + mode);
        this.set({mode : mode});
    },

    showRegisters : function() {
        var consoleText = [];
        var thisLogger = this.logger();
        var registers = this.get('registers');
        // Iterate over the array of possible registers in the correct order
        Helpers.getOrderedRegisterNames().forEach(function(registerName) {
            var register = registers[registerName];
            // Check if this register is set.
            if (typeof register != 'undefined') {
                var newlineDelimiter = Colorizer.color('^J', 'dodgerblue');
                var joinedText = register.text.join(newlineDelimiter);
                var line = sprintf('"%s   %s', registerName, joinedText);
                consoleText.push(line);
                thisLogger.debug('Adding line to Vim console:', line);
            }
        });
        consoleText.push(Colorizer.color('Press any key to continue', 'darkblue'));
        this.set({
            statusBar : Colorizer.color('--- Registers ---', 'darkblue'),
            console : consoleText
        });
        this.logger().debug('Vim.console:', this.get('console'));
    }

});
