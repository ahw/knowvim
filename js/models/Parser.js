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
    var validNextTokens = {
        'find' : 'motionName',
        'motion' : 'motionName',
        'search' : 'motionName',
        'gotoMark' : 'motionName',
        'put' : 'operationName',
        'yank' : 'operationName',
        'delete' : 'operationName'
    };

    this.reset = function() {
        validNextTokens = {
            'find' : 'motionName',
            'motion' : 'motionName',
            'search' : 'motionName',
            'gotoMark' : 'motionName',
            'put' : 'operationName',
            'yank' : 'operationName',
            'delete' : 'operationName'
        };
    };

    this.error = function(token) {
        console.warn('PARSER: No implementation to handle token ' + token);
    };

    this.done = function() {
        console.log('PARSER : Completed command');
        console.log('--------------------------');
        console.log(JSON.stringify(vimCommand, null, '    '));
        vimCommand = {};
    };

    this.receiveToken = function(token) {
        // -- console.log('    PARSER: Received token ' + token);
        // -- console.log('    PARSER: Valid next tokens ', validNextTokens);
        if (validNextTokens[token.type]) {
            // If this token type is valid, assign the appropriate property
            // in the vimCommand structure. Remember that the values of
            // validNextTokens are the keys used in vimCommand.
            vimCommand[validNextTokens[token.type]] = token.value;
        }

        // TODO: Remove the magic strings here and use some sort of
        // enum-like construct.
        switch(token.type) {
            case 'motion':
                if (mostRecentCountToken && typeof vimCommand.motionCount == 'undefined') {
                    // Assert: the mostRecentCountToken (if there is
                    // one) should be used as the motionCount.
                    // TODO: implement this.
                    vimCommand.motionCount = this.mostRecentCountToken;
                    this.mostRecentCountToken = null;
                }
                this.reset();
                this.done();
                break;

            case 'count':
                this.mostRecentCountToken = token;
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

            case 'mark':
            case 'gotoMark':
                validNextTokens = {
                    'markName' : 'markName'
                };
                // Mark and gotoMark can go to the same state.
                break;

            case 'markName':
                this.reset();
                this.done();
                break;

            case 'find':
                validNextTokens = {
                    'findLetter' : 'findLetter'
                };
                break;

            case 'findLetter':
                this.reset();
                this.done();
                break;

            case 'search':
                validNextTokens = {
                    'searchWord' : 'searchWord'
                };
                break;

            case 'searchWord':
                this.reset();
                this.done();
                break;

            case 'delete':
                if (mostRecentCountToken && typeof vimCommand.operationCount == 'undefined') {
                    // Assert: the mostRecentCountToken (if there is
                    // one) should be used as the operationCount..
                    vimCommand.operationCount = this.mostRecentCountToken;
                    this.mostRecentCountToken = null;
                }

                validNextTokens = {
                    'find' : 'motionName',
                    'count' : 'motionCount',
                    'search' : 'motionName',
                    'motion' : 'motionName',
                    'gotoMark' : 'motionName',
                    'sameLine' : 'motionName'
                };
                break;


            case 'sameLine':
                this.reset();
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

            case 'put':
                this.reset();
                this.done();
                break;

            case 'yank':
                validNextTokens = {
                    'find' : 'motionName',
                    'count' : 'motionCount',
                    'search' : 'motionName',
                    'motion' : 'motionName',
                    'gotoMark' : 'motionName',
                    'sameLine' : 'motionName'
                };
                break;

            default:
                this.reset();
                this.error(token);
        }
    };

};
