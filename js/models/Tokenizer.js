var Tokenizer = function() {

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

    this.receiveChar = function(ch) {

        switch(this.state) {
            case 'DELETE':
                if (ch == deleteOperator) {
                    var t = new Token({
                        type : 'special',
                        value : ch
                    });
                    this.state = 'READY';
                    this.logToken(t);
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
                    this.logToken(t);
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
                    this.logToken(t);
                } else {
                    console.warn('Illegal character ' + ch);
                }
                this.state = 'READY';
                break;

            case 'SEARCH':
                // TODO: Sanitize input better.
                if (ch != '\n') {
                    searchTerm += ch;
                    this.state = 'SEARCH';
                } else {
                    var t = new Token({
                        type : 'word',
                        value : searchTerm
                    });
                    this.state = 'READY';
                    searchTerm = "";
                    this.logToken(t);
                }
                break;

            case 'GOTO_MARK':
                if (/^[a-z]$/.test(ch)) {
                    var t = new Token({
                        type : 'letter',
                        value : ch
                    });
                    this.logToken(t);
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
                    this.logToken(t);
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
                    this.logToken(t);
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
                    this.logToken(t);
                } else if (findKeys.test(ch)) {
                    var t = new Token({
                        type : 'find',
                        value : ch
                    });
                    this.state = 'FIND';
                    this.logToken(t);

                } else if (ch == deleteOperator) {
                    var t = new Token({
                        type : 'delete',
                        value : ch
                    });
                    this.state = 'DELETE';
                    this.logToken(t);

                } else if (ch == yankOperator) {
                    var t = new Token({
                        type : 'yank',
                        value : ch
                    });
                    this.state = 'YANK';
                    this.logToken(t);

                } else if (ch == putOperator) {
                    var t = new Token({
                        type : 'put',
                        value : ch
                    });
                    this.state = 'READY';
                    this.logToken(t);

                } else if (searchKeys.test(ch)) {
                    var t = new Token({
                        type : 'search',
                        value : ch
                    });
                    this.state = 'SEARCH';
                    this.logToken(t);

                } else if (ch == gotoMarkOperator) {
                    var t = new Token({
                        type : 'gotoMark',
                        value : ch
                    });
                    this.state = 'GOTO_MARK';
                    this.logToken(t);

                } else if (ch == markOperator) {
                    var t = new Token({
                        type : 'mark',
                        value : ch
                    });
                    this.state = 'MARK';
                    this.logToken(t);

                } else if (ch == regOperator) {
                    var t = new Token({
                        type : 'register',
                        value : ch
                    });
                    this.state = 'REG';
                    this.logToken(t);

                } else if (/^[123456789]$/.test(ch)) {
                    countValue = parseInt(ch);
                    this.state = 'COUNT';

                } else if (ch == '<ESC>') {
                    var t = new Token({
                        type : 'escape',
                        value : ch
                    });
                    this.state = 'READY';
                    this.logToken(t);

                } else {
                    console.warn('Unknown character "' + ch + '". Resetting to READY state.');
                }
                break;

                default:
                    this.state = 'READY';
        }
    };

    this.logToken = function(token) {
        console.log('TOKEN: ' + token);
    };

};
