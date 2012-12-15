var Tokenizer = function(options) {

    this.parser = options.parser;
    this.state = 'READY';
    this.currentToken = null;
    var motionKeys = /^[hjkl0\$wb\{\}HL]$/;
    var findKeys = /^[ftFT]$/;
    var searchKeys = /^[/\?]$/;
    var positiveValues = /^[123456789]$/;
    var deleteOperator = 'd';
    var yankOperator = 'y';
    var putOperator = 'p';
    var markOperator = 'm';
    var gotoMarkOperator = "'";
    var regOperator = '"';
    var searchTerm = "";
    var countValue = 0;

    var warn = function(ch) {
        console.warn('TOKENIZER: Illegal character ' + ch + ' from ' + this.state + ' state');
    };

    var reset = function(ch) {
        console.warn('Unknown character "' + ch + '". Resetting to READY state.');
    };

    /**
     * The heart of the Tokenizer object. Implementes a finite state machine
     * for tokenizing a character input stream.
     */
    this.receiveChar = function(ch) {

        // TODO: Remove the magin strings here and use some sort of
        // enum-like construct.
        switch(this.state) {
            case 'DELETE':
                if (ch == deleteOperator) {
                    var t = new Token({
                        type : 'special',
                        value : ch
                    });
                    this.state = 'READY';
                    this.parser.receiveToken(t);
                } else {
                    this.state = 'READY';
                    this.receiveChar(ch); // Re-run
                }
                break;

            case 'YANK':
                if (ch == yankOperator) {
                    var t = new Token({
                        type : 'special',
                        value : ch
                    });
                    this.state = 'READY';
                    this.parser.receiveToken(t);
                } else {
                    this.state = 'READY';
                    this.receiveChar(ch); // Re-run
                }
                break;
            
            case 'FIND':
                // TODO: sanitize this input better.
                if (ch.length == 1) {
                    var t = new Token({
                        type : 'letter',
                        value : ch
                    });
                    this.parser.receiveToken(t);
                } else {
                    warn(ch);
                    this.state = 'READY';
                }
                this.state = 'READY';
                break;

            case 'SEARCH':
                // TODO: Sanitize input better.
                if (ch == '\n') {
                    var t = new Token({
                        type : 'word',
                        value : searchTerm
                    });
                    this.state = 'READY';
                    searchTerm = "";
                    this.parser.receiveToken(t);
                } else if (ch.length == 1) {
                    searchTerm += ch;
                    this.state = 'SEARCH';
                } else {
                    warn(ch);
                    this.state = 'READY';
                }
                break;

            case 'GOTO_MARK':
                if (/^[a-z]$/.test(ch)) {
                    var t = new Token({
                        type : 'letter',
                        value : ch
                    });
                    this.parser.receiveToken(t);
                } else {
                    console.warn('Illegal character ' + ch);
                }
                this.state = 'READY';
                break;

            case 'MARK':
                if (/^[a-z]$/.test(ch)) {
                    var t = new Token({
                        type : 'letter',
                        value : ch
                    });
                    this.parser.receiveToken(t);
                } else {
                    console.warn('Illegal character ' + ch);
                }
                this.state = 'READY';
                break;

            case 'REG':
                if (/^[a-zA-Z0-9\.%#\:\-"]$/.test(ch)) {
                    var t = new Token({
                        type : 'letter',
                        value : ch
                    });
                    this.parser.receiveToken(t);
                } else {
                    console.warn('Illegal character ' + ch);
                }
                this.state = 'READY';
                break;

            case 'COUNT':
                if (/^[0123456789]$/.test(ch)) {
                    countValue = 10 * countValue + parseInt(ch);
                    this.state = 'COUNT';
                } else {
                    var t = new Token({
                        type : 'count',
                        value : countValue
                    });
                    countValue = 0;
                    this.state = 'READY';
                    this.parser.receiveToken(t);
                    this.receiveChar(ch); // Re-run
                }
                break;

            case 'READY':
                if (motionKeys.test(ch)) {
                    var t = new Token({
                        type : 'motion',
                        value : ch
                    });
                    this.state = 'READY';
                    this.parser.receiveToken(t);
                } else if (findKeys.test(ch)) {
                    var t = new Token({
                        type : 'find',
                        value : ch
                    });
                    this.state = 'FIND';
                    this.parser.receiveToken(t);

                } else if (ch == deleteOperator) {
                    var t = new Token({
                        type : 'delete',
                        value : ch
                    });
                    this.state = 'DELETE';
                    this.parser.receiveToken(t);

                } else if (ch == yankOperator) {
                    var t = new Token({
                        type : 'yank',
                        value : ch
                    });
                    this.state = 'YANK';
                    this.parser.receiveToken(t);

                } else if (ch == putOperator) {
                    var t = new Token({
                        type : 'put',
                        value : ch
                    });
                    this.state = 'READY';
                    this.parser.receiveToken(t);

                } else if (searchKeys.test(ch)) {
                    var t = new Token({
                        type : 'search',
                        value : ch
                    });
                    this.state = 'SEARCH';
                    this.parser.receiveToken(t);

                } else if (ch == gotoMarkOperator) {
                    var t = new Token({
                        type : 'gotoMark',
                        value : ch
                    });
                    this.state = 'GOTO_MARK';
                    this.parser.receiveToken(t);

                } else if (ch == markOperator) {
                    var t = new Token({
                        type : 'mark',
                        value : ch
                    });
                    this.state = 'MARK';
                    this.parser.receiveToken(t);

                } else if (ch == regOperator) {
                    var t = new Token({
                        type : 'register',
                        value : ch
                    });
                    this.state = 'REG';
                    this.parser.receiveToken(t);

                } else if (/^[123456789]$/.test(ch)) {
                    countValue = parseInt(ch);
                    this.state = 'COUNT';

                } else if (ch == 'ESC') {
                    var t = new Token({
                        type : 'escape',
                        value : ch
                    });
                    this.state = 'READY';
                    this.parser.receiveToken(t);

                } else {
                    reset(ch);
                }
                break;

                default:
                    this.state = 'READY';
        }
    };

    /**
     * Helper method.
     */
    this.logToken = function(token) {
        console.log('TOKEN: ' + token);
    };

};
