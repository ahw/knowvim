var Tokenizer = function(options) {

    this.parser = options.parser;
    this.state = 'READY';
    this.currentToken = null;
    var motionKeys = /^[hjkl0\$wb\{\}HL]$/;
    var controlKeys = new RegExp(
            Helpers.controlCharacters.BACKSPACE + "|" +
            Helpers.controlCharacters.DELETE
        );
    var findKeys = /^[ftFT]$/;
    var searchKeys = /^[/\?]$/;
    var positiveValues = /^[123456789]$/;
    var deleteOperator = 'd';
    var changeOperator = 'c';
    var yankOperator = 'y';
    var putOperator = 'p';
    var markOperator = 'm';
    var jumpOperators = /^['`]$/;
    var modeKeys = /^[iIaAVvR\:]$/;
    var regOperator = '"';
    var operatorSynonyms = {
        'D' : ['d', '$'],
        'C' : ['c', '$']
    };
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
        MUTATE : 'MUTATE',
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
        logger.debug('Received "' + ch + '"');
        var tokenizer = this; 
        switch(tokenizer.state) {

            case states.DELETE:
                if (ch == deleteOperator) {
                    var t = new Token({
                        type : 'sameLine',
                        value : ch
                    });
                    tokenizer.state = states.READY;
                    tokenizer.parser.receiveToken(t);
                } else {
                    tokenizer.state = states.READY;
                    tokenizer.receiveChar(ch); // Re-run
                }
                break;

            case states.CHANGE:
                if (ch == changeOperator) {
                    var t = new Token({
                        type : 'sameLine',
                        value : ch
                    });
                    tokenizer.state = states.READY;
                    tokenizer.parser.receiveToken(t);
                } else {
                    tokenizer.state = states.READY;
                    tokenizer.receiveChar(ch); // Re-run
                }
                break;

            case states.YANK:
                if (ch == yankOperator) {
                    var t = new Token({
                        type : 'sameLine',
                        value : ch
                    });
                    tokenizer.state = states.READY;
                    tokenizer.parser.receiveToken(t);
                } else {
                    tokenizer.state = states.READY;
                    tokenizer.receiveChar(ch); // Re-run
                }
                break;

            case states.FIND:
                // TODO: sanitize tokenizer input better.
                if (ch.length == 1) {
                    var t = new Token({
                        type : 'findLetter',
                        value : ch
                    });
                    tokenizer.parser.receiveToken(t);
                } else {
                    tokenizer.warnAboutIllegalCharacter(ch, ' a single letter or symbol.');
                    tokenizer.reset();
                }
                tokenizer.state = states.READY;
                break;

            case states.SEARCH:
                // TODO: Sanitize input better.
                if (ch == '\n') {
                    var t = new Token({
                        type : 'searchWord',
                        value : searchTerm
                    });
                    tokenizer.state = states.READY;
                    searchTerm = "";
                    tokenizer.parser.receiveToken(t);
                } else if (ch.length == 1) {
                    searchTerm += ch;
                    tokenizer.state = states.SEARCH;
                } else {
                    tokenizer.warnAboutIllegalCharacter(ch, ' a word followed by <ENTER>');
                    tokenizer.reset();
                }
                break;

            case states.GOTO_MARK:
                if (/^[a-z]$/.test(ch)) {
                    var t = new Token({
                        type : 'markName',
                        value : ch
                    });
                    tokenizer.parser.receiveToken(t);
                    tokenizer.state = states.READY;
                } else {
                    tokenizer.warnAboutIllegalCharacter(ch, ' a valid mark identifier (something which matches [a-z])');
                    tokenizer.reset();
                }
                break;

            case states.MARK:
                if (/^[a-z]$/.test(ch)) {
                    var t = new Token({
                        type : 'markName',
                        value : ch
                    });
                    tokenizer.parser.receiveToken(t);
                    tokenizer.state = states.READY;
                } else {
                    tokenizer.warnAboutIllegalCharacter(ch, ' a valid mark identifier (something which matches [a-z])');
                    tokenizer.reset();
                }
                break;

            case states.REGISTER:
                if (/^[a-zA-Z0-9\.%#\:\-"]$/.test(ch)) {
                    var t = new Token({
                        type : 'registerName',
                        value : ch
                    });
                    tokenizer.parser.receiveToken(t);
                    tokenizer.state = states.READY;
                } else {
                    tokenizer.warnAboutIllegalCharacter(ch, ' a valid register identifier (something which matches [a-zA-Z0-9\\.%#\\:\\-"] )');
                    tokenizer.reset();
                }
                break;

            case states.COUNT:
                if (/^[0123456789]$/.test(ch)) {
                    countValue = 10 * countValue + parseInt(ch);
                    tokenizer.state = states.COUNT;
                } else {
                    var t = new Token({
                        type : 'count',
                        value : countValue
                    });
                    countValue = 0;
                    tokenizer.state = states.READY;
                    tokenizer.parser.receiveToken(t);
                    tokenizer.receiveChar(ch); // Re-run
                }
                break;

            case states.READY:
                if (motionKeys.test(ch)) {
                    var t = new Token({
                        type : 'motion',
                        value : ch
                    });
                    tokenizer.state = states.READY;
                    tokenizer.parser.receiveToken(t);

                } else if (controlKeys.test(ch)) {
                    var t = new Token({
                        type : 'motion',
                        value : ch
                    });
                    tokenizer.state = states.READY;
                    tokenizer.parser.receiveToken(t);

                } else if (findKeys.test(ch)) {
                    var t = new Token({
                        type : 'find',
                        value : ch
                    });
                    tokenizer.state = states.FIND;
                    tokenizer.parser.receiveToken(t);

                } else if (ch == deleteOperator) {
                    var t = new Token({
                        type : 'delete',
                        value : ch
                    });
                    tokenizer.state = states.DELETE;
                    tokenizer.parser.receiveToken(t);

                } else if (ch == changeOperator) {
                    var t = new Token({
                        type : 'change',
                        value : ch
                    });
                    tokenizer.state = states.CHANGE;
                    tokenizer.parser.receiveToken(t);

                } else if (ch == yankOperator) {
                    var t = new Token({
                        type : 'yank',
                        value : ch
                    });
                    tokenizer.state = states.YANK;
                    tokenizer.parser.receiveToken(t);

                } else if (ch == putOperator) {
                    var t = new Token({
                        type : 'put',
                        value : ch
                    });
                    tokenizer.state = states.READY;
                    tokenizer.parser.receiveToken(t);

                } else if (searchKeys.test(ch)) {
                    var t = new Token({
                        type : 'search',
                        value : ch
                    });
                    tokenizer.state = states.SEARCH;
                    tokenizer.parser.receiveToken(t);

                } else if (jumpOperators.test(ch)) {
                    var t = new Token({
                        type : 'gotoMark',
                        value : ch
                    });
                    tokenizer.state = states.GOTO_MARK;
                    tokenizer.parser.receiveToken(t);

                } else if (ch == markOperator) {
                    var t = new Token({
                        type : 'mark',
                        value : ch
                    });
                    tokenizer.state = states.MARK;
                    tokenizer.parser.receiveToken(t);

                } else if (ch == regOperator) {
                    var t = new Token({
                        type : 'register',
                        value : ch
                    });
                    tokenizer.state = states.REGISTER;
                    tokenizer.parser.receiveToken(t);

                } else if (/^[123456789]$/.test(ch)) {
                    countValue = parseInt(ch);
                    tokenizer.state = states.COUNT;

                } else if (ch == Helpers.controlCharacters.ESC) {
                    var t = new Token({
                        type : 'escape',
                        value : ch
                    });
                    tokenizer.state = states.READY;
                    tokenizer.parser.receiveToken(t);
                
                } else if (modeKeys.test(ch)) {
                    var t = new Token({
                        type : 'mode',
                        value : ch
                    });
                    tokenizer.parser.receiveToken(t);

                } else if (operatorSynonyms[ch]) {
                    logger.debug('Character ' + ch + ' is a synonym for ' + operatorSynonyms[ch].join(""));
                    operatorSynonyms[ch].forEach(function(key) {
                        logger.debug('Re-running tokenizer with character "' + key + '"');
                        tokenizer.receiveChar(key);
                    });

                } else {
                    tokenizer.warnAboutIllegalCharacter(ch, ' one of the Motion types or Operators that have been implemented. It is possible your input is a valid Vim Motion and/or Operator and it just isn\'t implemented here.');
                    tokenizer.reset();
                }
                break;

                default:
                    tokenizer.state = states.READY;
        }
    };

};
