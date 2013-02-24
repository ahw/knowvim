describe('Vim', function() {

    window.vim = new Vim();
    var LOG = new Logger({
        module : 'test',
        prefix : 'TEST'
    });

    runTest = function(args) {
        var msg = args.msg || args.cmd + ' command';
        it(msg, function() {
            runVimCommand(args.cmd);
            expect(vim.get('row')).to.be(args.row);
            expect(vim.get('col')).to.be(args.col);
        });
    };

    runVimCommand = function(commandString) {
        var re = /(<[^<>]+>|.)/g;
        commandString.match(re).forEach(function(letter) {
            LOG.debug('Inputing key: "' + letter + '"');
            vim.receiveKey(letter);
        });
    };

    describe('Initialization', function() {
        it('Should initialize in NORMAL mode', function() {
            expect(vim.get('mode')).to.be('NORMAL');
        });

        it('Should initialize at position (0,0)', function() {
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });
    });

    describe('NORMAL mode happy path motions', function() {
        beforeEach(function() {
            vim.get('buffer').set({
                lines : [ 'abc', 'def', 'ghi' ]
            });
            vim.set({row : 1, col : 1});
        });

        runTest({cmd : 'h', row : 1, col : 0});
        runTest({cmd : 'j', row : 2, col : 1});
        runTest({cmd : 'k', row : 0, col : 1});
        runTest({cmd : 'l', row : 1, col : 2});
        runTest({cmd : '$', row : 1, col : 2});
        runTest({cmd : '0', row : 1, col : 0});
    });

    describe('NORMAL mode motion boundaries', function() {
        beforeEach(function() {
            vim.get('buffer').set({
                lines : [ 'abc', 'def', 'ghi' ]
            });
            vim.set({row : 1, col : 1});
        });

        runTest({
            msg : 'Bounded h movement',
            cmd : 'hhhhhhhh',
            row : 1,
            col : 0
        });
        runTest({
            msg : 'Bounded l movement',
            cmd : 'llllllll',
            row : 1,
            col : 2
        });
        runTest({
            msg : 'Bounded j movement',
            cmd : 'jjjjjjjj',
            row : 2,
            col : 1
        });
        runTest({
            msg : 'Bounded k movement',
            cmd : 'kkkkkkkk',
            row : 0,
            col : 1
        });

    });

    describe('Changing between modes', function() {
        beforeEach(function() {
            vim = new Vim();
        });

        it('Should switch to INSERT on i', function() {
            runVimCommand('i');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('Should switch to INSERT on I', function() {
            runVimCommand('I');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('Should switch to INSERT on a', function() {
            runVimCommand('a');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('Should switch to INSERT on A', function() {
            runVimCommand('A');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('Should switch to INSERT on o', function() {
            runVimCommand('o');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('Should switch to INSERT on O', function() {
            runVimCommand('O');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('Should switch to CMDLINE on :', function() {
            runVimCommand(':');
            expect(vim.get('mode')).to.be('CMDLINE');
        });

        it('Should switch to NORMAL from INSERT', function() {
            vim.changeMode('INSERT');
            runVimCommand('<ESC>');
            expect(vim.get('mode')).to.be('NORMAL');
        });

        it('Should switch to NORMAL from CMDLINE', function() {
            vim.changeMode('CMDLINE');
            runVimCommand('<CR>');
            expect(vim.get('mode')).to.be('NORMAL');
        });
    });

    describe('NORMAL mode empty Buffer handling', function() {
        beforeEach(function() {
            vim = new Vim();
        });

        it('Should not crash when INSERTing with buffer of zero length', function() {
            vim.get('buffer').set({lines : []});
            runVimCommand('ix<ESC>');
            expect(vim.get('buffer').get('lines')).to.have.length(1);
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
            expect(vim.get('buffer').get('lines')[0]).to.be('x');
        });

        it('Should not crash when INSERTing with empty string buffer of length 1', function() {
            vim.get('buffer').set({lines : []});
            runVimCommand('ix<ESC>');
            expect(vim.get('buffer').get('lines')).to.have.length(1);
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
            expect(vim.get('buffer').get('lines')[0]).to.be('x');
        });
    });

    // -- var s = [
    // --     'here is a sentence',
    // --     '     ^',
    // --     'here is another sentnce',
    // --     'I will throw in some # special $ chars',
    // --     '       ^',
    // -- ];
});
