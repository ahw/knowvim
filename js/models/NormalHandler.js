var NormalHandler = Backbone.DeepModel.extend({

    // Defaults.
    defaults : {
        operator : null,
        motion : null,
        repeat : 1,
        state : 'START',

        operators : {
            'd' : 'd',
            'c' : 'c',
            'y' : 'y',
            '~' : '~'
        },
        motions : {
            'w' : 'w',
            'b' : 'b',
            '{' : '{',
            '}' : '}',
            '0' : '0',
            '$' : '$',
            'H' : 'H',
            'L' : 'L',
            'G' : 'G',
            'j' : 'j',
            'k' : 'k',
            'h' : 'h',
            'l' : 'l'
        },

        buffer : null,
        vim : null
    },

    initialize : function(options) {

        var model = this;
        model.set({
            vim : options.vim,
            buffer : options.buffer
        });

        // Listen for changes in state. When we hit the RUN state execute
        // the parsed command.
        model.on('change:state', function() {
            if (model.get('state') == 'RUN') {

                // model.printCommandExpression();
                var motion = model.get('motion');
                var operator = model.get('operator');
                var repeat = model.get('repeat');

                var m = model.getMotionResult(motion, model.row(), model.col());
                for (var i = 0; i < repeat - 1; i++) {
                    m = model.getMotionResult(motion, m.endRow, m.endCol);
                }

                // Set the new row and column in Vim.
                model.get('vim').set({
                    row : m.endRow,
                    col : m.endCol
                });
            }
        });
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


    input : function(key) {
        switch (this.get('state')) {

            case 'START':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        operator : null,
                        motion : key,
                        repeat : 1,
                        state : 'RUN'
                    });
                } else if (this.get('operators')[key]) {
                    // Assert: operator command
                    this.set({
                        operator : key,
                        motion : null,
                        repeat : 1,
                        state : 'OPERATOR'
                    });
                } else if (parseInt(key)) {
                    // Assert: repetition prefix
                    this.set({
                        operator : null,
                        motion : null,
                        repeat : parseInt(key),
                        state : 'NUMBER'
                    });
                } else {
                    console.log('Invalid key "' + key + '". Resetting to START state.');
                    this.set({
                        state : 'START'
                    });
                }
                break;

            case 'NUMBER':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        motion : key,
                        state : 'RUN'
                    });
                } else if (this.get('operators')[key]) {
                    // Assert: operator command
                    this.set({
                        operator : key,
                        state : 'OPERATOR'
                    });
                } else if (parseInt(key)) {
                    // Assert: repetition prefix
                    var n = parseInt(key);
                    var oldRepeat = this.get('repeat');
                    this.set({
                        repeat : 10 * oldRepeat + n,
                        state : 'NUMBER'
                    });
                }
                break;

            case 'OPERATOR':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        motion : key,
                        state : 'RUN'
                    });
                } else {
                    console.log('Invalid key "' + key + '". Resetting to START state.');
                    this.set({
                        state : 'START'
                    });
                }
                break;

            case 'RUN':
                // Epsilon transition to START state.
                this.set({
                    state : 'START'
                });
                this.input(key);
                break;
        }
    },


    // Returns the result of a motionKey motion, in the context of
    // startRow, startCol, and, implicitly, the Buffer retrieved with
    // this.get('buffer').
    getMotionResult : function(motionKey, startRow, startCol) {


        var result = {
            type : null, // 'linewise' or 'characterwise'
            startRow : startRow,
            startCol : startCol,
            endRow : startRow, // Default is no row movement
            endCol : startCol, // Default is no col movement
            inclusive : null, // true if it includes last char towards end
        };

        switch(motionKey) {

            case 'h':
                var endCol = startCol == 0 ? 0 : startCol - 1;
                result.type = 'characterwise';
                result.endCol = endCol;
                result.inclusive = false;
                break;

            case 'l':
                var length = this.lines()[startRow].length;
                var endCol = startCol == length - 1 ? startCol : startCol + 1;
                result.type = 'characterwise';
                result.endCol = endCol;
                result.inclusive = false;
                break;

            case 'j':
                var numRows = this.lines().length;
                var endRow = startRow == numRows - 1 ? startRow : startRow + 1;
                // If the new row is shorter, put the column at the
                // right-most position possible.
                var endCol =
                    startRow != endRow
                    ? endCol = Math.min(this.lines()[endRow].length - 1, startCol)
                    : startCol;
                // End column can't be less than 0.
                endCol = endCol == -1 ? 0 : endCol;

                result.type = 'linewise';
                result.endRow = endRow;
                result.endCol = endCol;
                result.inclusive = true;
                break;

            case 'k':
                var endRow = startRow == 0 ? 0 : startRow - 1;
                // If the new row is shorter, put the column at the
                // right-most position possible.
                var endCol =
                    startRow != endRow
                    ? endCol = Math.min(this.lines()[endRow].length - 1, startCol)
                    : startCol;
                // End column can't be less than 0.
                endCol = endCol == -1 ? 0 : endCol;

                result.type = 'linewise';
                result.endRow = endRow;
                result.endCol = endCol;
                result.inclusive = true;
                break;

            case 'w':
                result = this.getWMotionResult(startRow, startCol);
                break;

        }

        console.log(sprintf('NORMAL %s: start (%s, %s) end (%s, %s)', motionKey, startRow, startCol, result.endRow, result.endCol));
        return result;
    },

    getWMotionResult : function () {
        var state = null;
        var ch = null;
        var category = null;
        var pexp = /[\\\!@#\$%\^&\*\+-=<>:;|'"`~,\.\?\/\[\]\(\)\{\}]/;
        var wexp = /\w/;
        var bexp = /\ /;
        var nexp = /\n/;
        var row_offset = 0;
        var col_offset = 0;
        var contents = this.lines()[startRow];
        var char_buffer = contents.substring(startCol);
        // Says whether or not we have found the next spot to place the cursor
        // for a 'w' movement.
        var found_position = false;
        ch = contents.charAt(startCol);

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
                if (startRow == this.lines().length - 1) {
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
        put_cursor_at_col(current_col + col_offset, true);
    },


    printCommandExpression : function() {
        var o = this.get('operator') || "";
        var m = this.get('motion') || "";
        var r = this.get('repeat') || "";

        var s = sprintf('Command: "%d%s%s"', r, o, m);
        s += sprintf('\n    Operator = %s', o);
        s += sprintf('\n    Motion   = %s', m);
        s += sprintf('\n    Repeat   = %s', r);
        console.log(s);
    }

});
