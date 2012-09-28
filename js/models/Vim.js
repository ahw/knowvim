var Vim = Backbone.DeepModel.extend({

    defaults : {
        buffer : null,
        mode : 'NORMAL',
        normalHandler : null,
        col : 0,
        row : 0,

        // The lower left-hand corner text. Indicates the mode or error
        // messages.
        statusBarText : '',
        // The command stack holds things like 'd' during a 'dw' command. In
        // general, it contains the characters entered in a multi-character
        // command, before the command is completed.
        command_stack : [],
        // The number of times to repeat a command. E.g., 5x.

        modified_since_last_write : false,
        found_occurrence : false,
        start_search_row : 0,
        made_full_search_cycle : false,
        num_search_terms_found : 0,
        num_search_terms_total : 0,
        start_search_col : 0,
        next_search_index : 0,
        num_substitutions : 0,
        search_options : "",
        last_pattern : "",
        new_term : "",
        current_sb_col : 0,
        previous_key : "",
        current_row : 0,
        current_col : 0,
        preferred_col : 0,
        current_inputline : null,
        num_lines : 0,
        term_bg : "#DDF",
        term_fg : "#555",
        highlight_bg : "#d5d5f8",
        highlight_fg : "#333",
        lineno_bg : "#DDF",
        lineno_fg : "green",
        main_bg : "#DDF",
        vimwindow_bg : "#DDF",
        colorscheme : "default",
        current_line_is_blank : false,
        paste_reg : "",
        last_command : "",
        num_display_lines : 0,
        top_visible_row : 0,
        source_code_undo : [],
        current_col_undo : [],
        current_row_undo : [],
        num_lines_undo : [],
        write_output : false,
        visual_line_start_row : 0,
        hl_span_open : '<span class="visual_line" style="color:white; background-color:green">',
        hl_span_close : '</span>',
        visual_yank_buffer : [],
        beta_color : "green",
        marked_positions : {},
        cancelkeypress : false
    },

    initialize : function(options) {
        var model = this;

        // If there was a buffer option, set it.
        if (options && options.buffer) {
            model.set({buffer : options.buffer});
        } else {
            model.set({buffer : new Buffer()});
        }

        // Initialize the NormalHandler.
        model.set({
            normalHandler : new NormalHandler({ vim : model })
        });

    },

    openBuffer : function(name, callback) {
        var model = this;
        var buffer = new Buffer({name : name});
        // Silently set the new buffer.
        model.set({buffer : buffer}, {silent: true});
        buffer.fetch({
            success : function() {
                // Manually trigger the change event on success.
                model.change();
            }
        });
    },

    keyHandler : function(key) {
        switch(this.get('mode')) {
            case 'NORMAL':
                this.get('normalHandler').input(key);
                break;
            case 'INSERT':
                this.insert_handler(key);
                break;
            case 'EXECUTE':
                this.execute_handler(key);
                break;
            case 'SEARCH':
                this.search_handler(key);
                break;
            case 'NEWFILE':
                this.newfile_handler(key);
                break;
            case 'SEARCH_AND_REPLACE':
                this.searchreplace_handler(key);
                break;
            case 'VISUAL_LINE':
                this.visual_line_handler(key);
                break;
            case 'REPLACE':
                this.replace_handler(key);
                break;
            case 'REPLACE_SINGLE':
                this.replace_single_handler(key);
                break;
            case 'FIND_SINGLE':
                this.find_single_handler(key);
                break;
            case 'SET_MARK':
                this.set_mark_handler(key);
                break;
            case 'GOTO_MARK':
                this.goto_mark_handler(key);
                break;
        }
    },

    changeMode : function(mode) {
        // First change the status bar.
        switch(mode) {
            case 'INSERT':
                this.set({statusBarText : '-- INSERT --'});
                break;
            case  'EXECUTE':
                this.set({statusBarText : ': '});
                break;
            case 'SEARCH':
                this.set({statusBarText : '/'});
                break;
            case 'NORMAL':
                this.set({statusBarText : ''});
                break;
        }
        // Now that the status bar has been updated, change the actual mode.
        // This will trigger the view to change.
        console.log('Mode change : ' + mode);
        this.set({mode: mode});
    },

    insert_handler : function(key) {
    },

    search_handler : function(key) {
    },

    execute_handler : function(key) {
    },

    newfile_handler : function(key) {
    },

    searchreplace_handler : function(key) {
    },

    visual_line_handler : function(key) {
    },

    replace_handler : function(key) {
    },

    replace_single_handler : function(key) {
    },

    find_single_handler : function(key) {
    },

    set_mark_handler : function(key) {
    },

    goto_mark_handler : function(key) {
    }

});
