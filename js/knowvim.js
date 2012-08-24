// knowvim.js - a partial Javascript implementation of Vim for the browser.
// Copyright (C) 2011 Andrew W. Hallagan
// 
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation; either version 2 of the License, or (at your
// option) any later version. Modifications and/or copies of this program
// must attribute the original author and any contributing authors listed
// here.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
var mode = "NORMAL";
var modified_since_last_write = false;
var found_occurrence = false;
var start_search_row = 0;
var made_full_search_cycle = false;
var num_search_terms_found = 0;
var num_search_terms_total = 0;
var start_search_col = 0;
var next_search_index = 0;
var num_substitutions = 0;
var search_options = "";
var last_pattern = "";
var new_term = "";
var current_sb_col = 0;
var previous_key = "";
var current_row = 0;
var current_col = 0;
var preferred_col = 0;
var current_inputline = null;
var num_lines = 0;
var term_bg = "#DDF";
var term_fg = "#555";
var highlight_bg = "#d5d5f8";
var highlight_fg = "#333";
var lineno_bg = "#DDF";
var lineno_fg = "green";
var main_bg = "#DDF";
var vimwindow_bg = "#DDF";
var colorscheme = "default";
var current_line_is_blank;
var paste_reg = "";
var last_command = "";
var num_display_lines = 0;
var top_visible_row = 0;
var source_code_undo = [];
var current_col_undo = [];
var current_row_undo = [];
var num_lines_undo = [];
var write_output = false;
var visual_line_start_row = 0;
var hl_span_open = '<span class="visual_line" style="color:white; background-color:green">';
var hl_span_close = '</span>';
var visual_yank_buffer = [];
var beta_color = "green";
var marked_positions = {};
var cancelkeypress = false;

function vim_handler(key) {
    switch(mode) {
        case "NORMAL":
            normal_handler(key);
            break;
        case "INSERT":
            insert_handler(key);
            break;
        case "EXECUTE":
            execute_handler(key);
            break;
        case "NEWFILE":
            newfile_handler(key);
            break;
        case "SEARCH_AND_REPLACE":
            searchreplace_handler(key);
            break;
        case "VISUAL_LINE":
            visual_line_handler(key);
            break;
        case "REPLACE":
            replace_handler(key);
            break;
        case "REPLACE_SINGLE":
            replace_single_handler(key);
            break;
        case "FIND_SINGLE":
            find_single_handler(key);
            break;
        case "SET_MARK":
            set_mark_handler(key);
            break;
        case "GOTO_MARK":
            goto_mark_handler(key);
            break;
        default:
            // Equivalent to a null handler.
            break;
    }
}



$(document).ready(function() {
    var disregard_key = true;
    init();
    $(document).keydown(function(e) {
        // Handle only what we  need to with keydown to make Chrome work.
        // Ignore all else, because translating a keydown keycode to ASCII
        // is a pain.
        // e.preventDefault();
        // alert('keydown event');
        var key = null;
        // alert("keydown: e.which = " + e.which);
        switch (e.which) {
            case 190:
                // The dot '.'
                // Trying to cope with Opera.
                e.preventDefault();
                key = '.';
                break;
            case 191:
                // The slash '/'
                // Trying to cope with Opera.
                e.preventDefault();
                key = '/';
                break;
            case 32:
                // The space ' '
                // Trying to stop page from centering.
                e.preventDefault();
                key = ' ';
                break;
            case 37:
                key = '<LARROW>';
                break;
            case 38:
                key = '<UARROW>';
                break;
            case 39:
                key = '<RARROW>';
                break;
            case 40:
                key = '<DARROW>';
                break;
            case 27:
                key = '<ESC>';
                break;
            case 8:
                e.preventDefault();
                key = '<BACKSPACE>';
                break;
            case 13:
                e.preventDefault();
                key = '<ENTER>';
                break;
            case 46:
                key = '<DEL>';
                break;
            case 9:
                e.preventDefault();
                key = '<TAB>';
                break;
            default:
                key = null;
                disregard_key = false;
        }
        if (key != null) {
            vim_handler(key);
        }
    });

    $(document).keypress(function(e) {
        if (disregard_key == false) {
            // Assert: key was not handled by the keydown handler.
            disregard_key = true;
            e.stopPropagation();
            // alert("keypress: String.fromCharCode(e.which) = " + String.fromCharCode(e.which));
            var key = String.fromCharCode(e.which);
            if (e.which >= 32 && e.which <= 126) {
                // Assert: the char code corresponds to an ASCII character.
                key = String.fromCharCode(e.which);
                vim_handler(key);
            }
        }
    });
});

function init() {
    // console.debug("init(): Begin initialization.");
    // Initialize state variables.
    mode = "NORMAL";
    previous_key = "";
    current_row = 0;
    current_col = 0;
    preferred_col = 0;
    num_lines = $(".line").length;
    current_inputline = $(".line")[0];
    last_command = "";
    paste_reg = "";
    if (num_display_lines == 0) {
        // Only set this if it's the very first page load.
        num_display_lines = 20;
    }
    top_visible_row = 0;
    current_sb_col = 0;
    source_code_undo = [];
    current_row_undo = [];
    current_col_undo = [];
    num_lines_undo = [];
    last_pattern = "";
    search_options = "";
    new_term = "";
    found_occurrence = false;
    num_substitutions = 0;
    next_search_index = 0;
    start_search_row = 0;
    start_search_col = 0;
    made_full_search_cycle = false;
    num_search_terms_found = 0;
    num_search_terms_total = 0;
    modified_since_last_write = false;
    visual_line_start_row = 0;
    visual_yank_buffer = [];
    marked_positions = {};

    // Change the colorscheme according to the PHP 'colorscheme' session
    // variable.  Input validation shall happen in the change_colorscheme
    // method.
    $.ajax({
        type:"GET",
        url:"colorscheme.php",
        success:function(data) {
            switch(data) {
                case "minimal":
                case "winter":
                case "default":
                case "hicon":
                    change_colorscheme(data);
                    break;
                default:
                    // Nothing.
            }
        }
    });

    // Put nothing in the status bar.
    change_status_bar(" ");

    // Fill in the contents of the #current_row and #current_col counters.
    $("#current_row").html(current_row + 1);
    $("#current_col").html(current_col + 1);


    // console.debug("Number of lines of source code: " + num_lines);

    // Take the set the background-color and color properties of each line,
    // just in case the CSS file is out of date.
    $(".line").each(function() {
        $(this).css("background-color", term_bg);
        $(this).css("color", term_fg);
    });

    // Format each <pre class="num"> element so that numbers line up
    // correctly using space padding.  E.g.,
    //        99
    //       100
    // Assume the HTML already has correctly-numbered lines.
    $(".num").each(function() {
        var n = parseInt($(this).html());
        formatted_n = get_formatted_lineno(n);
        $(this).html(formatted_n);
        $(this).css("background-color", lineno_bg);
        $(this).css("color", lineno_fg);
    });

    // Highlight the current row.
    $(current_inputline).css("background-color", highlight_bg);
    $(current_inputline).css("color", highlight_fg);

    // Put the cursor at the current column, which will highlight that
    // column red.
    put_cursor_at_col(current_col, true);

    // Hide the rows that are outside the range
    // [top_visible_row, num_display_lines - 1]
    // num_display_lines = 25;
    if (num_display_lines > 0) {
        for (var i = 0; i < num_lines; i++) {
            if (i < top_visible_row || i > (top_visible_row + num_display_lines - 1)) {
                var lineno = $(".num").get(i);
                $(lineno).hide();
                var inputline = $(".line").get(i);
                $(inputline).hide();
            }
        }
    }


}


function load_new_file_screen(filename) {
    var start_color = null;
    var path = "/files/" + filename;
    switch(colorscheme) {
        case 'minimal':
            start_color = "#AAA";
            break;
        default:
            start_color = "white";
    }
    $("#source_code").load(path, function() {
        // -- $("#vimwindow").css("background-color", start_color);
        // -- $("#vimwindow").animate({backgroundColor: vimwindow_bg}, 1000);
        // -- $("#main").css("background-color", start_color);
        // -- $("#main").animate({backgroundColor: main_bg}, 1000);
        // -- $(".num").css("background-color", start_color);
        // -- $(".num").animate({backgroundColor: lineno_bg}, 1000);
        // -- $(".line").css("background-color", start_color);
        // -- $(".line").animate({backgroundColor: term_bg}, 1000, function() {
        // --     $(current_inputline).css("background-color", highlight_bg);
        // --     $(current_inputline).css("color", highlight_fg);
        // -- });
        $("body").css("background-color", "yellow");
        $("body").animate({backgroundColor: term_bg}, 1000);
        if (mode == "NEWFILE") {
            // This looks ugly, but the "mode" global var is set to "NORMAL"
            // after the call to init().  We need init() in order to reset
            // line numbers, line visibilities, etc., but after its called
            // we'll have to put the mode back to NEWFILE.  (When mode ==
            // "NEWFILE", all keyboard input is directed to
            // newfile_handler(), which basically does nothing until "i" is
            // pressed, at which point the user has a blank buffer they can
            // start typing into.  Just run "vim" with no arguments on the
            // command line and you'll see what I mean.
            init();
            mode = "NEWFILE";
        } else {
            init();
        }
        // put_cursor_at_row(0);
        // put_cursor_at_col(0, true);
        // num_display_lines = 16;
    });
    $(".source_code_link").removeClass("current_page");
}

function flash_screen() {
    $("#cursor_char").css("background-color", "white");
    $("#cursor_char").css("color", "#CC0000");
    setTimeout(function () {
        $("#cursor_char").css("background-color", "#CC0000");
        $("#cursor_char").css("color", "white");
    }, 50);
    // $(".line").effect("highlight", {color:"white"}, 500);
}

function change_status_bar(text) {
    $("#statusbar").html(text);
}

function get_formatted_lineno(n) {
    if (n < 10) {
        return "  " + n;
    } else if (n < 100) {
        return " " + n;
    } else if (n < 1000) {
        return "" + n;
    } else {
        // Let's just assume no one is working 
        // with a file bigger than 10,000 lines.
        // That would be obnoxious.
        return "---";
    }
}

function change_statusbar(name) {
    change_status_bar(name);
}

function remove_span_tags(line) {
    // Note: we're taking text like this:
    //
    // * here is a li<span id="cursor_char">n</span>e of text
    //
    // And stripping the <span> tags so that it becomes
    //
    // * here is a line of text

    // Find the index of the <span id="cursor_char"> tag.
    //                       |
    //                       |
    //                       +--- that's this character.
    span_open = line.indexOf('<span id="cursor_char">');
    if (span_open == -1) {
        // console.debug('remove_span_tags(): line = <' + line + '>');
        return line;
    }

    // Get all the text up until the <span> opening tag.
    left_side = line.substring(0, span_open);

    // Get the single character sandwiched between <span> tags.
    // Note: "<span id="cursor_char">".length = 23
    middle = line.charAt(span_open + 23);

    // Get the rest of the text after the <span> closing tag.
    // Note: "</span>".length = 7
    span_close = line.indexOf("</span>");
    right_side = line.substring(span_close + 7, line.length);
    return left_side + middle + right_side;
}

function get_current_line_length() {
    var cleansed_contents = remove_span_tags($(current_inputline).html());
    // console.debug("get_current_line_length() for row " + current_row + " returned " + cleansed_contents.length);
    return cleansed_contents.length;
}

function update_rc_counters () {
    $("#current_row").html(current_row + 1);
    $("#current_col").html(current_col + 1);
}

function maintain_line_visibilities() {
    // This method iterates over ALL .num and .line elements and
    // sets their visibilities accordingly.  Because it loops through all
    // lines, it is an expensive operation that should only be called when a
    // complete re-setting of line visiblities is needed.  For example, when
    // the num_display_lines global var is changed through a :set
    // displaylines=<NUMBER> command.  To handle any other changes in line
    // visibilities because of cursor movements, use
    // set_line_visibilities().
    for (var i = 0; i < num_lines; i++) {
        var lineno = $(".num").get(i);
        var inputline = $(".line").get(i);
        if (num_display_lines == 0) {
            // Assert: a num_display_lines value of 0 means we want to show
            // all lines.
            $(lineno).show();
            $(inputline).show();
        } else if (i < top_visible_row || i > (top_visible_row + num_display_lines - 1)) {
            // Assert this line is NOT in the visible range.
            $(lineno).hide();
            $(inputline).hide();
        } else {
            // Assert: this line IS in the visible range.
            $(lineno).show();
            $(inputline).show();
        }
    }
    // * var original_num_tilda_lines = $(".tilda_lineno").length;
    // * // Add or remove the appropriate number of "tilda lines."
    // * if (num_lines + original_num_tilda_lines < num_display_lines) {
    // *     // Assert: we need to add tilda lines.
    // *     for (var i = 0; i < (num_display_lines - num_lines - original_num_tilda_lines); i++) {
    // *         var last_inputline = $(".line").get(num_lines - 1);
    // *         var tilda_line = '<pre class="tilda_lineno">~  </pre><pre class="tilda_inputline"></pre>';
    // *         $(tilda_line).insertAfter($(last_inputline));
    // *     }
    // * } else if (num_lines + original_num_tilda_lines > num_display_lines) {
    // *     // Assert: we need to remove tilda lines
    // *     var overflow = num_lines + original_num_tilda_lines - num_display_lines;
    // *     overflow = Math.min(overflow, original_num_tilda_lines);
    // *     var tilda_lineno = null;
    // *     var tilda_inputline = null;
    // *     for (var i = 0; i < overflow; i++) {
    // *         tilda_lineno = $(".tilda_lineno").get(0);
    // *         tilda_inputline = $(".tilda_inputline").get(0);
    // *         $(tilda_lineno).remove();
    // *         $(tilda_inputline).remove();
    // *     }
    // * }
}

function in_visible_range(row) {
    if (row >= top_visible_row && row <= (top_visible_row + num_display_lines - 1)) {
        return true;
    } else {
        return false;
    }
}

function show_lines_in_range(start, end) {
    for (var i = start; i <= end; i++) {
        var lineno = $(".num").get(i);
        var inputline = $(".line").get(i);
        $(lineno).show();
        $(inputline).show();
    }
}

function hide_lines_in_range(start, end) {
    for (var i = start; i <= end; i++) {
        var lineno = $(".num").get(i);
        var inputline = $(".line").get(i);
        $(lineno).hide();
        $(inputline).hide();
    }
}
function set_line_visibilities() {
    // This method is intended to be called after any vertical movement of
    // the cursor.  It checks if the cursor it outside the visible range.
    // If so, it adjusts the visibility of each line to make the cursor
    // row in the visible range.  It also renumbers rows, since only lines
    // within the old visibility range are guaranteed to have the right line
    // numbering.
    if (num_display_lines == 0) { return; }
    if (current_row < top_visible_row) {
        // Assert: the current row is above the visible space.
        var delta = top_visible_row - current_row;
        if (delta < num_display_lines) {
            // console.debug("set_line_visibilities(): current row is above visible space.");
            // console.debug("set_line_visibilities(): new top_visible_row = " + top_visible_row);
            // Loop through all rows starting with current up to the first
            // row that we know is already visible. (There are <delta> number of
            // these.)
            for (var i = current_row; i < (current_row + delta); i++) {
                var lineno = $(".num").get(i);
                var inputline = $(".line").get(i);
                // By design, we know these elements were outside the visible
                // range but should now be set to visible.
                $(lineno).show();
                $(inputline).show();
            }
            // last_row represents the last previously visible row that should
            // be set to invisible.
            var last_row = top_visible_row + num_display_lines - 1;
            for (var i = last_row; i > last_row - delta; i--) {
                var lineno = $(".num").get(i);
                var inputline = $(".line").get(i);
                // By design, we know these elements were within the visible
                // range but should now be set to invisible.
                $(lineno).hide();
                $(inputline).hide();
            }
            top_visible_row = current_row;
        } else {
            for (var i = current_row; i < (current_row + num_display_lines); i++) {
                var lineno = $(".num").get(i);
                var inputline = $(".line").get(i);
                // By design, we know these elements were outside the visible
                // range but should now be set to visible.
                $(lineno).show();
                $(inputline).show();
            }
            for (var i = top_visible_row; i < (top_visible_row + num_display_lines); i++) {
                var lineno = $(".num").get(i);
                var inputline = $(".line").get(i);
                // By design, we know these elements were within the visible
                // range but should now be set to invisible.
                $(lineno).hide();
                $(inputline).hide();
            }
            top_visible_row = current_row;
        }
    } else if (current_row > (top_visible_row + num_display_lines - 1)) {
        // Assert: the current row is below the visible space.
        // console.debug("set_line_visibilities(): current row is below visible space.");
        // console.debug("set_line_visibilities(): new top_visible_row = " + top_visible_row);
        var delta = current_row - (top_visible_row + num_display_lines) + 1;
        if (delta < num_display_lines) {
            for (var i = current_row; i > (current_row - delta); i--) {
                var lineno = $(".num").get(i);
                var inputline = $(".line").get(i);
                $(lineno).show();
                $(inputline).show();
            }
            for (var i = top_visible_row; i < (top_visible_row + delta); i++) {
                var lineno = $(".num").get(i);
                var inputline = $(".line").get(i);
                $(lineno).hide();
                $(inputline).hide();
            }
            top_visible_row = current_row - num_display_lines + 1;
        } else {
            for (var i = current_row; i > (current_row - num_display_lines); i--) {
                var lineno = $(".num").get(i);
                var inputline = $(".line").get(i);
                $(lineno).show();
                $(inputline).show();
            }
            for (var i = top_visible_row; i < (top_visible_row + num_display_lines); i++) {
                var lineno = $(".num").get(i);
                var inputline = $(".line").get(i);
                $(lineno).hide();
                $(inputline).hide();
            }
            top_visible_row = current_row - num_display_lines + 1;
        }
    }
    // This works for now, it's sort of a brute-force solution.  TODO:
    // change this method to accept a lower and upper bound.
    // renumber_lines(top_visible_row);
}

function get_next_lbracket_position() {
    var seen_nonempty_line = false;
    var index = $(".line").index(current_inputline);
    for (index; index > 0; index--) {
        var e = $(".line")[index];
        var contents = $(e).html();
        contents = remove_span_tags(contents);
        if (contents != "" && contents != " ") {
            seen_nonempty_line = true;
        }
        // TODO: change this if test
        if ((contents == "" || contents == " ") && seen_nonempty_line) {
            break;
        }
    }
    return index;
}

function get_next_rbracket_position() {
    var seen_nonempty_line = false;
    var index = $(".line").index(current_inputline);
    for (index; index < (num_lines - 1); index++) {
        var e = $(".line")[index];
        var contents = $(e).html();
        contents = remove_span_tags(contents);
        if (contents != "" && contents != " ") {
            seen_nonempty_line = true;
        }
        // TODO: change this if test
        if ((contents == "" || contents == " ") && seen_nonempty_line) {
            break;
        }
    }
    // console.debug("get_next_rbracket_position(): returning " + index);
    return index;
}

function get_initial_b_state(ch) {
    var pexp = /[\\\!@#\$%\^&\*\+-=<>:;|'"`~,\.\?\/\[\]\(\)\{\}]/;
    var wexp = /\w/;
    var bexp = /\ /;
    var nexp = /\n/;
    var state = "";
    if (wexp.test(ch) == true) {
        // Assert: this is a WORD character.
        state = 'WORD_START';
    } else if (pexp.test(ch) == true) {
        // Assert: this is a PUNCTUATION character.
        state = 'PUNCT_START';
    } else if (bexp.test(ch) == true) {
        // Assert: this is a blank space.
        state = 'BLANK';
    } else if (nexp.test(ch) == true) {
        state = 'NEWLINE';
    } else {
        // Assert: this is something I haven't accounted for.
        state = 'ERROR';
    }
    return state;
}

function put_cursor_at_next_b_position() {
    var state = null;
    var ch = null;
    var category = null;
    var col_offset = 0;
    var contents = get_clean_contents();
    var char_buffer = contents.substring(0, current_col + 1);
    var found_position = false;
    ch = get_cursor_char();
    char_buffer = char_buffer.substring(0, char_buffer.length - 1);
    category = get_character_category(ch);
    state = get_initial_b_state(ch);

    while (found_position == false) {
        if (char_buffer == "") {
            // Assert: character buffer is empty.
            switch(get_character_category(ch)) {
                case 'W':
                    if (state == 'WORD') {
                        found_position = true;
                        state = 'DONE';
                    } else if (state == 'WORD_START') {
                        // console.debug("put_cursor_at_next_b_position(): Need to jump lines from WORD_START state.");
                        if (current_row == 0) {
                            // Asssert: we're at the top row.
                            found_position = true;
                            state = 'DONE';
                            // console.debug("put_cursor_at_next_b_position(): Trying to jump lines from Row 0.");
                        } else {
                            // console.debug("put_cursor_at_next_b_position(): Trying to jump lines.");
                            put_cursor_at_row(current_row - 1);
                            contents = get_clean_contents();
                            put_cursor_at_col(contents.length - 1, true);
                            char_buffer += contents;
                            col_offset = 0;
                            state = 'NEWLINE';
                        }
                    } else {
                        alert("Error finding Word state in b-motion.");
                    }
                    break;
                case 'P':
                    if (state == 'PUNCT') {
                        found_position = true;
                        state = 'DONE';
                    } else if (state == 'PUNCT_START') {
                        // console.debug("put_cursor_at_next_b_motion(): Need to jump lines from PUNCT_START state.");
                        if (current_row == 0) {
                            // Asssert: we're at the top row.
                            // console.debug("put_cursor_at_next_b_position(): Trying to jump lines from Row 0.");
                            found_position = true;
                            state = 'DONE';
                        } else {
                            // console.debug("put_cursor_at_next_b_position(): Trying to jump lines.");
                            put_cursor_at_row(current_row - 1);
                            contents = get_clean_contents();
                            put_cursor_at_col(contents.length - 1, true);
                            col_offset = 0;
                            char_buffer += contents;
                            state = 'NEWLINE';
                        }
                    } else {
                        alert("Error finding Punctuation state in b-motion.");
                    }
                    break;
                case 'B':
                    if (state != 'BLANK') {
                        alert("Error assuming Blank state in b-motion.");
                    }
                    // console.debug("put_cursor_at_next_b_motion(): Need to jump lines from BLANK state.");
                    if (current_row == 0) {
                        // Asssert: we're at the top row.
                        // console.debug("put_cursor_at_next_b_position(): Trying to jump lines from Row 0.");
                    } else {
                        // console.debug("put_cursor_at_next_b_position(): Trying to jump lines.");
                        put_cursor_at_row(current_row - 1);
                        contents = get_clean_contents();
                        put_cursor_at_col(contents.length - 1, true);
                        col_offset = 0;
                        char_buffer += contents;
                        state = 'NEWLINE';
                    }
                    break;
            }
        }

        ch = char_buffer.charAt(char_buffer.length - 1);
        category = get_character_category(ch);
        char_buffer = char_buffer.substring(0, char_buffer.length - 1);
        switch (state) {
            case 'DONE':
                found_position = true;
                break;
            case 'WORD_START':
                if (category == 'W') {
                    state = 'WORD';
                    found_position = false;
                    col_offset--;
                } else if (category == 'B') {
                    state = 'BLANK';
                    found_position = false;
                    col_offset--;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = false;
                    col_offset--;
                }
                break;
            case 'WORD':
                if (category == 'W') {
                    state == 'WORD';
                    found_position = false;
                    col_offset--;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = true;
                } else if (category == 'B') {
                    state == 'BLANK';
                    found_position = true;
                }
                break;
            case 'PUNCT_START':
                if (category == 'W') {
                    state = 'WORD';
                    found_position = false;
                    col_offset--;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = false;
                    col_offset--;
                } else if (category == 'B') {
                    state = 'BLANK';
                    found_position = false;
                    col_offset--;
                }
                break;
            case 'PUNCT':
                if (category == 'W') {
                    state = 'WORD';
                    found_position = true;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = false;
                    col_offset--;
                } else if (category == 'B') {
                    state = 'BLANK';
                    found_position = true;
                }
                break;
            case 'BLANK':
                if (category == 'W') {
                    state = 'WORD';
                    found_postion = false;
                    col_offset--;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = false;
                    col_offset--;
                } else if (category == 'B') {
                    state = 'BLANK';
                    found_position = false;
                    col_offset--;
                }
                break;
            case 'NEWLINE':
                var contents = get_clean_contents();
                if (contents == " ") {
                    found_position = true;
                } else if (category == 'W') {
                    state = 'WORD';
                    found_position = false;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = false;
                } else if (category == 'B') {
                    state = 'BLANK';
                    found_position = false;
                } else {
                    state = 'ERROR';
                    found_position = false;
                }
                break;
            case 'ERROR':
                // console.debug('Error parsing character <'
                             // + ch
                             // + '> under cursor.');
                alert('Error parsing character under cursor.');
                found_position = true;
                break;
            default:
                // Nothing.
        }
    }
    // console.debug("put_cursor_at_next_b_position(): next b position found.");
    put_cursor_at_col(current_col + col_offset, true);
}

function get_cursor_char() {
    var contents = $(current_inputline).html();
    contents = remove_span_tags(contents);
    var ch = contents.charAt(current_col);
    return ch;
}

function get_character_category(ch) {
    var pexp = /[\\\\!@#\$%\^&\*\+-=<>:;|'"`~,\.\?\/\[\]\(\)\{\}]/;
    var wexp = /\w/;
    var bexp = /\ /;
    var nexp = /\n/;
    var category = '';
    if (wexp.test(ch) == true) {
        // Assert: this is a WORD character.
        category = 'W';
    } else if (pexp.test(ch) == true) {
        // Assert: this is a PUNCTUATION character.
        category = 'P';
    } else if (bexp.test(ch) == true) {
        // Assert: this is a blank space.
        category = 'B';
    } else if (nexp.test(ch) == true) {
        // Assert: this is a newline character.
        category = 'N';
    } else {
        // Assert: this is something I haven't accounted for.
        // E = Error.
        category = 'E';
    }
    return category;
}

function get_clean_contents() {
    var contents = $(current_inputline).html();
    contents = remove_span_tags(contents);
    return contents;
}

function put_cursor_at_next_w_position() {
    var state = null;
    var ch = null;
    var category = null;
    var pexp = /[\\\!@#\$%\^&\*\+-=<>:;|'"`~,\.\?\/\[\]\(\)\{\}]/;
    var wexp = /\w/;
    var bexp = /\ /;
    var nexp = /\n/;
    var row_offset = 0;
    var col_offset = 0;
    var contents = get_clean_contents();
    var char_buffer = contents.substring(current_col);
    // Says whether or not we have found the next spot to place the cursor
    // for a 'w' movement.
    var found_position = false;
    ch = get_cursor_char();
    // console.debug("get_cursor_char() returned \'" + ch + "\'");
    if (wexp.test(ch) == true) {
        // Assert: this is a WORD character.
        category = 'W';
        state = 'WORD';
    } else if (pexp.test(ch) == true) {
        // Assert: this is a PUNCTUATION character.
        category = 'P';
        state = 'PUNCT';
    } else if (bexp.test(ch) == true) {
        // Assert: this is a blank space.
        category = 'B';
        state = 'BLANK';
    } else if (nexp.test(ch) == true) {
        category = 'N';
        state = 'NEWLINE';
    } else {
        // Assert: this is something I haven't accounted for.
        // E = Error.
        category = 'E';
        state = 'ERROR';
    }

    while (found_position == false) {

        if (char_buffer == "") {
            // Assert: character buffer is empty.
            if (current_row == (num_lines - 1)) {
                // Assert: we're on the last row.
                found_position = true;
                col_offset--;
                break;
            } else {
                put_cursor_at_row(current_row + 1);
                put_cursor_at_col(0, true);
                var contents = get_clean_contents();
                char_buffer += '\n';
                char_buffer += contents;
            }
        }

        ch = char_buffer.charAt(0);
        category = get_character_category(ch);
        char_buffer = char_buffer.substring(1);

        // console.debug("put_cursor_at_next_w_position(): state = " + state);
        // console.debug("put_cursor_at_next_w_position(): char  = " + ch + " ( " + category + " )");
        // console.debug("put_cursor_at_next_w_position(): col_offset = " + col_offset);
        // console.debug("----------------------------------------------------");
        switch (state) {
            case 'WORD':
                if (category == 'W') {
                    state = 'WORD';
                    found_position = false;
                    col_offset++;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = true;
                } else if (category == 'B') {
                    state = 'BLANK';
                    found_position = false;
                    col_offset++;
                } else if (category == 'N') {
                    col_offset = 0;
                    state = 'NEWLINE';
                    found_position = false;
                } else {
                    state = 'ERROR';
                }
                break;
            case 'PUNCT':
                if (category == 'W') {
                    state = 'WORD';
                    found_position = true;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = false;
                    col_offset++;
                } else if (category == 'B') {
                    state = 'BLANK';
                    found_position = false;
                    col_offset++;
                } else if (category == 'N') {
                    col_offset = 0;
                    state = 'NEWLINE';
                    found_position = false;
                } else {
                    state = 'ERROR';
                }
                break;
            case 'BLANK':
                if (category == 'W') {
                    state = 'WORD';
                    found_position = true;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = true;
                } else if (category == 'B') {
                    state = 'BLANK';
                    found_position = false;
                    col_offset++;
                } else if (category == 'N') {
                    col_offset = 0;
                    state = 'NEWLINE';
                    found_position = false;
                } else {
                    state = 'ERROR';
                }
                break;
            case 'NEWLINE':
                if (category == 'W') {
                    state = 'WORD';
                    found_position = true;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = true;
                } else if (category == 'B') {
                    state = 'NEWLINE_BLANK';
                    found_position = false;
                    col_offset++;
                } else if (category == 'N') {
                    col_offset = 0;
                    state = 'NEWLINE';
                    found_position = true;
                } else {
                    state = 'ERROR';
                }
                break;
            case 'NEWLINE_BLANK':
                if (category == 'W') {
                    state = 'WORD';
                    found_position = true;
                } else if (category == 'P') {
                    state = 'PUNCT';
                    found_position = true;
                } else if (category == 'B') {
                    state = 'BLANK';
                    found_position = false;
                    col_offset++;
                } else if (category == 'N') {
                    col_offset = 0;
                    state = 'NEWLINE';
                    found_position = true;
                    // Ugly.
                    put_cursor_at_row(current_row - 1);
                    put_cursor_at_col(0, true);
                } else {
                    state = 'ERROR';
                }
                break;
            case 'ERROR':
                // console.debug('Error parsing character <' + ch + '> under cursor.');
                alert('Error parsing character under cursor.');
                found_position = true;
                break;
            default:
                // Nothing.
                break;
        }
    }
    // console.debug("put_cursor_at_next_w_position(): next w position found.");
    put_cursor_at_col(current_col + col_offset, true);
}

function v_cursor_move(offset) {
    var current_index = $(".line").index(current_inputline);
    var new_index = current_index + offset;
    if ((new_index + offset) < 0) {
        new_index = 0;
    } else if ((new_index + offset) > (num_lines - 1)) {
        new_index  = (num_lines - 1);
    }
    // console.debug("Current line index: " + current_index);
    // console.debug("Moving to line index: " + new_index);
    put_cursor_at_row(new_index);
}

function h_cursor_move(offset) {
    // This method moves the cursor left and right.
    // -1 <-- move left           move right --> +1

    // Get the new desired cursor index. Note: this
    // could be ANY value; -4, 2, 30032.
    var cursor_index = current_col + offset;
    // Get the length of the current line.
    var line_length = get_current_line_length();
    // Only move the cursor left or right if it is possible to do so.
    if (cursor_index >= 0 && cursor_index <= (line_length - 1)) {
        put_cursor_at_col(cursor_index, true);
    }
}

function put_cursor_at_row(index) {
    // Put the cursor at the given row index.  This amounts to stripping the
    // current line of <span> tags, and then highlighting the appropriate
    // row using CSS changes.
    //
    // THIS SHOULD BE THE ONLY PLACE WHERE current_row VARIABLE IS
    // MODIFIED.

    // Cleanse the current line of <span> tags, set the 
    // background and foreground colors appropriately.

    // console.debug("Entering put_cursor_at_row(" + index + ")")
    // var line_id = "#inputline" + current_row;
    var contents = remove_span_tags($(current_inputline).html());
    // if (contents == "") { contents = " "; }  // AWH: i don't think this
    // is an issue to comment out.
    $(current_inputline).html(contents);
    $(current_inputline).css("background-color", term_bg);
    $(current_inputline).css("color", term_fg);

    current_row = index;
    // Update row, column counters.
    update_rc_counters();
    // console.debug("Putting cursor at row index " + index);

    current_inputline = $(".line")[index];
    $(current_inputline).css("background-color", highlight_bg);
    $(current_inputline).css("color", highlight_fg);
    contents = $(current_inputline).html();
    if (contents == "") {
        contents = " ";
        current_line_is_blank = true;
    } else {
        current_line_is_blank = false;
    }
    $(current_inputline).html(contents);


    var new_line_length = get_current_line_length();
    if ((new_line_length - 1) < current_col) {
        // If this line ends before current_col, just put cursor at the end
        // of it. Don't update preferred_col.
        put_cursor_at_col(new_line_length - 1, false);
    } else if ((new_line_length - 1) >= preferred_col) {
        // If this line is long enough, put the cursor at the preferred
        // column. Update preferred_col just to be defensive.
        put_cursor_at_col(preferred_col, true);
    } else {
        // Last case: this line is longer than the one we're moving from,
        // but not long enough to put cursor at the preferred column.  Put
        // cursor at the end and don't update preferred column.
        var end_index = contents.length - 1;
        put_cursor_at_col(end_index, false);
    }
}

function put_cursor_at_col(index, is_new_preferred_position) {
    // Put the cursor at a given index.  This amounts to finding
    // the character at index "index" and wrapping it with
    // the appropriate <span> tags.
    //
    // THIS SHOULD BE THE ONLY PLACE WHERE current_col VARIABLE
    // IS MODIFIED.
    var contents = $(current_inputline).html();
    if (contents == "") { contents = " "; }
    contents = remove_span_tags(contents);
    var left_side = contents.substring(0, index);
    var middle = contents.charAt(index);
    var right_side = contents.substring(index + 1, contents.length);
    var new_contents = left_side
                     + '<span id="cursor_char">' + middle + '</span>'
                     + right_side;
    $(current_inputline).html(new_contents);
    current_col = index;
    // Update the content on the web page.
    update_rc_counters();
    if (is_new_preferred_position == true) { preferred_col = index; }
}

function open_blank_line_below() {
    var new_line = '<pre class="num">  1</pre><pre class="line"> </pre>';
    $(new_line).insertAfter($(current_inputline));
    num_lines++;
    // adjust_num_lines(+1);
    var last_visible_row = top_visible_row + num_display_lines - 1;
    if (current_row == last_visible_row) {
        // Assert: we're trying to insert after the very  bottom row on the
        // screen.  Make this newly-opened row visible and make the former
        // top_visible_row hidden.
        hide_line_elements(top_visible_row);
        top_visible_row++;
        put_cursor_at_row(current_row + 1);
        put_cursor_at_col(0, true);
        // $(current_inputline).show();
    } else {
        // Assert: current_row is not the last visible row.  Make the
        // newly-opened row visible, then make what was the last_visible_row
        // hidden (this is now at index last_visible_row + 1).
        hide_line_elements(last_visible_row + 1);
        put_cursor_at_row(current_row + 1);
        put_cursor_at_col(0, true);
        $(current_inputline).show();
    }
    renumber_lines(current_row - 1);
}

function format_lines_G() {
    while (current_row < (num_lines - 1)) {
        format_lines_j(true);
    }
}

function format_lines_rbracket() {
    var contents = "x";
    // Two cases just to make sure.
    while (contents != " " && contents != "") {
        format_lines_j(true);
        contents = get_clean_contents();
    }
}

function format_lines_j(is_first_call) {
    var contents = get_clean_contents();
    if (contents == " " || contents == "") {
        v_cursor_move(+1);
        set_line_visibilities();
        renumber_lines(current_row, current_row);
        return;
    } else if (contents.length <= 80 && current_row == (num_lines - 1)) {
        return;
    } else if (contents.length <= 80 && !is_first_call) {
        // If this is a recursive call and contents is less than 80
        // characters wide, we're done.
        return;
    } else if (contents.length <= 80 && is_first_call) {
        // Take text from next line and append it into this one.
        var next_contents = get_clean_contents_at_index(current_row + 1);
        // Check if the next line has anything on it.  If not, just move the
        // cursor down a row and stop.  If there is, check that there's even
        // enough space on this line to fit the first word on the next line.
        // Make sure to account for the blank space that will be inserted.
        var first_word_length = next_contents.indexOf(" ");
        if (next_contents == " ") {
            v_cursor_move(+1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            return;
        } else if (first_word_length + contents.length > 79) {
            // Assert: we can't fit even the first word on this line.  Move
            // down and stop.
            v_cursor_move(+1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            return;
        } else {
            // Append the next line's contents to this one.
            contents += " ";
            contents += next_contents;
            $(current_inputline).html(contents);
            // Move down on line, delete the line, and move back up.  Using
            // already-built-in functions for this.
            v_cursor_move(+1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            var old_index = current_row;
            delete_current_line();
            var new_index = current_row;
            // If the delete command automatically moved the cursor up a
            // line then we don't need to execute another cursor move up.
            if (old_index == new_index) {
                v_cursor_move(-1);
                set_line_visibilities();
                renumber_lines(current_row, current_row);
            }
            // Make recursive call.  Set "is_first_call" to false.
            format_lines_j(false);
        }
    } else {
        // Assert: this line is longer than 80 chars.  Find a breaking point
        // take the leftover parts and move it to the next line.
        // A break point is a blank space whose index is something less than
        // 80.
        var break_point = contents.lastIndexOf(" ", 79);
        if (break_point == -1) {
            // If there isn't a space anywhere here, just return.
            v_cursor_move(+1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            return;
        }
        // Chop off the rest of the contents after the break point.
        // Put the text from index 0 to break_point into the currenet line.
        var rest_of_contents = contents.substring(break_point + 1);
        $(current_inputline).html(contents.substring(0, break_point));
        // Open up a blank row below. Put the rest of contents in it.
        open_blank_line_below();
        $(current_inputline).html(rest_of_contents);
        put_cursor_at_col(0, true);

        // // Move the cursor down a row, get the contents of this row.
        // put_cursor_at_row(current_row + 1);
        // var next_contents = get_clean_contents();
        // // Prepend the chopped off text to this line.
        // var next_contents = rest_of_contents + " " + next_contents;
        // $(current_inputline).html(next_contents);
        // put_cursor_at_col(0, true);

        // Is this line well-formatted?  Make the recursive call to correct
        // if it isn't.  Set "is_first_call" to false.
        format_lines_j(false);
    }
}

function renumber_lines(start, end) {
    if (typeof end == 'undefined') {
        // Only a start index was provided.
        end = top_visible_row + num_display_lines;
    } else {
        // An end index was provided.  To make the for loop inclusive, add 1
        // to it.
        end = end + 1;
    }
    for (var i = start; i < end; i++) {
        var lineno = $(".num").get(i);
        var n = get_formatted_lineno(i + 1);
        $(lineno).html(n);
        // Also, change the CSS of these lines.
        $(lineno).css("background-color", lineno_bg);
        $(lineno).css("color", lineno_fg);
    }
}

function delete_w_motion() {
    var pexp = /^[\\\!@#\$%\^&\*\+-=<>:;|'"`~,\.\?\/\[\]\(\)\{\}]+$/;
    var wexp = /^\w+$/;
    var bexp = /^\ +$/;
    var nexp = /^\n$/;
    var contents = get_clean_contents();
    var original_col_index = current_col;
    var here_to_end = contents.substring(original_col_index, contents.length);
    if (contents == " " && current_row == (num_lines - 1)) {
        // Assert: we're on a blank row, but it's the last one.  Vim's
        // behavior is to do nothing here.
        return;
    } else if (contents == " ") {
        // Assert: this line is empty.  Delete whole line.
        delete_current_line();
        var new_contents = get_clean_contents();
        put_cursor_at_col(0, true);
        if ((bexp.test(new_contents) == false) && (new_contents.charAt(0) == " ")) {
            put_cursor_at_next_w_position();
        }
    } else if (pexp.test(here_to_end) || wexp.test(here_to_end) || bexp.test(here_to_end)) {
        // From the cursor to the end is all one word block.  Remove it and
        // put cursor at the end of the newly shortened line.
        var new_contents = contents.substring(0, original_col_index);
        if (new_contents == "") {
            new_contents = " ";
        }
        $(current_inputline).html(new_contents);
        put_cursor_at_col(new_contents.length - 1, true);
    } else {
        put_cursor_at_next_w_position();
        var new_col_index = current_col;
        var new_contents = "";
        new_contents += contents.substring(0, original_col_index);
        new_contents += contents.substring(new_col_index);
        $(current_inputline).html(new_contents);
        put_cursor_at_col(original_col_index, true);
    }
}

function delete_D_command() {
    var contents = get_clean_contents();
    if (current_col == 0) {
        $(current_inputline).html(" ");
        put_cursor_at_col(0, true);
    } else {
        var index = current_col - 1;
        contents = contents.substring(0, current_col);
        $(current_inputline).html(contents);
        put_cursor_at_col(index, true);
    }
}

function delete_rbracket_motion() {
    var contents = get_clean_contents();
    var next_contents = $(".line")[current_row + 1];
    next_contents = $(next_contents).html();

    var on_last_row = false; 
    var next_line_is_blank = false;
    var this_line_is_blank = false;
    if (current_row == (num_lines - 1)) { on_last_row = true; }
    if (next_contents == "" || next_contents == " ") { next_line_is_blank = true; }
    if (contents == "" || contents == " ") { this_line_is_blank = true; }

    if (on_last_row) {
        delete_D_command();
    } else if (next_line_is_blank && !this_line_is_blank && current_col != 0) {
        delete_D_command();
    } else {
        // Get the index of the next } motion position.
        var new_row_index = get_next_rbracket_position();
        var original_row_index = current_row;

        // Remove everything to the right of the cursor. Then remove all
        // rows from here down to the index of the next } motion.
        var old_col_index = current_col;
        contents = contents.substring(0, old_col_index);
        if (contents == "") { contents = " "; }
        $(current_inputline).html(contents);
        put_cursor_at_col(contents.length - 1, true);

        for (var i = original_row_index; i < new_row_index; i++) {
            delete_current_line();
        }
        if (current_row == (num_lines - 1)) {
            // If the current row is the very last line in the file, remove
            // its contents.
            $(current_inputline).html(" ");
            put_cursor_at_col(0, true);
        }
    }
}

function delete_lbracket_motion() {
    if (num_lines == 1 && current_col == 0) {
        delete_current_line();
    } else {
        var contents = get_clean_contents();
        contents = contents.substring(current_col, contents.length);
        $(current_inputline).html(contents);
        put_cursor_at_col(0, true);
        var original_index = current_row;
        var index = get_next_lbracket_position();
        put_cursor_at_row(index);
        for (var i = 0; i < (original_index - index); i++) {
            delete_current_line();
        }
    }
}

function delete_gg_motion() {
    if (current_row == (num_lines - 1)) {
        // We're on the very last line.  dgg will remove all lines the file.
        for (var i = current_row; i > 0; i--) {
            // Note: num_lines will decrement every time
            // remove_line_elements() is called, which is why this works.
            remove_line_elements(num_lines - 1);
        }
        // Assert: we've deleted all lines except Row 0.
        put_cursor_at_row(0);
        $(current_inputline).html(" ");
        put_cursor_at_col(0, true);
        change_statusbar("--No lines in buffer--");
    } else {
        // Assert: there are some lines below this one.  Don't have to worry
        // about the edge case removing the last line in the file.
        var total_lines_removed = current_row + 1;
        for (var i = current_row; i >= 0; i--) {
            remove_line_elements(i)
        }
        // The line we wish to put the cursor on is always going to be at
        // index 0 (by definition of what the dgg command does).
        put_cursor_at_row(0);
        change_statusbar(total_lines_removed + " fewer lines");
    }
}

function paste_below() {
    var new_line = '<pre class="num">  1</pre><pre class="line">';
    new_line += paste_reg;
    new_line += '</pre>';
    $(new_line).insertAfter($(current_inputline));
    num_lines++;
    // adjust_num_lines(+1);
    var last_visible_row = top_visible_row + num_display_lines - 1;
    if (current_row == last_visible_row) {
        // Assert: we're trying to paste after the very  bottom row on the
        // screen.  Make this newly-pasted row visible and make the former
        // top_visible_row hidden.
        hide_line_elements(top_visible_row);
        top_visible_row++;
        put_cursor_at_row(current_row + 1);
        put_cursor_at_col(0, true);
        // $(current_inputline).show();
    } else {
        // Assert: current_row is not the last visible row.  Make the
        // newly-pasted row visible, then make what was the last_visible_row
        // hidden (this is now at index last_visible_row + 1).
        hide_line_elements(last_visible_row + 1);
        put_cursor_at_row(current_row + 1);
        put_cursor_at_col(0, true);
        $(current_inputline).show();
    }
    renumber_lines(current_row - 1);
}

function yank_current_line() {
    paste_reg = get_clean_contents();
    $(current_inputline).css("background", "white");
    var old_row = $(current_inputline);
    var index = current_row;
    $(current_inputline).animate({backgroundColor: highlight_bg}, 600, function() {
        if (current_row != index) {
            $(old_row).animate({backgroundColor: term_bg}, 300);
        }
    });
    // console.debug("yank_current_line(): yanked <" + paste_reg + ">.");
}

function delete_G_motion() {
    var original_num_lines = num_lines
    var total_lines_removed = original_num_lines - current_row;
    var deleted_all = false;
    if (current_row == 0) {
        // Assert: current_row == 0.
        $(current_inputline).html(" ");
        current_row++;
        deleted_all = true;
    }
    for (var i = current_row; i < original_num_lines; i++) {
        // delete_current_line() incurs too much overhead trying to set
        // visibilities.  We know what we want to do: remove everything and
        // put the cursor at the row above the current one.  Note that we
        // can keep removing the element at "current_row" because the
        // indices will change as we delete elements.
        remove_line_elements(current_row);
    }
    if (deleted_all == true) {
        change_statusbar("--No lines in buffer--");
    } else {
        change_statusbar(total_lines_removed + " fewer lines");
    }
    put_cursor_at_row(current_row - 1);
}

function remove_line_elements(index) {
    // This method removes a logical "line" on the page.  This amounts to
    // removing BOTH the <pre class="line"> element as well as the
    // corresponding <pre class="num"> element.  It changes the global num_lines
    // variable but does not touch current_row.
    var inputline = $(".line").get(index);
    var lineno = $(".num").get(index);
    $(inputline).remove();
    $(lineno).remove();
    num_lines--;
    // adjust_num_lines(-1);
}

function remove_current_line_elements() {
    var inputline = $(".line").get(current_row);
    var lineno = $(".num").get(current_row);
    $(inputline).remove();
    $(lineno).remove();
    num_lines--;
    // adjust_num_lines(-1);
}

function show_line_elements(index) {
    var inputline = $(".line").get(index);
    var lineno = $(".num").get(index);
    $(inputline).show();
    $(lineno).show();
}

function hide_line_elements(index) {
    var inputline = $(".line").get(index);
    var lineno = $(".num").get(index);
    $(inputline).hide();
    $(lineno).hide();
}


function delete_current_line() {
    // console.debug("delete_current_line(): top_visible_row = " + top_visible_row);
    var has_more_hidden_rows;
    if (top_visible_row + num_display_lines >= num_lines) {
        has_more_hidden_rows = false;
    } else {
        has_more_hidden_rows = true;
    }

    // Put this line in the paste register before deleting.
    var contents = get_clean_contents();
    if (contents != " " && contents != "") {
        paste_reg = contents;
    }

    if (num_lines == 1) {
        // Assert: we're on the top visible row, which is also the only
        // row in a one-line file.  Just remove the contents, but keep
        // cursor here.
        contents = get_clean_contents();
        if (contents == " ") {
            // Assert: the line was already empty.  Nothing to delete.
            change_statusbar("--No lines in buffer--");
        } else {
            // If the row has contents, put them in the paste register.
            $(current_inputline).html(" ");
            put_cursor_at_col(0, true);
        }
    } else if (has_more_hidden_rows == true) {
        // Assert: there are more rows to that can be made visible after
        // this one is deleted.
        remove_current_line_elements();
        put_cursor_at_row(current_row);
        var index = top_visible_row + num_display_lines - 1;
        show_line_elements(index);
        renumber_lines(current_row);
    } else if (has_more_hidden_rows == false && current_row < (num_lines - 1)) {
        // Assert: there aren't any more rows that can be made visible after
        // this one is deleted.  We are not on the last row, however.
        remove_current_line_elements();
        put_cursor_at_row(current_row);
        renumber_lines(current_row);
    } else if (current_row == (num_lines - 1) && current_row > top_visible_row) {
        // Assert: we're on the last row, but it is not the top visible row.
        remove_current_line_elements();
        put_cursor_at_row(current_row - 1);
    } else if (current_row == (num_lines - 1) && current_row == top_visible_row) {
        // Assert: we're on the last row, which is also the top visible row.
        // Delete this row, make the next row up visible.
        remove_current_line_elements();
        show_line_elements(current_row - 1);
        put_cursor_at_row(current_row - 1);
        top_visible_row--;
    }
} 

function remove_char_under_cursor() {
    var contents = get_clean_contents();
    var new_contents = "";
    new_contents += contents.substring(0, current_col);
    new_contents += contents.substring(current_col + 1, contents.length);
    if (new_contents == "") { new_contents = " "; }
    $(current_inputline).html(new_contents);
    if (current_col >= new_contents.length) {
        put_cursor_at_col(new_contents.length - 1, true);
    } else {
        put_cursor_at_col(current_col, true);
    }
}

function get_clean_statusbar_contents() {
    var contents = $("#statusbar").html();
    contents = remove_span_tags(contents);
    if (contents == "") {
        contents = " ";
    }
    return contents;
}

function toggle_cursor_char_case() {
    var contents = get_clean_contents();
    var ch = contents.charAt(current_col);
    if (/[a-z]/.test(ch) == true) {
        ch = ch.toUpperCase();
    } else if (/[A-Z]/.test(ch) == true) {
        ch = ch.toLowerCase();
    } // Else, keep it the same.
    var new_contents = contents.substring(0, current_col);
    new_contents += ch;
    new_contents += contents.substring(current_col + 1);
    $(current_inputline).html(new_contents);
    put_cursor_at_col(current_col, false);
    h_cursor_move(+1);
}

function put_cursor_at_sb_col(index) {
    var contents = get_clean_statusbar_contents();
    if (contents == "") { contents = " "; }
    var left_side = contents.substring(0, index);
    var middle = contents.charAt(index);
    var right_side = contents.substring(index + 1, contents.length);
    var new_contents = left_side
                     + '<span id="cursor_char">' + middle + '</span>'
                     + right_side;
    $("#statusbar").html(new_contents);
    current_sb_col = index;
}

function leave_main_window() {
    $(current_inputline).html(get_clean_contents());
    $(current_inputline).css("background-color", term_bg);
    $(current_inputline).css("color", term_fg);
}

function enter_main_window(row, col) {
    put_cursor_at_row(row);
    put_cursor_at_col(col, true);
    $(current_inputline).css("background-color", highlight_bg);
    $(current_inputline).css("color", highlight_fg);
}

function save_undo_state() {
    source_code_undo.push($("#source_code").html());
    current_row_undo.push(current_row);
    current_col_undo.push(current_col);
    num_lines_undo.push(num_lines);
}

function load_undo_state() {
    if (current_row_undo.length == 0) {
        change_statusbar("Already at oldest change");
    } else {
        $("#source_code").html(source_code_undo.pop());
        put_cursor_at_row(current_row_undo.pop());
        put_cursor_at_col(current_col_undo.pop(), true);
        num_lines = num_lines_undo.pop();
        // * var new_num_lines = num_lines_undo.pop();
        // * var diff = new_num_lines - num_lines;
        // * adjust_num_lines(diff);
    }
}

function newfile_handler(key) {
    switch (key) {
        case 'i':
            $(".line").remove();
            $(".num").remove();
            var newline = '<pre class="num">  1</pre><pre class="line"> </pre>';
            $("#source_code").append($(newline));
            num_lines = 1;
            top_visible_row = 0;
            current_row = 0;
            put_cursor_at_row(0);
            put_cursor_at_col(0, true);
            mode = "INSERT";
            change_statusbar("-- INSERT --");
            // init();
            // mode = "NORMAL";
            // normal_handler('d');
            // normal_handler('G');
            // setTimeout(function() { normal_handler('i') }, 100);
            // normal_handler('i');
            break;
        default:
            // Nothing.
    }
}

function get_clean_contents_at_index(index) {
    var inputline = $(".line").get(index);
    var contents = $(inputline).html();
    contents = remove_span_tags(contents);
    // Just like get_clean_contents, if the contents string is empty, make
    // it a single space.  This is an as-yet unavoidable bug in the Knowvim
    // implementation; lines with single spaces are the equivalent of lines
    // with a single newline character in real Vim.
    if (contents == "") {
        contents = " ";
    }
    return contents;
}

function count_num_occurrences(term) {
    var re = new RegExp(term, "g");
    var count = 0;
    for (var i = 0; i < num_lines; i++) {
        var contents = get_clean_contents_at_index(i);
        while (re.exec(contents) != null) {
            count++;
        }
    }
    return count;
}

function insert_after() {
    mode = "INSERT";
    change_statusbar("-- INSERT --");
    var contents = get_clean_contents();
    if (current_col == 0 && contents == " ") {
        put_cursor_at_col(0, true);
    } else if (current_col == (contents.length - 1)) {
        // Assert: cursor is at the end of the line.  Add an extra
        // space to the contents and put the cursor there.
        contents += " ";
        $(current_inputline).html(contents);
        put_cursor_at_col(current_col + 1, true);
    } else {
        // Assert: cursor is somewhere in the middle of a line.
        put_cursor_at_col(current_col + 1, true);
    }
}

function change_colorscheme(scheme) {

    // Use all temporary variables in case the scheme provided is invalid.
    // I don't know I didn't just do input validation at the beginning, but
    // I'm too lazy to change it right now.  Input validation happens at the
    // end of the switch statement.
    var successfully_changed_colorscheme = true;
    var new_main_bg = "#333";
    var main_border_color = "yellow";
    var main_border_width = "2px";
    var main_border_style = "solid";
    var new_term_bg = "#333";
    var new_term_fg = "white";
    var new_highlight_bg = "yellow";
    var new_highlight_fg = "#333";
    var new_lineno_bg = "#333";
    var new_lineno_fg = "#FF0080";
    var new_vimwindow_bg = "#333";
    var statusbar_fg = "white";
    var new_body_bg = term_bg;
    var new_panel_fg = "white";
    var new_def_fg = "#777";
    var new_com_fg = "black";
    var new_link_color = "green";
    var current_page_link_color = "green";
    var panel_bg = "white";
    var panel_border_color = "black";
    var panel_border_style = "solid";
    var panel_border_width = "1px";
    var new_beta_color = "green";
    var new_hl_span_open = '<span class="visual_line" style="color:white; background-color:green">';
    var new_hl_span_close = '</span>';

    switch(scheme) {
        case 'default':
            colorscheme = 'default';
            change_statusbar(" ");
            new_main_bg = "#DDF";
            new_vimwindow_bg = "#DDF";
            main_border_color = "#ccf";
            main_border_width = "1px";
            main_border_style = "solid";
            new_term_bg = "#DDF";
            new_term_fg = "#555";
            new_highlight_bg = "#d5d5f8";
            new_highlight_fg = "#333";
            new_lineno_bg = "#DDF";
            new_lineno_fg = "green";
            statusbar_fg = "#555";
            new_panel_fg = "#555";
            new_def_fg = "#777";
            new_com_fg = "black";
            new_link_color = "green";
            current_page_link_color = "green";
            panel_bg = "#ddf";
            panel_border_color = "#ccf";
            panel_border_style = "solid";
            panel_border_width = "1px";
            new_hl_span_open = '<span class="visual_line" style="color:white; background-color:green">';
            new_hl_span_close = '</span>';
            new_beta_color = "green";
            new_body_bg = "#DDF";
            break;

        case 'minimal':
            colorscheme = 'minimal';
            new_main_bg = "white";
            new_vimwindow_bg = "white";
            main_border_color = "#AAA";
            main_border_width = "0px";
            main_border_style = "solid";
            new_term_bg = "white";
            new_term_fg = "#555";
            new_highlight_bg = "#F5F5F5";
            new_highlight_fg = "black";
            new_lineno_bg = "white";
            new_lineno_fg = "#888";
            statusbar_fg = "#555";
            new_panel_fg = "#555";
            new_def_fg = "#777";
            new_com_fg = "black";
            new_link_color = "black";
            current_page_link_color = "green";
            panel_bg = "white";
            panel_border_color = "black";
            panel_border_style = "solid";
            panel_border_width = "0px";
            new_hl_span_open = '<span class="visual_line" style="color:white; background-color:black">';
            new_hl_span_close = '</span>';
            new_beta_color = "#C00";
            new_body_bg = "#FFF";
            break;

        case 'winter':
            colorscheme = 'winter';
            new_main_bg = "#F8F8F8";
            new_vimwindow_bg = "#F8F8F8";
            main_border_color = "#6B4B00";
            main_border_width = "2px";
            main_border_style = "solid";
            new_term_bg = "#F8F8F8";
            new_term_fg = "#555";
            new_highlight_bg = "#F0F0F0";
            new_highlight_fg = "#6B4B00";
            new_lineno_bg = "#F8F8F8";
            new_lineno_fg = "#6B4B00";
            statusbar_fg = "#555";
            new_panel_fg = "#555";
            new_def_fg = "#777";
            new_com_fg = "#6B4B00";
            new_link_color = "green";
            current_page_link_color = "green";
            panel_bg = "#F8F8F8";
            panel_border_color = "#6B4B00";
            panel_border_style = "solid";
            panel_border_width = "2px";
            new_hl_span_open = '<span class="visual_line" style="color:white; background-color:#6B4B00">';
            new_hl_span_close = '</span>';
            new_beta_color = "#6B4B00";
            new_body_bg = "#F8F8F8";
            break;

        case 'hicon':
            colorscheme = 'hicon';
            new_main_bg = "#000";
            new_vimwindow_bg = "#000";
            main_border_color = "#2DD69E";
            main_border_width = "2px";
            main_border_style = "solid";
            new_term_bg = "#000";
            new_term_fg = "white";
            new_highlight_bg = "yellow";
            new_highlight_fg = "#000";
            new_lineno_bg = "#000";
            new_lineno_fg = "#FF0080";
            statusbar_fg = "white";
            new_panel_fg = "white";
            new_def_fg = "#2DD69E";
            new_com_fg = "white";
            new_link_color = "#2DD69E";
            current_page_link_color = "yellow";
            panel_bg = "#000";
            panel_border_color = "#2DD69E";
            panel_border_style = "solid";
            panel_border_width = "2px";
            new_hl_span_open = '<span class="visual_line" style="color:#000; background-color:#2DD69E">';
            new_hl_span_close = '</span>';
            new_beta_color = "#2DD69E";
            new_body_bg = "#000";
            break;

        default:
            change_statusbar('<span class="error">E185: Cannot find color scheme ' + scheme + '</span>');
            successfully_changed_colorscheme = false;
    }

    if (successfully_changed_colorscheme == false) {
        return;
    }

    main_bg = new_main_bg;
    vimwindow_bg = new_vimwindow_bg;
    term_bg = new_term_bg;
    term_fg = new_term_fg;
    highlight_bg = new_highlight_bg;
    highlight_fg = new_highlight_fg;
    lineno_bg = new_lineno_bg;
    lineno_fg = new_lineno_fg;
    hl_span_open = new_hl_span_open;
    hl_span_close = new_hl_span_close;
    beta_color = new_beta_color;

    $("#beta").css("color", beta_color);
    $(".current_page").css("color", beta_color);

    $("body").css("background-color", new_body_bg);
    $("#vimwindow").css("background-color", vimwindow_bg);
    $("#write_output").css("color", term_fg);
    $("#write_output").css("background-color", vimwindow_bg);
    $("#main").css("background-color", main_bg);
    $("#main").css("border-color", main_border_color);
    $("#main").css("border-width", main_border_width);
    $("#main").css("border-style", main_border_style);

    $(".panel").css("background-color", panel_bg);
    $(".panel").css("border-color", panel_border_color);
    $(".panel").css("border-style", panel_border_style);
    $(".panel").css("border-width", panel_border_width);

    $("#settings").css("color", new_panel_fg);
    $("#basic_commands_panel").css("color", new_panel_fg);
    $("#advanced_commands_panel").css("color", new_panel_fg);

    $("td.command").css("color", new_com_fg);
    $("td.def").css("color", new_def_fg);
    $("td.notyet").css("color", "#C00");
    $("#bottom_bar").css("color", statusbar_fg);
    $(".panel_link").css("color", new_link_color);
    $(".settings_info").css("color", term_fg);
    /* $("a.current_page").css("color", current_page_link_color); */
    /* $("a.current_page:visited").css("color", current_page_link_color); */
    /* $("a.current_page:hover").css("color", "white"); */
    /* $("a.current_page:active").css("color", "white"); */

    // Set the background-color and color properties of each line,
    $(".line").each(function() {
        $(this).css("background-color", term_bg);
        $(this).css("color", term_fg);
    });

    // Set the background-color and color properties of each lineno.
    $(".num").each(function() {
        $(this).css("background-color", lineno_bg);
        $(this).css("color", lineno_fg);
    });

    // Highlight the current row.
    $(current_inputline).css("background-color", highlight_bg);
    $(current_inputline).css("color", highlight_fg);
    change_statusbar(" ");

    $.ajax({
        type:"POST",
        url:"colorscheme.php",
        data: {"colorscheme" : colorscheme},
        success: function() {
            // Nothing.
        }
    });
}

function execute_search_and_replace() {
    mode = "NORMAL";
    var pattern_found = false;
    var lines_searched = 0;
    var search_row = current_row;
    var search_col = 0;
    // var search_col_offset = current_col + 1;
    var search_col_offset;
    if (next_search_index == 0) {
        // Assert: next_search_index is only ever 0 when we're running a
        // search for the first time on a line.
        search_col_offset = current_col + 1;
    } else {
        search_col_offset = next_search_index;
    }
    var index;
    var contents = get_clean_contents();
    // Vim doesn't include the char covered by the cursor in its search.
    // Add 1 to the index to mimic this.
    contents = contents.substring(search_col_offset);
    while (pattern_found == false) {
        index = contents.indexOf(last_pattern);
        lines_searched++;
        if (index >= 0) {
            // Assert: there is an instance of last_pattern in this line.
            num_search_terms_found++;
            // console.debug("execute_search_and_replace(): num_search_terms_total = " + num_search_terms_total);
            // console.debug("execute_search_and_replace(): num_search_terms_found = " + num_search_terms_found);
            if (num_search_terms_found > num_search_terms_total) {
                // Assert: we have made a full cycle.
                made_full_search_cycle = true;
            }
            pattern_found = true;
            found_occurrence = true;
            search_col = index + search_col_offset;
        } else {
            // Assert: there is no occurrence of last_pattern in this line.
            pattern_found = false;
            next_search_index = 0;
            search_row = (search_row + 1) % num_lines;
            if (search_row == ((current_row + 1) % num_lines) && lines_searched == (num_lines + 1)) {
                // Assert: we have looped all the way back and not found
                // anything.  Need to break.
                break;
            }
            search_col_offset = 0;
            // Get the contents of the next line.  (search_row has been
            // incremented.)
            contents = get_clean_contents_at_index(search_row);
        }
    }

    if (pattern_found == true && made_full_search_cycle == true) {
        // Assert: we found an occurrence of the pattern, but we're back to
        // the same point we started from.  This will happen when running a
        // command like :%s/Andrew/xAndrew/g, because the replacement string
        // contains the original pattern as a substring.
        made_full_search_cycle = false;
        change_statusbar(num_substitutions + " substitutions");
        num_search_terms_found = 0;
        num_substitutions = 0;
        enter_main_window(current_row, current_col);
        set_line_visibilities();
    } else if (pattern_found == true && search_options == 'gc') {
        change_statusbar('replace with ' + new_term + ' (y/n/a/q)?');
        enter_main_window(search_row, search_col);
        set_line_visibilities();
        mode = "SEARCH_AND_REPLACE";
    } else if (pattern_found == true && search_options == 'g') {
        change_statusbar(" "); // TODO: Answer: Why are we doing this?
        var contents = get_clean_contents_at_index(search_row);
        var left_side = contents.substring(0, search_col);
        var right_side = contents.substring(search_col);
        right_side = right_side.replace(last_pattern, new_term);
        var inputline = $(".line").get(search_row);
        $(inputline).html(left_side + right_side);
        // Note: every time this is called, it loops through EVERY line in
        // the file, which means after the last replacement, we'll do one
        // more full loop only to find that everything has been replaced.
        // Could probably use another state variable to avoid this, but I
        // don't think the cost will be horrible.
        next_search_index = search_col + new_term.length;
        num_substitutions++;
        execute_search_and_replace();
    } else if (found_occurrence) {
        // Assert: there was at least one occurrence of last_pattern found
        // in the document at some point, but sadly, now we are done.
        found_occurrence = false;
        change_statusbar(num_substitutions + " substitutions");
        num_substitutions = 0;
        num_search_terms_found = 0;
        enter_main_window(current_row, current_col);
        set_line_visibilities();
    } else {
        // Assert: there was never any occurrence of last_pattern found in
        // the document.
        change_statusbar('<span class="error">E486: Pattern not found: ' + last_pattern + '</span>');
        num_search_terms_found = 0;
        num_substitutions = 0;
        enter_main_window(current_row, current_col);
        set_line_visibilities();
    }
}

function searchreplace_handler(key) {
    switch(key) {
        case 'y':
            var contents = get_clean_contents();
            var left_side = contents.substring(0, current_col);
            var right_side = contents.substring(current_col);
            right_side = right_side.replace(last_pattern, new_term);
            $(current_inputline).html(left_side + right_side);
            put_cursor_at_col(current_col, true);
            next_search_index = current_col + new_term.length;
            num_substitutions++;
            execute_search_and_replace();
            break;
        case 'n':
            execute_search_and_replace();
            break;
        case 'a':
            search_options = 'g';
            var contents = get_clean_contents();
            var left_side = contents.substring(0, current_col);
            var right_side = contents.substring(current_col);
            right_side = right_side.replace(last_pattern, new_term);
            $(current_inputline).html(left_side + right_side);
            put_cursor_at_col(current_col, true);
            num_substitutions++;
            execute_search_and_replace();
            break;
        case 'q':
            change_statusbar(num_substitutions + " substitutions");
            num_substitutions = 0;
            num_search_terms_found = 0;
            mode = "NORMAL";
            break;
        default:
            // Nothing.
    }
}

function execute_search(pattern) {
    mode = "NORMAL";
    last_pattern = pattern;
    var pattern_found = false;
    var lines_searched = 0;
    var search_row = current_row;
    var search_col = 0;
    var search_col_offset = current_col + 1;
    var index;
    var contents = get_clean_contents();
    // Vim doesn't include the char covered by the cursor in its search.
    // Add 1 to the index to mimic this.
    contents = contents.substring(current_col + 1);
    while (pattern_found == false) {
        index = contents.indexOf(pattern);
        lines_searched++;
        if (index >= 0) {
            pattern_found = true;
            search_col = index + search_col_offset;
        } else {
            // alert("Not found in <" + contents + ">");
            pattern_found = false;
            search_row = (search_row + 1) % num_lines;
            if (search_row == ((current_row + 1) % num_lines) && lines_searched == (num_lines + 1)) {
                // Assert: we have looped all the way back and not found
                // anything.  Need to break.
                break;
            }
            search_col_offset = 0;
            contents = get_clean_contents_at_index(search_row);
        }
    }

    if (pattern_found == true) {
        change_statusbar("/" + pattern);
        enter_main_window(search_row, search_col);
        set_line_visibilities();
    } else {
        change_statusbar('<span class="error">E486: Pattern not found: ' + last_pattern + '</span>');
        enter_main_window(current_row, current_col);
        set_line_visibilities();
    }
}

function refresh_write_output() {
    var buffer = "";
    if (write_output == true) {
        for (var i = 0; i < num_lines; i++) {
            var inputline = $(".line").get(i);
            var contents = $(inputline).html();
            contents = remove_span_tags(contents);
            buffer += contents + "\n";
        }
        $("#write_output > pre").html(buffer);
        // Slide down the write output panel.
        $("#write_output").slideDown('fast', function() { });
    }
}


function execute_command(command, args) {

    $.ajax({
        type:"POST",
        data:{"msg" : "Executed :" + command + " " + args},
        url:"log.php",
    });
    
    switch(command) {
        case 'w':
            refresh_write_output(); // Keep this or not?
            var start_color = null;
            switch(colorscheme) {
                case 'minimal':
                    start_color = "#AAA";
                    break;
                default:
                    start_color = "white";
            }
            // -- $("#vimwindow").css("background-color", start_color);
            // -- $("#vimwindow").animate({backgroundColor: vimwindow_bg}, 1000);
            // -- $("#main").css("background-color", start_color);
            // -- $("#main").animate({backgroundColor: main_bg}, 1000);
            // -- $(".num").css("background-color", start_color);
            // -- $(".num").animate({backgroundColor: lineno_bg}, 1000);
            // -- $(".line").css("background-color", start_color);
            // -- $(".line").animate({backgroundColor: term_bg}, 1000, function() {
            // --     $(current_inputline).css("background-color", highlight_bg);
            // --     $(current_inputline).css("color", highlight_fg)
            // -- });
            // Something to consider: fading background instead of main
            // stuff.
            $("body").css("background-color", "yellow");
            $("body").animate({backgroundColor: term_bg}, 1000);
            mode = "NORMAL";
            change_statusbar(" ");
            enter_main_window(current_row, current_col);
            modified_since_last_write = false;
            break;
        case 'q':
            if (modified_since_last_write == true) {
                change_statusbar('<span class="error">E37: No write since last change (add ! to override)</span>');
                mode = "NORMAL";
                enter_main_window(current_row, current_col);
            } else {
                // Assert: the "file" has been "saved" since the last write
                // command.  Copy the 'wq' behavior.
                execute_command('wq');
            }
            break;
        case 'q!':
            modified_since_last_write = false; // This probably doesn't matter.
            load_new_file_screen("new.html");
            mode = "NEWFILE"
            change_statusbar(" ");
            break;
        case 'wq':
            refresh_write_output(); // Keep this or not?
            // This calls up a fancy flashing effect and puts the new file
            // text in the vimwindow.
            modified_since_last_write = false; // This probably doesn't matter.
            load_new_file_screen("new.html");
            mode = "NEWFILE";
            change_statusbar(" ");
            break;
        case 'o':
            // This attempts to load some file into the vimwindow.
            var filename_re = /\w+\.\w+/;
            var result = filename_re.exec(args)
            if (result != null) {
                // Valid filename.  Try to load it.
                load_new_file_screen(result[0]);
                mode = "NORMAL";
                change_statusbar(" ");
            } else {
                load_new_file_screen("new.html");
                mode = "NEWFILE"
                change_statusbar(" ");
            }
            break;
        case 'set':
            set_disp_exp = /^displaylines=[1-9][0-9]*$/;
            // This matches stuff like 'displaylines=30'
            if (set_disp_exp.test(args)) {
                var n = args.match(/[1-9][0-9]*/);
                num_display_lines = parseInt(n);
                maintain_line_visibilities();
                renumber_lines(0, num_lines - 1);
                change_statusbar(" ");
            } else {
                // Nothing. :set displaylines=30 is only supported command.
                change_statusbar('<span class="error">E518: Unknown option: ' + args + '</span>');
            }
            mode = "NORMAL";
            enter_main_window(current_row, current_col);
            break;
        case 'colorscheme':
            // change_colorscheme() is responsible for changing statusbar
            // contents depending on whether or not the user provided a
            // valid colorscheme option.
            if (args == "") {
                // Vim behavior.  If no argument given, just echo the
                // current scheme.
                change_statusbar("default");
            } else {
                // Else, try to change to the option provided.
                change_colorscheme(args);
            }
            mode = "NORMAL";
            enter_main_window(current_row, current_col);
            break;
        case 'writeoutput':
            if (args == "on") {
                write_output = true;
                change_statusbar(" ");
            } else if (args == "off") {
                write_output = false;
                change_statusbar(" ");
            } else if (args == "") {
                var s = "";
                if (write_output) {
                    s = "on";
                } else  {
                    s = "off";
                }
                change_statusbar("writeoutput = " + s);
            } else {
                // Argument provided was invalid.
                change_statusbar('<span class="error">E475: Invalid argument: ' + args + '</span>');
                
            }
            mode = "NORMAL";
            enter_main_window(current_row, current_col);
            break;
        default:
            // This matches stuff like '%s/old_string/new_string/g'
            search_exp = /^%s\/\w+\/\w*\/gc?$/;
            // search_exp = /^%s\/[\u0000-\u007F]+\/[\u0000-\u007F]*\/gc?$/;

            // This matches numbers.
            lineno_exp = /^[0-9]+$/;
            if (search_exp.test(command)) {
                // Assert: this is a search-and-replace (global) command.
                var command_elements = command.split('/');
                last_pattern = command_elements[1];
                new_term = command_elements[2];
                search_options = command_elements[3]; // Either 'g' or 'gc' allowed.
                start_search_row = current_row;
                start_search_col = current_col;
                num_search_terms_total = count_num_occurrences(last_pattern);
                execute_search_and_replace();
            } else if (lineno_exp.test(command)) {
                mode = "NORMAL";
                change_statusbar(" ");
                enter_main_window(current_row, current_col);
                // Assert: this is a "goto <LINENO>" command.
                var n = parseInt(command); // this will always succeed.
                // If they enter a number bigger than total number of lines,
                // this is equivalent to entering the last line number.
                n = Math.min(num_lines, n);
                // Put the cursor at the given line index (one less than
                // line number).
                put_cursor_at_row(n - 1);
                // Vim puts the cursor at the beginning of the first word.
                // Here's the logic that does that.
                var contents = get_clean_contents();
                var ch = contents.indexOf(0);
                if (ch == " ") {
                    // Assert: 'w' movement puts us as beginning of next
                    // word.
                    put_cursor_at_next_w_position();
                } else {
                    // Assert: there is a word starting a column zero.  Put
                    // cursor there.
                    put_cursor_at_col(0, true);
                }
                set_line_visibilities();
            } else {
                // Assert: this just gibberish.  Return to normal.
                mode = "NORMAL";
                change_statusbar('<span class="error">E492: Not a supported editor command: ' + command + '</span>');
                enter_main_window(current_row, current_col);
            }
    }
}

function execute_handler(key) {
    switch(key) {
        case '<ESC>':
            mode = "NORMAL";
            change_statusbar(" ");
            enter_main_window(current_row, current_col);
            break;
        case '<BACKSPACE>':
            var index = current_sb_col;
            var contents = get_clean_statusbar_contents();
            var new_contents = contents.substring(0, index - 1);
            new_contents += contents.substring(index, contents.length);
            $("#statusbar").html(new_contents);
            if (current_sb_col == 1) {
                // If the user backspaces over all the contents, just go
                // back to the main window.
                // The old behavior: put_cursor_at_sb_col(0);
                mode = "NORMAL";
                change_statusbar(" ");
                enter_main_window(current_row, current_col);
            } else {
                put_cursor_at_sb_col(current_sb_col - 1);
            }
            break;
        case '<ENTER>':
            var str = get_clean_statusbar_contents();
            var ch = str.charAt(0);
            if (ch == ':') {
                // Remove the ':' character.
                str = str.substring(1);
                var list = str.split(" ");
                var command = list[0];
                var args = list[1];
                execute_command(command, args);
            } else if (ch == '/') {
                var pattern = str.substring(1, str.indexOf(" "));
                execute_search(pattern);
            }
            break;
        case '<TAB>':
            // Do nothing for now.
            break;
        default:
            var index = current_sb_col;
            var contents = get_clean_statusbar_contents();
            var new_contents = contents.substring(0, index);
            new_contents += key;
            new_contents += contents.substring(index, contents.length);
            $("#statusbar").html(new_contents);
            put_cursor_at_sb_col(current_sb_col + 1);
    }
}

function goto_mark_handler(key) {
    var index = marked_positions[key];
    if (index >= 0) {
        put_cursor_at_row(index);
        // Vim puts the cursor at the beginning of the first word.
        // Here's the logic that does that.
        var contents = get_clean_contents();
        var ch = contents.indexOf(0);
        if (ch == " ") {
            // Assert: 'w' movement puts us as beginning of next
            // word.
            put_cursor_at_next_w_position();
        } else {
            // Assert: there is a word starting a column zero.  Put
            // cursor there.
            put_cursor_at_col(0, true);
        }
        set_line_visibilities();
    } else {
        change_statusbar('<span class="error">E20: Mark not set</span>');
    }
    mode = "NORMAL";
}

function set_mark_handler(key) {
    switch (key) {
        case '<ESC>':
        case '<BACKSPACE>':
        case '<ENTER>':
        case '<DEL>':
        case '<UARROW>':
        case '<DARROW>':
        case '<LARROW>':
        case '<RARROW>':
            mode = "NORMAL";
            break;
        default:
            marked_positions[key] = current_row;
            mode = "NORMAL";
    }
}


function find_single_handler(key) {
    switch (key) {
        case '<ESC>':
            mode = "NORMAL";
            break;
        case '<BACKSPACE>':
        case '<ENTER>':
        case '<DEL>':
        case '<UARROW>':
        case '<DARROW>':
        case '<LARROW>':
        case '<RARROW>':
            break;
        default:
            // var chars = 'abcdefghijklmnopqrstuvwxyz';
            // chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            // chars += '1234567890-=!@#$%^&*()_+[]\\;\',./{}|:"?`~';
            // if (chars.indexOf(key) >= 0) {
            //     // Assert: user pressed a valid key.
            // }
            var contents = get_clean_contents();
            var offset = current_col + 1;
            contents = contents.substring(current_col + 1);
            var index = contents.indexOf(key);
            if (index >= 0) {
                // Assert: there is an occurrence of this character on the
                // line.
                put_cursor_at_col(index + offset, true);
            }
            mode = "NORMAL";
    }
}

function replace_single_handler(key) {
    switch (key) {
        case '<ESC>':
            mode = "NORMAL";
            break;
        case '<BACKSPACE>':
        case '<ENTER>':
        case '<DEL>':
        case '<UARROW>':
        case '<DARROW>':
        case '<LARROW>':
        case '<RARROW>':
            break;
        default:
            // var chars = 'abcdefghijklmnopqrstuvwxyz';
            // chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            // chars += '1234567890-=!@#$%^&*()_+[]\\;\',./{}|:"?`~';
            // if (chars.indexOf(key) >= 0) {
            //     // Assert: user pressed a valid key.
            // }
            var contents = get_clean_contents();
            var new_contents = contents.substring(0, current_col);
            new_contents += key;
            new_contents += contents.substring(current_col + 1);
            $(current_inputline).html(new_contents);
            put_cursor_at_col(current_col, false);
            mode = "NORMAL";
            modified_since_last_write = true;
    }
}

function replace_handler(key) {
    switch (key) {
        case '<ESC>':
            mode = "NORMAL";
            change_statusbar(" ");
            // Vim moves the cursor one space to the left when exiting
            // Insert mode.
            var contents = get_clean_contents();
            if (current_col > 0 && contents.substring(current_col) == " ") {
                contents = contents.substring(0, current_col);
                $(current_inputline).html(contents);
                put_cursor_at_col(current_col - 1, true);
            } else if (current_col > 0) {
                put_cursor_at_col(current_col - 1, true);
            } else {
                put_cursor_at_col(0, true);
            }
            break;
        case '<UARROW>':
            v_cursor_move(-1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            break;
        case '<DARROW>':
            v_cursor_move(+1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            break;
        case '<LARROW>':
            h_cursor_move(-1);
            break;
        case '<RARROW>':
            h_cursor_move(+1);
            break;
        case '<DEL>':
            modified_since_last_write = true;
            var index = current_col;
            var contents = get_clean_contents();
            var rest_of_line = contents.substring(current_col)
            if (rest_of_line == " " && current_row == (num_lines - 1)) {
                // Assert: we're on the end of the last line. Do nothing.
            } else if (rest_of_line == " ") {
                // Assert: there is nothing left on this line. Start
                // deleting from the next line's contents.  Remember that
                // the space we're seeing is an artificial one though, put
                // there to allow the cursor to remain in the correct space.
                // Delete this space first.
                contents = contents.substring(0, contents.length - 1);
                var next_line = $(current_inputline).next().next().html();
                var new_contents = contents + next_line;
                $(current_inputline).html(new_contents);
                var old_index = current_row;
                v_cursor_move(+1);
                set_line_visibilities();
                renumber_lines(current_row, current_row);
                delete_current_line();
                var new_index = current_row;
                if (old_index != new_index) {
                    v_cursor_move(-1);
                    set_line_visibilities();
                    renumber_lines(current_row, current_row);
                }
                put_cursor_at_col(contents.length, true);
            } else {
                // Assert: the "easy" case.  There's stuff left on this line
                // to delete.
                var left_side = contents.substring(0, current_col);
                var right_side = contents.substring(current_col + 1, contents.length);
                if (right_side == "") {
                    // As per Vim behavior, if there is nothing on the right
                    // side of the cursor, keep it at the current column
                    // position anyway.  We'll use a space to maintain this.
                    right_side = " ";
                }
                $(current_inputline).html(left_side + right_side);
                put_cursor_at_col(left_side.length, true);
            }
            break;
        case '<BACKSPACE>':
            if (current_row == 0 && current_col == 0) {
                // Do nothing.
            } else if (current_col > 0) {
                var contents = get_clean_contents();
                $(current_inputline).html(contents);
                put_cursor_at_col(current_col - 1);
            } else if (current_col == 0) {
                put_cursor_at_row(current_row - 1);
                var contents = get_clean_contents();
                var index = contents.length - 1;
                put_cursor_at_col(index, true);
            } else {
                // Sanity check. We'll never get here.
                alert("Error handling BACKSPACE in REPLACE mode.");
            }
            break;
        case '<ENTER>':
            modified_since_last_write = true;
            var contents = get_clean_contents();
            var rest_of_line = contents.substring(current_col);
            $(current_inputline).html(contents.substring(0, current_col));
            // This automatically puts the cursor on the new blank line.
            open_blank_line_below();
            $(current_inputline).html(rest_of_line);
            put_cursor_at_col(0, true);
            break;
        default:
            modified_since_last_write = true;
            var index = current_col;
            var contents = get_clean_contents();
            var new_contents = null;
            if (index == contents.length - 1) {
                // Assert: we're typing at the end of the line.
                new_contents = contents.substring(0, index) + key + " ";
            } else {
                // Assert: we're typing in the middle of the line.
                new_contents = contents.substring(0, index);
                new_contents += key;
                new_contents += contents.substring(index + 1, contents.length);
            }
            // alert("new_contents = <" + new_contents + ">");
            // alert("new_contents = <" + new_contents + ">, current_col = " + current_col + ", length = " + new_contents.length);
            if (new_contents.length >= 81 && current_col == (new_contents.length - 2)) {
                // Assert: we were typing at the very end of the line.  this
                // is the easy case.
                // console.debug("insert_handler(): new_contents.length = " + new_contents.length);
                // console.debug("insert_handler(): current_col= " + current_col);
                // Chop off the space that is always present because of the
                // cursor.
                new_contents = new_contents.substring(0, new_contents.length - 1);
                // Find a blank space to break this line at.  TODO: handle
                // case where this is impossible.  (Almost never.)
                var break_point = new_contents.lastIndexOf(" ");
                // Put the truncated line contents back.
                var shortened = new_contents.substring(0, break_point);
                $(current_inputline).html(shortened);
                // Insert a new blank line and put the rest of the line
                // here.  Add a space for the cursor and put cursor at the
                // end of the line.
                open_blank_line_below();
                var rest_of_contents = new_contents.substring(break_point + 1);
                rest_of_contents += " ";
                $(current_inputline).html(rest_of_contents);
                put_cursor_at_col(rest_of_contents.length - 1);
            } else {
                $(current_inputline).html(new_contents);
                put_cursor_at_col(index+1, true);
            }
    }
}

function insert_handler(key) {
    switch (key) {
        case '<ESC>':
            mode = "NORMAL";
            change_statusbar(" ");
            // Vim moves the cursor one space to the left when exiting
            // Insert mode.
            var contents = get_clean_contents();
            if (current_col > 0 && contents.substring(current_col) == " ") {
                contents = contents.substring(0, current_col);
                $(current_inputline).html(contents);
                put_cursor_at_col(current_col - 1, true);
            } else if (current_col > 0) {
                put_cursor_at_col(current_col - 1, true);
            } else {
                put_cursor_at_col(0, true);
            }
            break;
        case '<UARROW>':
            v_cursor_move(-1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            break;
        case '<DARROW>':
            v_cursor_move(+1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            break;
        case '<LARROW>':
            h_cursor_move(-1);
            break;
        case '<RARROW>':
            h_cursor_move(+1);
            break;
        case '<DEL>':
            modified_since_last_write = true;
            var index = current_col;
            var contents = get_clean_contents();
            var rest_of_line = contents.substring(current_col)
            if (rest_of_line == " " && current_row == (num_lines - 1)) {
                // Assert: we're on the end of the last line. Do nothing.
            } else if (rest_of_line == " ") {
                // Assert: there is nothing left on this line. Start
                // deleting from the next line's contents.  Remember that
                // the space we're seeing is an artificial one though, put
                // there to allow the cursor to remain in the correct space.
                // Delete this space first.
                contents = contents.substring(0, contents.length - 1);
                var next_line = $(current_inputline).next().next().html();
                var new_contents = contents + next_line;
                $(current_inputline).html(new_contents);
                var old_index = current_row;
                v_cursor_move(+1);
                set_line_visibilities();
                renumber_lines(current_row, current_row);
                delete_current_line();
                var new_index = current_row;
                if (old_index != new_index) {
                    v_cursor_move(-1);
                    set_line_visibilities();
                    renumber_lines(current_row, current_row);
                }
                put_cursor_at_col(contents.length, true);
            } else {
                // Assert: the "easy" case.  There's stuff left on this line
                // to delete.
                var left_side = contents.substring(0, current_col);
                var right_side = contents.substring(current_col + 1, contents.length);
                if (right_side == "") {
                    // As per Vim behavior, if there is nothing on the right
                    // side of the cursor, keep it at the current column
                    // position anyway.  We'll use a space to maintain this.
                    right_side = " ";
                }
                $(current_inputline).html(left_side + right_side);
                put_cursor_at_col(left_side.length, true);
            }
            break;
        case '<BACKSPACE>':
            modified_since_last_write = true;
            var index = current_col;
            var contents = get_clean_contents();
            if (current_col == 0 && current_row == 0) {
                // Assert: at top of file; can't go anywhere!
            } else if (current_col == 0 && current_row != 0) {
                // Assert: we can backspace up into another line.
                // Move to line above.
                v_cursor_move(-1);
                set_line_visibilities();
                renumber_lines(current_row, current_row);
                // Get the contents of this line.
                var previous_contents = get_clean_contents();
                // Tack on the contents of the line we're backspacing from
                // onto this line.
                $(current_inputline).html(previous_contents + contents);
                var old_index = current_row;
                // Move back down to delete the line we're backspacing from.
                v_cursor_move(+1);
                set_line_visibilities();
                renumber_lines(current_row, current_row);
                delete_current_line();
                var new_index = current_row;
                // If the indices have changed (i.e., if we just deleted the
                // very last row) then we don't need to move back up.
                if (old_index != new_index) {
                    v_cursor_move(-1);
                    set_line_visibilities();
                    renumber_lines(current_row, current_row);
                }
                put_cursor_at_col(previous_contents.length, true);
            } else {
                // Assert: current_col must be zero since we've covered all
                // the cases for current_row.
                var new_contents = contents.substring(0, index - 1);
                new_contents += contents.substring(index, contents.length);
                $(current_inputline).html(new_contents);
                put_cursor_at_col(current_col - 1, true);
            }
            break;
        case '<ENTER>':
            modified_since_last_write = true;
            var contents = get_clean_contents();
            var rest_of_line = contents.substring(current_col);
            $(current_inputline).html(contents.substring(0, current_col));
            // This automatically puts the cursor on the new blank line.
            open_blank_line_below();
            $(current_inputline).html(rest_of_line);
            put_cursor_at_col(0, true);
            break;
        case '<TAB>':
            insert_handler(' ');
            insert_handler(' ');
            insert_handler(' ');
            insert_handler(' ');
            break;
        default:
            modified_since_last_write = true;
            var index = current_col;
            var contents = get_clean_contents();
            var new_contents = contents.substring(0, index);
            new_contents += key;
            new_contents += contents.substring(index, contents.length);
            // alert("new_contents = <" + new_contents + ">");
            // alert("new_contents = <" + new_contents + ">, current_col = " + current_col + ", length = " + new_contents.length);
            if (new_contents.length >= 81 && current_col == (new_contents.length - 2)) {
                // Assert: we were typing at the very end of the line.  this
                // is the easy case.
                // console.debug("insert_handler(): new_contents.length = " + new_contents.length);
                // console.debug("insert_handler(): current_col= " + current_col);
                // Chop off the space that is always present because of the
                // cursor.
                new_contents = new_contents.substring(0, new_contents.length - 1);
                // Find a blank space to break this line at.  TODO: handle
                // case where this is impossible.  (Almost never.)
                var break_point = new_contents.lastIndexOf(" ");
                // Put the truncated line contents back.
                var shortened = new_contents.substring(0, break_point);
                $(current_inputline).html(shortened);
                // Insert a new blank line and put the rest of the line
                // here.  Add a space for the cursor and put cursor at the
                // end of the line.
                open_blank_line_below();
                var rest_of_contents = new_contents.substring(break_point + 1);
                rest_of_contents += " ";
                $(current_inputline).html(rest_of_contents);
                put_cursor_at_col(rest_of_contents.length - 1);
            } else {
                $(current_inputline).html(new_contents);
                put_cursor_at_col(index+1, true);
            }
    }
}

function add_visual_hl_current_row() {
    var inputline = $(".line").get(current_row);
    var contents = $(inputline).html();
    // We don't mind if these contents have the <span> cursor tags already.
    var hl_contents = hl_span_open + contents + hl_span_close;
    $(inputline).html(hl_contents);
}

function remove_visual_hl_current_row() {
    var inputline = $(".line").get(current_row);
    var contents = $(inputline).html();
    // We don't mind if these contents have the <span> cursor tags already.
    var span_open = '<span class="visual_line" style="color:white; background-color:green">';
    var span_close = '</span>';
    contents = contents.substring(span_open.length, contents.length - span_close.length);
    $(inputline).html(contents);
}

function remove_visual_span_tags(contents) {
    // This method makes no conditions on input.
    var i = contents.indexOf('<span class="visual_line"');
    if (i >= 0) {
        // Assert: contents variable has visual line span tags.
        var start = hl_span_open.length;
        var end = contents.length - hl_span_close.length;
        // <span class="...">andrew hallagan</span>
        //           111111111122222222223333333333
        // 0123456789012345678901234567890123456789
        //
        // start = 18, end = 40 - 7 = 33
        contents = contents.substring(hl_span_open.length, contents.length - hl_span_close.length);
    } else {
        // Assert: contents variable had no visual line span tags.
    }
    return contents;
}

function visual_v_cursor_move(offset) {
    if (offset > 0 && current_row == (num_lines - 1)) {
        // Assert: trying to move down from last line in file.  Ignore.
    } else if (offset < 0 && current_row == 0) {
        // Assert: trying to move up from first line in file.  Ignore.
    } else if (offset > 0 && (current_row - visual_line_start_row) >= 0) {
        // Assert: want to move downwards AND we're on some line at or below
        // the line we entered VISUAL LINE mode from.
        v_cursor_move(+1);
        var inputline = $(".line").get(current_row);
        var contents = $(inputline).html(); // This will contain cursor span tags.
        var hl_contents = hl_span_open + contents + hl_span_close;
        $(inputline).html(hl_contents);
    } else if (offset > 0 && (current_row - visual_line_start_row  < 0)) {
        // Assert: want to move downwards AND we're on a line above the line
        // we entered VISUAL LINE mode from.
        var inputline = $(".line").get(current_row);
        var contents = $(inputline).html();
        contents = remove_visual_span_tags(contents);
        $(inputline).html(contents);
        // Get the next input line.  This will be inefficient, but remove
        // the visual span tags, move cursor down, then add them back on.
        var nextline = $(current_inputline).next().next();
        var nextline_contents = $(nextline).html();
        nextline_contents = remove_visual_span_tags(nextline_contents);
        $(nextline).html(nextline_contents);
        v_cursor_move(+1);
        // Put the tags back on.
        var new_contents = $(current_inputline).html(); // This will contain cursor span tags.
        new_contents = hl_span_open + new_contents + hl_span_close;
        $(current_inputline).html(new_contents);
    } else if (offset < 0 && (current_row - visual_line_start_row) > 0) {
        // Assert: want to move upwards AND we're on some line below the
        // line we entered VISUAL LINE mode from.
        var inputline = $(".line").get(current_row);
        var contents = $(inputline).html();
        contents = remove_visual_span_tags(contents);
        $(inputline).html(contents);

        var prevline = $(current_inputline).prev().prev();
        var prevline_contents = $(prevline).html();
        prevline_contents = remove_visual_span_tags(prevline_contents);
        $(prevline).html(prevline_contents);
        v_cursor_move(-1);
        // Put the tags back on.
        var new_contents = $(current_inputline).html(); // This will contain cursor span tags.
        new_contents = hl_span_open + new_contents + hl_span_close;
        $(current_inputline).html(new_contents);
    } else if (offset < 0 && (current_row - visual_line_start_row) <= 0) {
        // Assert: want to move upwards AND we're on some line above the
        // line we entered VISUAL LINE mode from.
        v_cursor_move(-1)
        var inputline = $(".line").get(current_row);
        var contents = $(inputline).html(); // This will contain cursor span tags.
        var hl_contents = hl_span_open + contents + hl_span_close;
        $(inputline).html(hl_contents);
    } else {
        // Assert: offset was zero.
    }
}

function remove_visual_span_tags_in_range(start, end) {
    for (var i = start; i <= end; i++) {
        var inputline = $(".line").get(i);
        var contents = $(inputline).html();
        contents = remove_visual_span_tags(contents);
        $(inputline).html(contents);
    }
}

function remove_line_highlighting() {
    var start = Math.min(current_row, visual_line_start_row);
    var end = Math.max(current_row, visual_line_start_row);
    remove_visual_span_tags_in_range(start, end);
}

function yank_selected_lines() {
    var start = Math.min(current_row, visual_line_start_row);
    var end = Math.max(current_row, visual_line_start_row);
    remove_visual_span_tags_in_range(start, end);
    visual_yank_buffer = [];
    for (var i = start; i <= end; i++) {
        var contents = get_clean_contents_at_index(i);
        visual_yank_buffer.push(contents);
    }
    return (end - start + 1);
}

function visual_paste_below() {
    for (var i = 0; i < visual_yank_buffer.length; i++) {
        var new_line = '<pre class="num">  1</pre><pre class="line">';
        new_line += visual_yank_buffer[i];
        new_line += '</pre>';
        $(new_line).insertAfter($(current_inputline));
        num_lines++;
        // adjust_num_lines(+1);
        var last_visible_row = top_visible_row + num_display_lines - 1;
        if (current_row == last_visible_row) {
            // Assert: we're trying to paste after the very  bottom row on the
            // screen.  Make this newly-pasted row visible and make the former
            // top_visible_row hidden.
            hide_line_elements(top_visible_row);
            top_visible_row++;
            put_cursor_at_row(current_row + 1);
            put_cursor_at_col(0, true);
            // $(current_inputline).show();
        } else {
            // Assert: current_row is not the last visible row.  Make the
            // newly-pasted row visible, then make what was the last_visible_row
            // hidden (this is now at index last_visible_row + 1).
            hide_line_elements(last_visible_row + 1);
            put_cursor_at_row(current_row + 1);
            put_cursor_at_col(0, true);
            $(current_inputline).show();
        }
    }
    renumber_lines(current_row - visual_yank_buffer.length);
}


function remove_selected_lines() {
    // Returns the number of deleted lines.

    var start = Math.min(current_row, visual_line_start_row);
    var end = Math.max(current_row, visual_line_start_row);
    // Inefficient, I know.  For now it makes things easier.
    remove_visual_span_tags_in_range(start, end);
    if (end == current_row) {
        // Assert: cursor is at BOTTOM of range.
        put_cursor_at_row(start, true);
    }
    for(var i = 0; i < end - start + 1; i++) {
        delete_current_line();
    }
    return (end - start + 1);
}


function visual_line_handler(key) {
    switch(key) {
        case '<ESC>':
            remove_line_highlighting();
            mode = "NORMAL";
            change_statusbar(" ");
            break;
        case 'j':
            visual_v_cursor_move(+1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            break;
        case 'k':
            visual_v_cursor_move(-1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            break;
        case 'd':
            var n = remove_selected_lines();
            modified_since_last_write = true;
            mode = "NORMAL";
            if (n >= 3) {
                change_statusbar(n + " fewer lines");
            } else {
                // Why doesn't Vim output something when deleting 2 or 1
                // lines?  I don't know.
                change_statusbar(" ");
            }
            break;
        case 'y':
            paste_reg = null;
            var n = yank_selected_lines();
            mode = "NORMAL";
            if (n >= 3) {
                change_statusbar(n + " lines yanked");
            } else {
                change_statusbar(" ");
            }
            break;
        default:
            // Nothing.
            
    }
}

function normal_handler(key) {
    // alert("num_lines = " + num_lines);
    switch (key) {
        case '<UARROW>':
            v_cursor_move(-1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            break;
        case '<DARROW>':
            v_cursor_move(+1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            break;
        case '<LARROW>':
            h_cursor_move(-1);
            break;
        case '<RARROW>':
            h_cursor_move(+1);
            break;
        case '<ESC>':
            previous_key = "";
            break;
        case 'V':
            // TODO: implement visual line?
            mode = "VISUAL_LINE";
            change_statusbar("-- VISUAL LINE --");
            visual_line_start_row = current_row;
            add_visual_hl_current_row();
            break;
        case '.':
            // console.debug("normal_handler(): <.> command received.");
            for (var i = 0; i < last_command.length; i++) {
                normal_handler(last_command.charAt(i));
            }
            break;
        case 'm':
            // TODO: finish implementing this correctly.
            // mode = "SET_MARK";
            break;
        case "\'":
            // TODO: finish implementing this correctly.
            // mode = "GOTO_MARK";
            break;
        case 'n':
            var original_row = current_row;
            execute_search(last_pattern);
            if (current_row < original_row) {
                // Assert: the only time this happens is when we've looped
                // from Bottom of file to Top.
                change_statusbar('<span class="info">search hit BOTTOM, continuing at TOP</span>');
            }
            break;
        case '~':
            save_undo_state();
            toggle_cursor_char_case();
            break;
        case 'u':
            load_undo_state();
            break;
        case 'A':
            save_undo_state();
            var length = get_current_line_length() - 1;
            put_cursor_at_col(length, true);
            insert_after();
            break;
        case 'a':
            save_undo_state();
            insert_after();
            break;
        case 'C':
            save_undo_state();
            delete_D_command();
            insert_after();
            modified_since_last_write = true;
            break;
        case 'I':
            save_undo_state();
            put_cursor_at_col(0, true);
            mode = "INSERT";
            change_statusbar("-- INSERT --");
            break;
        case 'i':
            save_undo_state();
            mode = "INSERT";
            change_statusbar("-- INSERT --");
            break;
        case 'R':
            save_undo_state();
            mode = "REPLACE";
            change_statusbar("-- REPLACE --");
            break;
        case 'r':
            save_undo_state();
            mode = "REPLACE_SINGLE";
            break;
        case 'f':
            mode = "FIND_SINGLE";
            break;
        case 'H':
            put_cursor_at_row(top_visible_row);
            break;
        case 'L':
            var bottom_visible_row = Math.min(top_visible_row + num_display_lines - 1, num_lines - 1);
            put_cursor_at_row(bottom_visible_row);
            break;
        case 'h':
            h_cursor_move(-1);
            break;
        case ':':
            mode = "EXECUTE";
            change_statusbar(": ");
            put_cursor_at_sb_col(1);
            leave_main_window();
            break;
        case '/':
            mode = "EXECUTE";
            change_statusbar("/ ");
            put_cursor_at_sb_col(1);
            leave_main_window();
            break;
        case 'j':
            if (previous_key == 'gq') {
                save_undo_state();
                last_command = 'gqj';
                previous_key = "";
                format_lines_j(true);
                modified_since_last_write = true;
            } else {
                v_cursor_move(+1);
                set_line_visibilities();
                renumber_lines(current_row, current_row);
            }
            break;
        case 'k':
            v_cursor_move(-1);
            set_line_visibilities();
            renumber_lines(current_row, current_row);
            break;
        case 'l':
            h_cursor_move(+1);
            break;
        case '0':
            put_cursor_at_col(0, true);
            break;
        case '$':
            var length = get_current_line_length() - 1;
            put_cursor_at_col(length, true);
            break;
        case 'G':
            if (previous_key == "") {
                var i = num_lines - 1;
                put_cursor_at_row(i);
                set_line_visibilities();
                renumber_lines(top_visible_row);
            } else if (previous_key == 'd') {
                save_undo_state();
                last_command = 'dG';
                previous_key = "";
                delete_G_motion();
                modified_since_last_write = true;
            } else if (previous_key == 'gq') {
                save_undo_state();
                last_command = 'gqG';
                previous_key = "";
                format_lines_G();
                modified_since_last_write = true;
            } else {
                previous_key = "";
            }
            break;
        case '{':
            if (previous_key == "") {
                var index = get_next_lbracket_position();
                put_cursor_at_row(index);
                put_cursor_at_col(0, true);
                set_line_visibilities();
            } else if (previous_key == 'd') {
                save_undo_state();
                last_command = 'd{';
                previous_key = "";
                delete_lbracket_motion();
                modified_since_last_write = true;
            } else {
                previous_key = "";
            }
            break;
        case '}':
            if (previous_key == "") {
                var index = get_next_rbracket_position();
                put_cursor_at_row(index);
                if (index == (num_lines - 1)) {
                    var contents = get_clean_contents();
                    put_cursor_at_col(contents.length - 1, true);
                } else {
                    put_cursor_at_col(0, true);
                }
                set_line_visibilities();
                renumber_lines(top_visible_row);
            } else if (previous_key == 'd') {
                save_undo_state();
                last_command = 'd}';
                previous_key = "";
                delete_rbracket_motion();
                modified_since_last_write = true;
            } else if (previous_key == 'gq') {
                save_undo_state();
                last_command = 'gq}';
                previous_key = "";
                format_lines_rbracket();
                modified_since_last_write = true;
            } else {
                previous_key = "";
            }
            break;
        case 'q':
            if (previous_key == "") {
                previous_key = 'q';
            } else if (previous_key == 'g') {
                previous_key = 'gq';
            } else {
                previous_key = "";
            }
            break;
        case 'g':
            if (previous_key == "") {
                previous_key = 'g';
            } else if (previous_key == 'g') {
                previous_key = ""
                put_cursor_at_row(0);
                put_cursor_at_col(0, true);
                set_line_visibilities();
            } else if (previous_key == 'd') {
                previous_key = "dg";
            } else if (previous_key == "dg") {
                save_undo_state();
                last_command = 'dgg';
                previous_key = "";
                delete_gg_motion();
                modified_since_last_write = true;
            } else {
                previous_key = "";
            }
            break;
        case 'y':
            if (previous_key == "") {
                previous_key = 'y';
            } else if (previous_key == 'y') {
                previous_key = "";
                // Zero out the visual yank buffer so we know what to paste.
                visual_yank_buffer = [];
                yank_current_line();
            } else {
                previous_key = "";
            }
            break;
        case 'p':
            if (paste_reg != "" && paste_reg != null) {
                save_undo_state();
                paste_below();
                modified_since_last_write = true;
            } else if (visual_yank_buffer.length != 0){
                save_undo_state();
                visual_paste_below();
                if (visual_yank_buffer.length >= 3) {
                    change_statusbar(visual_yank_buffer.length + " more lines");
                } else {
                    change_statusbar(" ");
                }
                modified_since_last_write = true;
            } else {
                change_status_bar('No lines yanked!');
                setTimeout(function () {
                    change_status_bar("");
                }, 1000);
            }
            break;
        case 'D':
            save_undo_state();
            last_command = 'D';
            delete_D_command();
            modified_since_last_write = true;
            break;
        case 'x':
            save_undo_state();
            remove_char_under_cursor();
            modified_since_last_write = true;
            last_command = 'x';
            break;
        case 'o':
            save_undo_state();
            open_blank_line_below();
            modified_since_last_write = true;
            mode = "INSERT";
            change_statusbar("-- INSERT --");
            break;
        case 'd':
            if (previous_key == "") {
                previous_key = 'd';
            } else if (previous_key == 'd') {
                save_undo_state();
                last_command = 'dd';
                previous_key = "";
                delete_current_line();
                modified_since_last_write = true;
            } else {
                previous_key = "";
            }
            break;
        case 'c':
            previous_key = 'c';
            break;
        case 'w':
            if (previous_key == "") {
                put_cursor_at_next_w_position();
                set_line_visibilities();
            } else if (previous_key == 'd') {
                save_undo_state();
                last_command = 'dw';
                previous_key = "";
                delete_w_motion();
                modified_since_last_write = true;
            } else if (previous_key == 'c') {
                save_undo_state();
                last_command = 'dw';
                previous_key = "";
                delete_w_motion();
                modified_since_last_write = true;
                mode = "INSERT";
                change_statusbar("-- INSERT --");
            } else {
                previous_key = "";
            }
            break;
        case 'b':
            // var index = get_next_b_position();
            // put_cursor_at_col(index, true);
            put_cursor_at_next_b_position();
            set_line_visibilities();
            break;
        case 'S':
            save_undo_state();
            put_cursor_at_col(0, true);
            delete_D_command();
            insert_after();
            modified_since_last_write = true;
            break;
        case 's':
            save_undo_state();
            remove_char_under_cursor();
            mode = "INSERT";
            change_statusbar("-- INSERT --");
            modified_since_last_write = true;
            break; 
        default:
            // alert("You pressed key: " + key);
    }
}
