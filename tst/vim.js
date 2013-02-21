describe('Vim', function() {

    var vim = new Vim();
    var LOG = new Logger({
        module : 'test',
        prefix : 'TEST'
    });

    runVimCommand = function(commandString) {
        var re = /(<[^<>]+>|.)/g;
        commandString.match(re).forEach(function(letter) {
            LOG.debug("Inputing key: " + letter);
            vim.receiveKey(letter);
        });
    };

    before(function() {
        vim.get('buffer').set({
            lines : [ 'here is line one' ]
        });
    });

    describe('Initialization', function() {
        it('Should initialize in NORMAL mode', function() {
            expect(vim.get('mode')).to.be('NORMAL');
        });

        it('Should initialize at position (0,0)', function() {
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });
    });

    describe('NORMAL mode', function() {
        it('Should move to position (0,1) on l movement', function() {
            vim.receiveKey('l');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(1);
        });

        it('Should remain on first row after multiple k movements', function() {
            runVimCommand('kkkkk<UARROW>');
            expect(vim.get('row')).to.be(0);
        });
    });
});
