var Helpers = {

    modeNamesByKey : {
        'i' : 'INSERT',
        'v' : 'VISUAL',
        ':' : 'CMDLINE',
        'ESC' : 'NORMAL'
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
        BACKSPACE : 'BACKSPACE',
        DELETE : 'DELETE'
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

    // -- letters : function() {
    // --     var letterArray = [];
    // --     for (var i = 97; i <= 122; i++) {
    // --         letterArray.push(String.fromCharCode(i));
    // --     }
    // --     return letterArray;
    // -- },

    // -- numbers : function() {
    // --     return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    // -- },

    getOrderedRegisterNames : function() {
        // -- return ['"'].concat(this.numbers()).concat(this.letters()).concat(['-', '.', ':', '%', '#', '/', '=']);
        return [
            '"',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '-', '.', ':', '%', '#', '/', '='
        ];
    }

};
