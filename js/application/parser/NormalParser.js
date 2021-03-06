var NormalParser = function(options) {

    var logger = new Logger({
        module : 'parser',
        prefix : 'PARSER'
    });
    var mostRecentCountToken = null;
    var normalCommand = {};
    this.normalHandler = options.normalHandler;

    /**
     *
     * validNextTokens has as its keys the set of all valid token types
     * which might be passed to this.receiveToken. Initially, this data
     * structure contains many keys since there are many tokens which can be
     * passed to this.receiveToken. After receiving a "Find" token however,
     * this data structure should be changed to reflect that only "Letter"
     * tokens are acceptable as validNextTokens.
     *
     * The values in validNextTokens are the key names used in assembling
     * the final VimCommand object. They should be interpreted as such:
     *
     * If we have
     *
     *  validNextTokens = {
     *   searchWord : 'searchWord'
     *  }
     *
     * then the only valid next token is a 'searchWord' token. Once
     * received, it should be inpreted as the 'searchWord' within a 'search'
     * command, which itself is a particular 'motionName'. See example
     * below.
     *
     *  var p = new NormalParser();
     *  p.receiveToken(new Token({type : 'register', value : 'a'});
     *  // => validNextTokens = {
     *  //  count : 'operationCount',
     *  //  delete : 'operationName',
     *  //  yank : 'operationName',
     *  //  put : 'operationName'
     *  // }
     *
     *  p.receiveToken(new Token({type : 'delete', value : 'd'});
     *  // => validNextTokens = {
     *  //  count : 'motionCount',
     *  //  motion : 'motionName',
     *  //  find : 'motionName',
     *  //  search : 'motionName',
     *  //  gotoMark : 'motionName',
     *  //  sameLine : 'motionName'
     *  // }
     */
    var validNextTokens = {};

    /**
     * This function is used to initialize/reset the validNextTokens object.
     * It is called when a new NormalParser object is created.
     */
    this.reset = function() {
        logger.log('Resetting to initial state.');
        mostRecentCountToken = null;
        normalCommand = {};
        validNextTokens = {
            'mode' : 'mode',
            'count' : 'count',
            'escape' : 'escape',
            'register' : 'register',
            'find' : 'motionName',
            'motion' : 'motionName',
            'search' : 'motionName',
            'gotoMark' : 'motionName',
            'put' : 'operationName',
            'yank' : 'operationName',
            'mark' : 'operationName',
            'delete' : 'operationName',
            'change' : 'operationName'
        };
    };
    this.reset(); // Call reset when creating a new NormalParser.

    this.error = function(token) {
        logger.warn('No implementation to handle token ' + token);
    };

    this.done = function() {
        logger.log('Submitting normal command ' + normalCommand.commandString, normalCommand);
        this.normalHandler.receiveNormalCommand(normalCommand);
        normalCommand = {};
        this.reset();
    };

    this.tryToAssignOperationCount = function () {
        if (mostRecentCountToken && typeof normalCommand.operationCount == 'undefined') {
            // Assert: we recently accepted a count token of some kind, and
            // the operationCount property of normalCommand has not been set.
            // Thus, the mostRecentCountToken should be used as the
            // operationCount. The 'count' property of normalCommand should be
            // deleted now that we know this is a motionCount.
            delete normalCommand.count;
            normalCommand.operationCount = mostRecentCountToken.value;
            mostRecentCountToken = null;
        }
    };

    this.tryToAssignMotionCount = function() {
        if (mostRecentCountToken && typeof normalCommand.motionCount == 'undefined') {
            // Assert: we recently accepted a count token of some kind, and
            // the motionCount property of normalCommand has not been set.
            // Thus, the mostRecentCountToken should be used as the
            // motionCount. The 'count' property of normalCommand should be
            // deleted now that we know this is a motionCount.
            delete normalCommand.count;
            normalCommand.motionCount = mostRecentCountToken.value;
            mostRecentCountToken = null;
        }
    };

    this.receiveToken = function(token) {
        logger.debug('Received token:', token);
        if (validNextTokens[token.type]) {
            // If this token type is valid, assign the appropriate property
            // in the normalCommand structure. Remember that the values of
            // validNextTokens are the keys used in normalCommand.
            normalCommand[validNextTokens[token.type]] = token.value;

            // Append this token onto the normalCommand.commandString
            // property.
            if (normalCommand.commandString) {
                normalCommand.commandString += token.value;
            } else {
                normalCommand.commandString = token.value;
            }
        } else {
            // Note: if Tokenizer is designed correctly, we should never get
            // here; Tokenizer will error out saying it received an illegal
            // character. This is because Tokenizer keeps track of state and
            // knows what characters to expect next.
            var expectedTokenTypes = "";
            Object.keys(validNextTokens).forEach(function(tokenType) {
                expectedTokenTypes += tokenType + ', ';
            });
            expectedTokenTypes.substr(0, expectedTokenTypes.length - 1);
            logger.error('Invalid token ' + token + '. Expected one of ' + expectedTokenTypes + '. Returning early.');
            return;
        }

        switch(token.type) {
            case 'count':
                mostRecentCountToken = token;
                validNextTokens = {
                    'find' : 'motionName',
                    'motion' : 'motionName',
                    'search' : 'motionName',
                    'gotoMark' : 'motionName',
                    'put' : 'operationName',
                    'yank' : 'operationName',
                    'delete' : 'operationName',
                    'change' : 'operationName'
                };
                break;

            case 'motion':
                this.tryToAssignMotionCount();
                this.done();
                break;

            case 'find':
                this.tryToAssignMotionCount();
                validNextTokens = {
                    'findLetter' : 'findLetter'
                };
                break;

            case 'search':
                this.tryToAssignMotionCount();
                validNextTokens = {
                    'searchWord' : 'searchWord'
                };
                break;

            case 'gotoMark':
                this.tryToAssignMotionCount();
                // Drop through to 'mark' since they share the same code...
            case 'mark':
                validNextTokens = {
                    'markName' : 'markName'
                };
                break;

            case 'markName':
            case 'findLetter':
            case 'searchWord':
            case 'sameLine':
                this.done();
                break;

            case 'register':
                validNextTokens = {
                    'registerName' : 'registerName',
                };
                break;

            case 'registerName':
                validNextTokens = {
                    'put' : 'operationName',
                    'yank' : 'operationName',
                    'count' : 'count',
                    'delete' : 'operationName',
                    'change' : 'operationName'
                };
                break;

            case 'change':
            case 'delete':
            case 'yank':
                this.tryToAssignOperationCount();
                validNextTokens = {
                    'find' : 'motionName',
                    'count' : 'count',
                    'search' : 'motionName',
                    'motion' : 'motionName',
                    'gotoMark' : 'motionName',
                    'sameLine' : 'motionName'
                };
                break;

            case 'put':
                this.tryToAssignOperationCount();
                this.done();
                break;

            case 'escape':
                logger.log('Received ESC while already in NORMAL mode; resetting everything.');
                this.reset();
                break;

            case 'mode':
                this.done();
                break;

            default:
                this.error(token);
                this.reset();
        }
    };

};
