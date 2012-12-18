var Parser = function() {

    var mostRecentCountToken = null;
    var vimCommand = {};

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
     * If validNextTokens = {
     *  searchWord : 'searchWord'
     * }
     *
     * Then the only valid next token is a 'searchWord' token. Once
     * received, it should be inpreted as the 'searchWord' within a 'search'
     * command, which itself is a particular 'motionName'. See example
     * below.
     *
     * var p = new Parser();
     * p.receiveToken(new Token({type : 'register', value : 'a'});
     * // => validNextTokens = {
     * //  count : 'operationCount',
     * //  delete : 'operationName',
     * //  yank : 'operationName',
     * //  put : 'operationName'
     * // }
     *
     * p.receiveToken(new Token({type : 'delete', value : 'd'});
     * // => validNextTokens = {
     * //  count : 'motionCount',
     * //  motion : 'motionName',
     * //  find : 'motionName',
     * //  search : 'motionName',
     * //  gotoMark : 'motionName',
     * //  sameLine : 'motionName'
     * // }
     */
    var validNextTokens = {};

    /**
     * This function is used to initialize/reset the validNextTokens object.
     * It is called when a new Parser object is created.
     */
    this.reset = function() {
        console.warn('PARSER: Resetting to initial state.');
        mostRecentCountToken = null;
        vimCommand = {};
        validNextTokens = {
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
            'delete' : 'operationName'
        };
    };
    this.reset(); // Call reset when creating a new Parser.

    this.error = function(token) {
        console.warn('PARSER: No implementation to handle token ' + token);
    };

    this.invalidToken = function(token) {
        var expectedTokenTypes = "";
        Object.keys(validNextTokens).forEach(function(tokenType) {
            expectedTokenTypes += tokenType + ', ';
        });
        expectedTokenTypes.substr(0, expectedTokenTypes.length - 1);
        console.warn('PARSER: Invalid token ' + token + '. Expected one of ' + expectedTokenTypes);
    };

    this.done = function() {
        console.log('PARSER : Completed command');
        console.log('--------------------------');
        console.log(JSON.stringify(vimCommand, null, '    '));
        vimCommand = {};
        this.reset();
        $("body").css("background-color", "yellow");
        $("body").animate({backgroundColor: "#DDF"}, 1000);
    };

    this.tryToAssignOperationCount = function () {
        if (mostRecentCountToken && typeof vimCommand.operationCount == 'undefined') {
            // Assert: we recently accepted a count token of some kind, and
            // the operationCount property of vimCommand has not been set.
            // Thus, the mostRecentCountToken should be used as the
            // operationCount. The 'count' property of vimCommand should be
            // deleted now that we know this is a motionCount.
            delete vimCommand.count;
            vimCommand.operationCount = mostRecentCountToken.value;
            mostRecentCountToken = null;
        }
    };

    this.tryToAssignMotionCount = function() {
        if (mostRecentCountToken && typeof vimCommand.motionCount == 'undefined') {
            // Assert: we recently accepted a count token of some kind, and
            // the motionCount property of vimCommand has not been set.
            // Thus, the mostRecentCountToken should be used as the
            // motionCount. The 'count' property of vimCommand should be
            // deleted now that we know this is a motionCount.
            delete vimCommand.count;
            vimCommand.motionCount = mostRecentCountToken.value;
            mostRecentCountToken = null;
        }
    };

    this.receiveToken = function(token) {
        console.log('PARSER: Received token ' + token);
        if (validNextTokens[token.type]) {
            // If this token type is valid, assign the appropriate property
            // in the vimCommand structure. Remember that the values of
            // validNextTokens are the keys used in vimCommand.
            vimCommand[validNextTokens[token.type]] = token.value;
        } else {
            this.invalidToken(token);
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
                    'delete' : 'operationName'
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
                    'count' : 'operationCount',
                    'delete' : 'operationName'
                };
                break;

            case 'delete':
            case 'yank':
                this.tryToAssignOperationCount();
                validNextTokens = {
                    'find' : 'motionName',
                    'count' : 'motionCount',
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
                console.log('PARSER: Escaping from Normal mode by resetting everything.');
                this.reset();
                break;

            default:
                this.error(token);
                this.reset();
        }
    };

};
