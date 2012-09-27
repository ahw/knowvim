var NormalHandler = Backbone.DeepModel.extend({

    defaults : {
        operator : null,
        motion : null,
        repeat : 1,
        state : 'START',
        operators : {
            'd' : 'd',
            'c' : 'c',
            'y' : 'y',
            '~' : '~'
        },
        motions : {
            'w' : 'w',
            'b' : 'b',
            '{' : '{',
            '}' : '}',
            '0' : '0',
            '$' : '$',
            'H' : 'H',
            'L' : 'L',
            'G' : 'G',
            'j' : 'j',
            'k' : 'k',
            'h' : 'h',
            'l' : 'l'
        }
    },

    initialize : function() {
        var model = this;

        // Listen for changes in state. When we hit the RUN state execute
        // the command.
        model.on('change:state', function() {
            if (model.get('state') == 'RUN') {
                model.printCommandExpression();
            }
        });
    },

    input : function(key) {
        switch (this.get('state')) {
            case 'START':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        operator : null,
                        motion : key,
                        repeat : 1,
                        state : 'RUN'
                    });
                } else if (this.get('operators')[key]) {
                    // Assert: operator command
                    this.set({
                        motion : null,
                        operator : key,
                        repeat : 1,
                        state : 'OPERATOR'
                    });
                } else if (parseInt(key)) {
                    // Assert: repetition prefix
                    this.set({
                        operator : null,
                        motion : null,
                        repeat : parseInt(key),
                        state : 'NUMBER'
                    });
                } else {
                    console.log('Invalid key "' + key + '". Resetting to START state.');
                    this.set({
                        state : 'START'
                    });
                }
                break;

            case 'NUMBER':
                if (this.get('motions')[key]) {
                    // Assert: motion command
                    this.set({
                        operator : null,
                        motion : key,
                        // repeat remains the same
                        state : 'RUN'
                    });
                } else if (this.get('operators')[key]) {
                    // Assert: operator command
                    this.set({
                        operator : key,
                        motion : null,
                        // repeat remains the same
                        state : 'OPERATOR'
                    });
                } else if (parseInt(key)) {
                    // Assert: repetition prefix
                    var n = parseInt(key);
                    var old_repeat = this.get('repeat');
                    this.set({
                        operator : null,
                        motion : null,
                        repeat : 10 * old_repeat + n,
                        state : 'NUMBER'
                    });
                }
                break;

            case 'OPERATOR':
                if (this.get('motions')[key]) {
                    this.set({
                        // operator remains the same
                        motion : key,
                        // repeat remains the same
                        state : 'RUN'
                    });
                } else {
                    console.log('Invalid key "' + key + '". Resetting to START state.');
                    this.set({
                        state : 'START'
                    });
                }
                break;

            case 'RUN':
                // Epsilon transition to START state.
                this.set({
                    state : 'START'
                });
                this.input(key);
                break;
        }
    },

    printCommandExpression : function() {
        var o = this.get('operator') || "";
        var m = this.get('motion') || "";
        var r = this.get('repeat') || "";

        var s = sprintf('Command: "%d%s%s"', r, o, m);
        s += sprintf('\n    Operator = %s', o);
        s += sprintf('\n    Motion   = %s', m);
        s += sprintf('\n    Repeat   = %s', r);
        console.log(s);
    }

});
