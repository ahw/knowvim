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
    var jumpOperators = /^['`]$/;
    var modeKeys = /^[iVvR\:]$/;
    var regOperator = '"';
    var searchTerm = "";
    var countValue = 0;
    var states = {
        FIND : 'FIND',
        MARK : 'MARK',
        YANK : 'YANK',
        COUNT : 'COUNT',
        READY : 'READY',
        DELETE : 'DELETE',
        SEARCH : 'SEARCH',
        REGISTER : 'REGISTER',
        GOTO_MARK : 'GOTO_MARK'
    };
    var logger = new Logger({
        module : 'tokenizer',
        prefix : 'TOKENIZER'
    });

    this.warnAboutIllegalCharacter = function(ch, expectedCharDescription) {
        logger.warn('Illegal character ' + ch + ' from ' + this.state + ' state. Expected ' + expectedCharDescription);
    };

    this.reset = function() {
        logger.warn('Resetting to READY state.');
        this.parser.reset();
        this.state = states.READY;
    };

    /**
     * The heart of the Tokenizer object. Implementes a finite state machine
     * for tokenizing a character input stream.
     */
    this.receiveChar = function(ch) {

        // TODO: Remove the magin strings here and use some sort of
        // enum-like construct.
        logger.log('Received "' + ch + '"');
        switch(this.state) {

            case states.DELETE:
                if (ch == deleteOperator) {
                    var t = new Token({
                        type : 'sameLine',
                        value : ch
                    });
                    this.state = states.READY;
                    this.parser.receiveToken(t);
                } else {
                    this.state = states.READY;
                    this.receiveChar(ch); // Re-run
                }
                break;

            case states.YANK:
                if (ch == yankOperator) {
                    var t = new Token({
                        type : 'sameLine',
                        value : ch
                    });
                    this.state = states.READY;
                    this.parser.receiveToken(t);
                } else {
                    this.state = states.READY;
                    this.receiveChar(ch); // Re-run
                }
                break;

            case states.FIND:
                // TODO: sanitize this input better.
                if (ch.length == 1) {
                    var t = new Token({
                        type : 'findLetter',
                        value : ch
                    });
                    this.parser.receiveToken(t);
                } else {
                    this.warnAboutIllegalCharacter(ch, ' a single letter or symbol.');
                    this.reset();
                }
                this.state = states.READY;
                break;

            case states.SEARCH:
                // TODO: Sanitize input better.
                if (ch == '\n') {
                    var t = new Token({
                        type : 'searchWord',
                        value : searchTerm
                    });
                    this.state = states.READY;
                    searchTerm = "";
                    this.parser.receiveToken(t);
                } else if (ch.length == 1) {
                    searchTerm += ch;
                    this.state = states.SEARCH;
                } else {
                    this.warnAboutIllegalCharacter(ch, ' a word followed by <ENTER>');
                    this.reset();
                }
                break;

            case states.GOTO_MARK:
                if (/^[a-z]$/.test(ch)) {
                    var t = new Token({
                        type : 'markName',
                        value : ch
                    });
                    this.parser.receiveToken(t);
                    this.state = states.READY;
                } else {
                    this.warnAboutIllegalCharacter(ch, ' a valid mark identifier (something which matches [a-z])');
                    this.reset();
                }
                break;

            case states.MARK:
                if (/^[a-z]$/.test(ch)) {
                    var t = new Token({
                        type : 'markName',
                        value : ch
                    });
                    this.parser.receiveToken(t);
                    this.state = states.READY;
                } else {
                    this.warnAboutIllegalCharacter(ch, ' a valid mark identifier (something which matches [a-z])');
                    this.reset();
                }
                break;

            case states.REGISTER:
                if (/^[a-zA-Z0-9\.%#\:\-"]$/.test(ch)) {
                    var t = new Token({
                        type : 'registerName',
                        value : ch
                    });
                    this.parser.receiveToken(t);
                    this.state = states.READY;
                } else {
                    this.warnAboutIllegalCharacter(ch, ' a valid register identifier (something which matches [a-zA-Z0-9\\.%#\\:\\-"] )');
                    this.reset();
                }
                break;

            case states.COUNT:
                if (/^[0123456789]$/.test(ch)) {
                    countValue = 10 * countValue + parseInt(ch);
                    this.state = states.COUNT;
                } else {
                    var t = new Token({
                        type : 'count',
                        value : countValue
                    });
                    countValue = 0;
                    this.state = states.READY;
                    this.parser.receiveToken(t);
                    this.receiveChar(ch); // Re-run
                }
                break;

            case states.READY:
                if (motionKeys.test(ch)) {
                    var t = new Token({
                        type : 'motion',
                        value : ch
                    });
                    this.state = states.READY;
                    this.parser.receiveToken(t);
                } else if (findKeys.test(ch)) {
                    var t = new Token({
                        type : 'find',
                        value : ch
                    });
                    this.state = states.FIND;
                    this.parser.receiveToken(t);

                } else if (ch == deleteOperator) {
                    var t = new Token({
                        type : 'delete',
                        value : ch
                    });
                    this.state = states.DELETE;
                    this.parser.receiveToken(t);

                } else if (ch == yankOperator) {
                    var t = new Token({
                        type : 'yank',
                        value : ch
                    });
                    this.state = states.YANK;
                    this.parser.receiveToken(t);

                } else if (ch == putOperator) {
                    var t = new Token({
                        type : 'put',
                        value : ch
                    });
                    this.state = states.READY;
                    this.parser.receiveToken(t);

                } else if (searchKeys.test(ch)) {
                    var t = new Token({
                        type : 'search',
                        value : ch
                    });
                    this.state = states.SEARCH;
                    this.parser.receiveToken(t);

                } else if (jumpOperators.test(ch)) {
                    var t = new Token({
                        type : 'gotoMark',
                        value : ch
                    });
                    this.state = states.GOTO_MARK;
                    this.parser.receiveToken(t);

                } else if (ch == markOperator) {
                    var t = new Token({
                        type : 'mark',
                        value : ch
                    });
                    this.state = states.MARK;
                    this.parser.receiveToken(t);

                } else if (ch == regOperator) {
                    var t = new Token({
                        type : 'register',
                        value : ch
                    });
                    this.state = states.REGISTER;
                    this.parser.receiveToken(t);

                } else if (/^[123456789]$/.test(ch)) {
                    countValue = parseInt(ch);
                    this.state = states.COUNT;

                } else if (ch == 'ESC') {
                    var t = new Token({
                        type : 'escape',
                        value : ch
                    });
                    this.state = states.READY;
                    this.parser.receiveToken(t);
                
                } else if (modeKeys.test(ch)) {
                    var t = new Token({
                        type : 'mode',
                        value : ch
                    });
                    this.parser.receiveToken(t);

                } else {
                    this.warnAboutIllegalCharacter(ch, ' one of the Motion types or Operators that have been implemented. It is possible your input is a valid Vim Motion and/or Operator and it just isn\'t implemented here.');
                    this.reset();
                }
                break;

                default:
                    this.state = states.READY;
        }
    };

};
