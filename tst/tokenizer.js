describe('Tokenizer', function() {
    var buffer
      , vim
      , normalHandler
      , parser
      , tokenizer;

    before(function() {
        buffer = new Buffer();
        vim = new Vim({buffer : buffer});
        normalHandler = new NormalHandler({
            vim : vim,
            buffer : buffer
        });
        parser = new NormalParser({
            normalHandler : normalHandler
        });
        tokenizer = new Tokenizer({
            parser : parser
        });

        tokenizer.pushToken = function(token) {
            this.mrt = token;
        };
    });

    describe('Initialization', function() {
        it('Should initialize to READY state', function() {
            expect(tokenizer.state).to.be('xREADY');
        });
    });

    describe('Token Types', function() {
        it('Should tokenize j as motion', function() {
            tokenizer.receiveChar('j');
            expect(tokenizer.mrt.type).to.be('motion');
            expect(tokenizer.mrt.value).to.be('j');
        });

        it('Should tokenize k as motion', function() {
            tokenizer.receiveChar('k');
            expect(tokenizer.mrt.type).to.be('motion');
            expect(tokenizer.mrt.value).to.be('k');
        });

        it('Should tokenize y as yank', function() {
            tokenizer.receiveChar('y');
            expect(tokenizer.mrt.type).to.be('yank');
            expect(tokenizer.mrt.value).to.be('y');
        });

        it('Should tokenize second y as sameLine', function() {
            tokenizer.receiveChar('y');
            expect(tokenizer.mrt.type).to.be('sameLine');
            expect(tokenizer.mrt.value).to.be('y');
        });
    });
});
