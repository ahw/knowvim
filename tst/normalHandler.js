describe('Normal Handler', function() {
    var buffer
      , vim
      , normalHandler;

    before(function() {
        buffer = new Buffer();
        vim = new Vim({buffer : buffer});
        normalHandler = new NormalHandler({
            vim : vim,
            buffer : buffer
        });

        normalHandler.receiveNormalCommand = function(n) {
            this.mrc = n;
        };
    });

    describe('NORMAL motions', function() {
        it('Should receive a motion command after j', function() {
            normalHandler.receiveKey('j');
            expect(normalHandler.mrc.motionName).to.be('j');
            expect(normalHandler.mrc.commandString).to.be('j');
        });

        it('Should receive a delete command after "a3dj', function() {
            normalHandler.receiveKey('"');
            normalHandler.receiveKey('a');
            normalHandler.receiveKey('3');
            normalHandler.receiveKey('d');
            normalHandler.receiveKey('j');
            expect(normalHandler.mrc.register).to.be('"');
            expect(normalHandler.mrc.registerName).to.be('a');
            expect(normalHandler.mrc.operationName).to.be('d');
        });
    });

});
