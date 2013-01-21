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
        executeHandler : null,

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
        // --- current_sb_col : 0,
        // --- previous_key : "",
        // --- current_row : 0,
        // --- current_col : 0,
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
            executeHandler : new ExecuteHandler({ vim : model })
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
                    registers : {}
                });

                // Call the callback function
                callback();
            },
            error : function() {
                model.logger().warn('Error fetching buffer with name "' + name + '". Keeping current buffer as-is.');
            }
        });
    },

    keyHandler : function(key) {
        this.get('keystrokeLogger').log(key);
        switch(this.get('mode')) {
            case Helpers.modeNames.NORMAL:
                this.get('normalHandler').input(key);
                break;
            case Helpers.modeNames.INSERT:
                this.get('insertHandler').receiveKey(key);
                break;
            case Helpers.modeNames.EXECUTE:
                this.get('executeHandler').receiveKey(key);
                break;
            default:
                this.logger().warn('Somehow got into unknown mode "' + this.get('mode') + '"');
        }
    },

    changeMode : function(mode) {
        // First change the status bar.
        switch(mode) {
            case Helpers.modeNames.INSERT:
                this.set({statusBar : '-- INSERT --'});
                break;
            case Helpers.modeNames.EXECUTE:
                this.set({statusBar : ':'});
                break;
            case Helpers.modeNames.SEARCH:
                this.set({statusBar : '/'});
                break;
            case Helpers.modeNames.NORMAL:
                this.set({statusBar : ''});
                break;
        }
        // Now that the status bar has been updated, change the actual mode.
        // This will trigger the view to change.
        this.logger().log('Mode change : ' + mode);
        this.set({mode : mode});
    }

});
