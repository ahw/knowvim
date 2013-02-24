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

    xrunTest = function(args) {
        var msg = args.msg || args.cmd + ' command';
        it(msg, function(done) {
            LOG.debug('row = ' + vim.get('row') + ', col = ' + vim.get('col') + ', args:', args);
            runVimCommand(args.cmd);
            expect(vim.get('row')).to.be(args.row);
            expect(vim.get('col')).to.be(args.col);
            LOG.warn('Finishing "it" function of xrunTest');
            done();
        });
        LOG.warn('Finishing xrunTest');
    };

    runVimCommand = function(commandString) {
        var re = /(<[^<>]+>|.)/g;
        commandString.match(re).forEach(function(letter) {
            // LOG.debug('Inputing key: "' + letter + '"');
            vim.receiveKey(letter);
        });
    };

    getPositionsFromStrings = function(lines) {
        var startRow
          , startCol
          , endRow
          , endCol;

        for(var i = 0; i < lines.length; i++) {
            // LOG.debug('Reading line:', lines[i]);
            oneCaret  = /^\s*\^\s*$/;
            twoCarets = /^\s*\^\s*\^\s*$/;
            if (oneCaret.test(lines[i]) && typeof startRow == 'undefined') {
                startRow = i - 1;
                startCol = lines[i].indexOf('^');
            } else if (oneCaret.test(lines[i])) {
                endRow = i - 2;
                endCol = lines[i].indexOf('^');
            } else if (twoCarets.test(lines[i])) {
                startRow = endRow = i - 1;
                startCol = lines[i].indexOf('^');
                endCol = lines[i].indexOf('^', startCol + 1);
            }
        }
        var positions = {
            startRow : startRow,
            startCol : startCol,
            endRow : endRow,
            endCol : endCol
        };
        LOG.warn('Returning positions:', positions);
        return positions;
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

    describe('NORMAL happy path motions', function() {
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
        runTest({cmd : 'G', row : 2, col : 0});
        runTest({cmd : '1G', row : 0, col : 0});
        runTest({cmd : '2G', row : 1, col : 0});
        runTest({cmd : '3G', row : 2, col : 0});
        getPositionsFromStrings([
            'here is a sentence',
            '^    ^'
        ]);
        getPositionsFromStrings([
            'here is a sentence',
            '          ^',
            'followed by',
            '  another',
            '  ^'
        ]);
    });

    describe('NORMAL motion boundary conditions', function() {
        before(function() {
            vim.get('buffer').set({
                lines : [ 'abc', 'def', 'ghi' ]
            });
        });

        beforeEach(function() {
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

    describe('Mode transitions', function() {
        beforeEach(function() {
            vim = new Vim();
        });

        it('NORMAL to INSERT on i', function() {
            runVimCommand('i');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on I', function() {
            runVimCommand('I');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on a', function() {
            runVimCommand('a');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on A', function() {
            runVimCommand('A');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on o', function() {
            runVimCommand('o');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on O', function() {
            runVimCommand('O');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to CMDLINE on :', function() {
            runVimCommand(':');
            expect(vim.get('mode')).to.be('CMDLINE');
        });

        it('NORMAL from INSERT on <ESC>', function() {
            vim.changeMode('INSERT');
            runVimCommand('<ESC>');
            expect(vim.get('mode')).to.be('NORMAL');
        });

        it('NORMAL from CMDLINE on <CR>', function() {
            vim.changeMode('CMDLINE');
            runVimCommand('<CR>');
            expect(vim.get('mode')).to.be('NORMAL');
        });
    });

    describe('NORMAL empty Buffer handling', function() {
        beforeEach(function() {
            vim = new Vim();
        });

        it('Should not crash when INSERTing when buffer is []', function() {
            vim.get('buffer').set({lines : []});
            runVimCommand('ix<ESC>');
            expect(vim.get('buffer').get('lines')).to.have.length(1);
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
            expect(vim.get('buffer').get('lines')[0]).to.be('x');
        });

        it('Should not crash when INSERTing when buffer is [""]', function() {
            vim.get('buffer').set({lines : []});
            runVimCommand('ix<ESC>');
            expect(vim.get('buffer').get('lines')).to.have.length(1);
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
            expect(vim.get('buffer').get('lines')[0]).to.be('x');
        });

        describe('Motions should go nowhere when buffer is empty', function() {
            LOG.info('Motions should go nowhere when buffer is empty');
            vim.get('buffer').set({lines : []});
            vim.set({row : 0, col : 0});
            xrunTest({cmd : 'h', row : 0, col : 0, msg : 'h motion when buffer is []'});
            LOG.debug('motion = h, row = ' + vim.get('row') + ', col = ' + vim.get('col'));

            xrunTest({cmd : 'j', row : 0, col : 0, msg : 'j motion when buffer is []'});
            LOG.debug('motion = j, row = ' + vim.get('row') + ', col = ' + vim.get('col'));

            runTest({cmd : 'k', row : 0, col : 0, msg : 'k motion when buffer is []'});
            LOG.debug('row = ' + vim.get('row') + ', col = ' + vim.get('col'));

            runTest({cmd : 'l', row : 0, col : 0, msg : 'l motion when buffer is []'});
            LOG.debug('row = ' + vim.get('row') + ', col = ' + vim.get('col'));

            runTest({cmd : '0', row : 0, col : 0, msg : '0 motion when buffer is []'});
            LOG.debug('row = ' + vim.get('row') + ', col = ' + vim.get('col'));

            runTest({cmd : '$', row : 0, col : 0, msg : '$ motion when buffer is []'});
            LOG.debug('row = ' + vim.get('row') + ', col = ' + vim.get('col'));

            runTest({cmd : 'G', row : 0, col : 0, msg : 'G motion when buffer is []'});
            LOG.debug('row = ' + vim.get('row') + ', col = ' + vim.get('col'));
        });

        describe('Motions should go nowhere when buffer is empty string', function() {
            vim.get('buffer').set({lines : [""]});
            vim.set({row : 0, col : 0});
            runTest({cmd : 'h', row : 0, col : 0, msg : 'h motion when buffer is [""]'});
            runTest({cmd : 'j', row : 0, col : 0, msg : 'j motion when buffer is [""]'});
            runTest({cmd : 'k', row : 0, col : 0, msg : 'k motion when buffer is [""]'});
            runTest({cmd : 'l', row : 0, col : 0, msg : 'l motion when buffer is [""]'});
            runTest({cmd : '0', row : 0, col : 0, msg : '0 motion when buffer is [""]'});
            runTest({cmd : '$', row : 0, col : 0, msg : '$ motion when buffer is [""]'});
            runTest({cmd : 'G', row : 0, col : 0, msg : 'G motion when buffer is [""]'});
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
