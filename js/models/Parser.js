var Parser = function() {

    var tokenStack = [];
    var states = {
        MARK   : 'MARK',
        FIND   : 'FIND',
        YANK   : 'YANK',
        READY  : 'READY',
        SEARCH : 'SEARCH',
        DELETE : 'DELETE',
        REGISTER : 'REGISTER'
    };

    this.state = states.READY;

    var logError = function(token) {
        console.warn('PARSER: No implementation to handle token ' + token + ' from ' + this.state + ' state');
    };

    this.reset = function() {
        console.log('Resetting to READY state with no token stack.');
        this.state = states.READY;
        this.tokenStack = [];
    };

    this.done = function() {
        console.log('PARSER : Completed command');
        console.log('--------------------------');
        tokenStack.forEach(function(token) {
            console.log(token.toString());
        });
        tokenStack = [];
    };

    this.receiveToken = function(token) {

        console.log('    PARSER: Received token ' + token);

        // TODO: Remove the magic strings here and use some sort of
        // enum-like construct.
        switch(this.state) {

            case states.MARK:
                if (token.type == 'letter') {
                    tokenStack.push(token);
                    this.state = states.READY;
                    this.done();
                } else {
                    logError(token);
                    this.reset();
                }
                break;

            case states.FIND:
                if (token.type == 'letter') {
                    tokenStack.push(token);
                    this.state = states.READY;
                    this.done();
                } else {
                    logError(token);
                    this.reset();
                }
                break;

            case states.SEARCH:
                if (token.type == 'word') {
                    tokenStack.push(token);
                    this.state = states.READY;
                    this.done();
                } else {
                    logError(token);
                    this.reset();
                }
                break;

            case states.REGISTER:
                if (token.type == 'letter') {
                    tokenStack.push(token);
                    this.state = states.READY;
                    this.done();
                } else {
                    logError(token);
                    this.reset();
                }
                break;

            case states.DELETE:
                // TODO come up with a better name than 'special'
                if (token.type == 'special') {
                    tokenStack.push(token);
                    this.state = states.READY;
                    this.done();
                } else if (token.type == 'count') {
                    tokenStack.push(token);
                    this.state = states.READY;
                } else {
                    // Epsilon transition to READY state.
                    this.state = states.READY;
                    this.receiveToken(token);
                }
                break;

            case states.YANK:
                // TODO come up with a better name than 'special'
                if (token.type == 'special') {
                    tokenStack.push(token);
                    this.state = states.READY;
                    this.done();
                } else if (token.type == 'count') {
                    tokenStack.push(token);
                    this.state = states.READY;
                } else {
                    // Epsilon transition to READY state.
                    this.state = states.READY;
                    this.receiveToken(token);
                }
                break;

            case states.READY:
                tokenStack.push(token);
                switch(token.type) {
                    case 'motion':
                        this.state = states.READY; // Remain in READY state.
                        this.done();
                        break;
                    case 'count':
                        this.state = states.READY; // Remain in READY state.
                        break;
                    case 'mark':
                    case 'gotoMark':
                        // Mark and gotoMark can go to the same state.
                        this.state = states.MARK;
                        break;
                    case 'find':
                        this.state = states.FIND;
                        break;
                    case 'search':
                        this.state = states.SEARCH;
                        break;
                    case 'delete':
                        this.state = states.DELETE;
                        break;
                    case 'register':
                        this.state = states.REGISTER;
                        break;
                    case 'put':
                        this.state = states.READY;
                        this.done();
                        break;
                    case 'yank':
                        this.state = states.YANK;
                        break;
                    default:
                        logError();
                        tokenStack.pop(); // Remove the last item.
                }
                break;


                
        }
    };

};
