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
    }


};
