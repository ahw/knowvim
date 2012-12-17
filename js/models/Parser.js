var Parser = function() {

    var mostRecentCountToken = null;
    var vimCommand = {};
    // -- var states = {
    // --     MARK   : 'MARK',
    // --     FIND   : 'FIND',
    // --     YANK   : 'YANK',
    // --     READY  : 'READY',
    // --     SEARCH : 'SEARCH',
    // --     DELETE : 'DELETE',
    // --     REGISTER : 'REGISTER'
    // -- };

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
     *  word : 'searchWord'
     * }
     *
     * Then the only valid next token is a 'word' token. Once received, it
     * should be inpreted as the 'searchWord' within a 'search' command,
     * which itself is a particular 'motionName'. See example below.
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
    this.validNextTokens = {
        register : 'DUMMY',
        count : 'operationCount'
    };

    this.error = function(token) {
        console.warn('PARSER: No implementation to handle token ' + token);
    };

    this.reset = function() {
        console.log('PARSER: Resetting to READY state. Clearing token stack.');
    };

    this.done = function() {
        console.log('PARSER : Completed command');
        console.log('--------------------------');
        console.log(JSON.stringify(vimCommand, null, '    '));
    };

    this.receiveToken = function(token) {

        console.log('    PARSER: Received token ' + token);

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
                // LEFTT OFF HERE
                this.validNextTokens = {};
                this.done();
                break;
            case 'count':
                this.mostRecentCountToken = token;
                this.validNextTokens = {
                    'find' : 'motionName',
                    'motion' : 'motionName',
                    'search' : 'motionName',
                    'gotoMark' : 'motionName',
                    'put' : 'operationName',
                    'mark' : 'operationName',
                    'yank' : 'operationName',
                    'delete' : 'operationName'
                };
                break;
            case 'mark':
            case 'gotoMark':
                this.validNextTokens = {
                    'letter' : 'markName'
                };
                // Mark and gotoMark can go to the same state.
                break;
            case 'find':
                this.validNextTokens = {
                    'letter' : 'findLetter'
                };
                break;
            case 'search':
                this.validNextTokens = {
                    'word' : 'searchWord'
                };
                break;
            case 'delete':
                if (typeof vimCommand.operationCount == 'undefined') {
                    // Assert: the mostRecentCountToken (if there is
                    // one) should be used as the operationCount.
                    // TODO: do this.
                }
                this.validNextTokens = {
                    'find' : 'motionName',
                    'count' : 'motionCount',
                    'search' : 'motionName',
                    'motion' : 'motionName',
                    'gotoMark' : 'motionName',
                    'sameLine' : 'motionName'
                };
                break;
            case 'register':
                this.validNextTokens = {
                    'put' : 'operationName',
                    'yank' : 'operationName',
                    'letter' : 'registerName',
                    'count' : 'operationCount',
                    'delete' : 'operationName'
                };
                break;
            case 'put':
                this.validNextTokens = {};
                this.done();
                break;
            case 'yank':
                this.validNextTokens = {
                    'find' : 'motionName',
                    'count' : 'motionCount',
                    'search' : 'motionName',
                    'motion' : 'motionName',
                    'gotoMark' : 'motionName',
                    'sameLine' : 'motionName'
                };
                break;
            default:
                this.validNextTokens = {};
                this.error(token);
                console.warn('PARSER: Not adding token ' + token + ' to tokenStack.');
                tokenStack.pop(); // Remove the last item.
        }
    };

};
