var Vim = Backbone.DeepModel.extend({

    defaults : {
        mode : 'NORMAL',
        status_bar_text : '',
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
        cancelkeypress : false,
        buffer : new Buffer()
    },

    initialize: function(options) {

        if (options && options.buffer) {
            this.set({buffer : options.buffer});
        }

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
                this.normal_handler(key);
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

    change_mode : function(mode) {
        // First change the status bar.
        switch(mode) {
            case 'INSERT':
                this.set({status_bar_text : '-- INSERT --'});
                break;
            case  'EXECUTE':
                this.set({status_bar_text : ': '});
                break;
            case 'SEARCH':
                this.set({status_bar_text : '/'});
                break;
            case 'NORMAL':
                this.set({status_bar_text : ''});
                break;
        }
        // Now that the status bar has been updated, change the actual mode.
        // This will trigger the view to change.
        console.log('Mode change : ' + mode);
        this.set({mode: mode});
    },

    action_handler : function(key) {
        console.log("NORMAL action : " + key);
    },

    motion_handler : function(key) {
        console.log("NORMAL motion : " + key);
    },

    normal_handler : function(key) {
        switch (key) {
            case 'i':
                this.change_mode('INSERT');
                break;
            case ':':
                this.change_mode('EXECUTE');
                break;
            case '/':
                this.change_mode('SEARCH');
                break;
            case 'h':
            case 'j':
            case 'k':
            case 'l':
            case 'w':
            case 'b':
            case '{':
            case '}':
            case '0':
            case '$':
            case 'G':
            case 'H':
            case 'L':
                this.motion_handler(key);
                break;
            case 'd':
            case 'y':
            case 'c':
            case 'x':
            case 'p':
                this.action_handler(key);
                break;
            case 'g':
                special_handler(key);
                break;
        }
    },

    insert_handler : function(key) {
        switch (key) {
            case 'ESC':
                this.change_mode('NORMAL');
                break;
        }
    },

    search_handler : function(key) {
        switch (key) {
            case 'ESC':
                this.change_mode('NORMAL');
                break;
        }
    },

    execute_handler : function(key) {
        switch (key) {
            case 'ESC':
                this.change_mode('NORMAL');
                break;
        }
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
