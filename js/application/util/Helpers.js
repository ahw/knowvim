var Helpers = {

    modeNamesByKey : {
        'i' : 'INSERT',
        'I' : 'INSERT',
        'a' : 'INSERT',
        'A' : 'INSERT',
        'o' : 'INSERT',
        'O' : 'INSERT',
        'v' : 'VISUAL',
        ':' : 'CMDLINE',
        '<ESC>' : 'NORMAL'
    },

    modeNames : {
        INSERT : 'INSERT',
        NORMAL : 'NORMAL',
        VISUAL : 'VISUAL',
        SEARCH : 'SEARCH',
        CMDLINE : 'CMDLINE',
        REGISTERVIEW : 'REGISTERVIEW'
    },

    executeCommands : {
        OPEN : 'open',
        QUIT: 'quit',
        WRITE : 'write',
        REGISTERS : 'registers',
        COLORSCHEME : 'colorscheme'
    },

    controlCharacters : {
        ESC : '<ESC>',
        TAB : '<TAB>',
        ENTER: '<CR>',
        DELETE : '<DELETE>',
        LARROW : '<LARROW>',
        UARROW : '<UARROW>',
        RARROW : '<RARROW>',
        DARROW : '<DARROW>',
        BACKSPACE : '<BACKSPACE>'
    },

    registerTypes : {
        UNNAMED : '"',
        SMALL_DELETE : '-',
        READ_ONLY : {
            LAST_INSERTED_TEXT : '.',
            CURRENT_FILENAME : '%',
            ALTERNATE_FILENAME : '#',
            LAST_EXECUTED_COMMAND : ':'
        },
        BLACK_HOLE : '_',
        LAST_SEARCH_PATTERN : '/'
    },

    getOrderedRegisterNames : function() {
        return [
            '"',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
            'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
            'u', 'v', 'w', 'x', 'y', 'z',
            '-', '.', ':', '%', '#', '/', '='
        ];
    },

    getPositionMarkerString : function(start, end, line) {
        // end argument is optional
        if (typeof end == 'string') {
            line = end;
            end = start;
        }
        var t = '';
        for (var i = 0; i < line.length; i++) {
            if (i == start || i == end)
                t += '^';
            else
                t += ' ';
        }
        return t;
    },

    characterTypes : {
        WORD : /\w/,
        BLANK : /\s/,
        EMPTY : /^$/,
        SPECIAL : /[^\w\s]/,
        NON_BLANK : /[^\s]/
    },

    smallWordTokenTypes : {
        SPECIAL : 'SPECIAL', // Things that aren't alphanumeric
        ALPHA_NUM : 'ALPHA_NUM', // I.e., a-zA-Z0-9_
        EMPTY_LINE : 'EMPTY_LINE' // Empty lines: ""
    },

    bigWordTokenTypes : {
        NON_BLANK : 'NON_BLANK',
        EMPTY_LINE : 'EMPTY_LINE'
    }
};
