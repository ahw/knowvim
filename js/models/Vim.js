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

        // --- All other variables below are legacy --- //

        // --- // The command stack holds things like 'd' during a 'dw' command. In
        // --- // general, it contains the characters entered in a multi-character
        // --- // command, before the command is completed.
        // --- command_stack : [],
        // --- // The number of times to repeat a command. E.g., 5x.

        // --- modified_since_last_write : false,
        // --- found_occurrence : false,
        // --- start_search_row : 0,
        // --- made_full_search_cycle : false,
        // --- num_search_terms_found : 0,
        // --- num_search_terms_total : 0,
        // --- start_search_col : 0,
        // --- next_search_index : 0,
        // --- num_substitutions : 0,
        // --- search_options : "",
        // --- last_pattern : "",
        // --- new_term : "",
        // --- previous_key : "",
        // --- preferred_col : 0,
        // --- current_inputline : null,
        // --- num_lines : 0,
        // --- term_bg : "#DDF",
        // --- term_fg : "#555",
        // --- highlight_bg : "#d5d5f8",
        // --- highlight_fg : "#333",
        // --- lineno_bg : "#DDF",
        // --- lineno_fg : "green",
        // --- main_bg : "#DDF",
        // --- vimwindow_bg : "#DDF",
        // --- colorscheme : "default",
        // --- current_line_is_blank : false,
        // --- paste_reg : "",
        // --- last_command : "",
        // --- num_display_lines : 0,
        // --- top_visible_row : 0,
        // --- source_code_undo : [],
        // --- current_col_undo : [],
        // --- current_row_undo : [],
        // --- num_lines_undo : [],
        // --- write_output : false,
        // --- visual_line_start_row : 0,
        // --- hl_span_open : '<span class="visual_line" style="color:white; background-color:green">',
        // --- hl_span_close : '</span>',
        // --- visual_yank_buffer : [],
        // --- beta_color : "green",
        // --- marked_positions : {},
        // --- cancelkeypress : false
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
        this.get('keystrokeLogger').log(key);
        switch(this.get('mode')) {
            case Helpers.modeNames.NORMAL:
                this.get('normalHandler').receiveKey(key);
                break;
            case Helpers.modeNames.INSERT:
                this.get('insertHandler').receiveKey(key);
                break;
            case Helpers.modeNames.CMDLINE:
                this.get('cmdlineHandler').receiveKey(key);
                break;
            default:
                this.logger().error('Somehow got into unknown mode "' + this.get('mode') + '"');
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
