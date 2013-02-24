describe('Vim', function() {

    var LOG = new Logger({
        module : 'test',
        prefix : 'TEST'
    });

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
        var vim;
        before(function() {
            vim = new Vim();
        });

        it('Should initialize in NORMAL mode', function() {
            expect(vim.get('mode')).to.be('NORMAL');
        });

        it('Should initialize at position (0,0)', function() {
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });
    });

    describe('NORMAL happy path motions', function() {
        var vim;
        before(function() {
            vim = new Vim();
        });

        beforeEach(function() {
            vim.get('buffer').set({
                lines : [ 'abc', 'def', 'ghi' ]
            });
            vim.set({row : 1, col : 1});
        });

        it('h motion', function() {
            vim.receiveKey('h');
            expect(vim.get('row')).to.be(1);
            expect(vim.get('col')).to.be(0);
        });

        it('j motion', function() {
            vim.receiveKey('j');
            expect(vim.get('row')).to.be(2);
            expect(vim.get('col')).to.be(1);
        });

        it('k motion', function() {
            vim.receiveKey('k');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(1);
        });

        it('l motion', function() {
            vim.receiveKey('l');
            expect(vim.get('row')).to.be(1);
            expect(vim.get('col')).to.be(2);
        });

        it('0 motion', function() {
            vim.receiveKey('0');
            expect(vim.get('row')).to.be(1);
            expect(vim.get('col')).to.be(0);
        });

        it('$ motion', function() {
            vim.receiveKey('$');
            expect(vim.get('row')).to.be(1);
            expect(vim.get('col')).to.be(2);
        });

        it('G motion', function() {
            vim.receiveKey('G');
            expect(vim.get('row')).to.be(2);
            expect(vim.get('col')).to.be(0);
        });

        it('1G motion', function() {
            vim.receiveKey('1');
            vim.receiveKey('G');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });

        it('2G motion', function() {
            vim.receiveKey('2');
            vim.receiveKey('G');
            expect(vim.get('row')).to.be(1);
            expect(vim.get('col')).to.be(0);
        });

        it('3G motion', function() {
            vim.receiveKey('3');
            vim.receiveKey('G');
            expect(vim.get('row')).to.be(2);
            expect(vim.get('col')).to.be(0);
        });

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
        var vim;
        before(function() {
            vim = new Vim();
            vim.get('buffer').set({
                lines : [ 'abc', 'def', 'ghi' ]
            });
        });

        beforeEach(function() {
            vim.set({row : 1, col : 1});
        });

        it('Bounded h movement', function() {
            vim.receiveKey('h');
            vim.receiveKey('h');
            vim.receiveKey('h');
            vim.receiveKey('h');
            vim.receiveKey('h');
            expect(vim.get('row')).to.be(1);
            expect(vim.get('col')).to.be(0);
        });

        it('Bounded l movement', function() {
            vim.receiveKey('l');
            vim.receiveKey('l');
            vim.receiveKey('l');
            vim.receiveKey('l');
            vim.receiveKey('l');
            expect(vim.get('row')).to.be(1);
            expect(vim.get('col')).to.be(2);
        });

        it('Bounded j movement', function() {
            vim.receiveKey('j');
            vim.receiveKey('j');
            vim.receiveKey('j');
            vim.receiveKey('j');
            vim.receiveKey('j');
            expect(vim.get('row')).to.be(2);
            expect(vim.get('col')).to.be(1);
        });

        it('Bounded k movement', function() {
            vim.receiveKey('k');
            vim.receiveKey('k');
            vim.receiveKey('k');
            vim.receiveKey('k');
            vim.receiveKey('k');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(1);
        });
    });

    describe('Mode transitions', function() {
        var vim;
        beforeEach(function() {
            vim = new Vim();
        });

        it('NORMAL to INSERT on i', function() {
            vim.receiveKey('i');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on I', function() {
            vim.receiveKey('I');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on a', function() {
            vim.receiveKey('a');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on A', function() {
            vim.receiveKey('A');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on o', function() {
            vim.receiveKey('o');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to INSERT on O', function() {
            vim.receiveKey('O');
            expect(vim.get('mode')).to.be('INSERT');
        });

        it('NORMAL to CMDLINE on :', function() {
            vim.receiveKey(':');
            expect(vim.get('mode')).to.be('CMDLINE');
        });

        it('NORMAL from INSERT on <ESC>', function() {
            vim.changeMode('INSERT');
            vim.receiveKey('<ESC>');
            expect(vim.get('mode')).to.be('NORMAL');
        });

        it('NORMAL from CMDLINE on <CR>', function() {
            vim.changeMode('CMDLINE');
            vim.receiveKey('<CR>');
            expect(vim.get('mode')).to.be('NORMAL');
        });
    });

    describe('NORMAL empty Buffer handling', function() {
        var vim;
        beforeEach(function() {
            vim = new Vim();
            vim.get('buffer').set({lines : []});
        });

        it('Should not crash when INSERTing when buffer is []', function() {
            vim.receiveKey('i');
            vim.receiveKey('x');
            vim.receiveKey('<ESC>');
            expect(vim.get('buffer').get('lines')).to.have.length(1);
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
            expect(vim.get('buffer').get('lines')[0]).to.be('x');
        });

        it('Should not crash when INSERTing when buffer is [""]', function() {
            vim.receiveKey('i');
            vim.receiveKey('x');
            vim.receiveKey('<ESC>');
            expect(vim.get('buffer').get('lines')).to.have.length(1);
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
            expect(vim.get('buffer').get('lines')[0]).to.be('x');
        });

        describe('Motions should go nowhere when buffer is []', function() {
            var vim;
            beforeEach(function() {
                vim = new Vim();
                vim.get('buffer').set({lines : []});
            });

            it('h motion when buffer is []', function() {
                vim.receiveKey('h');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });

            it('j motion when buffer is []', function() {
                vim.receiveKey('j');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });

            it('k motion when buffer is []', function() {
                vim.receiveKey('k');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });

            it('l motion when buffer is []', function() {
                vim.receiveKey('l');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });

            it('0 motion when buffer is []', function() {
                vim.receiveKey('0');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });

            it('$ motion when buffer is []', function() {
                vim.receiveKey('$');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });

            it('G motion when buffer is []', function() {
                vim.receiveKey('G');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });
        });

        describe('Motions should go nowhere when buffer is [""]', function() {
            var vim;
            before(function() {
                vim = new Vim();
                vim.get('buffer').set({lines : [""]});
            });

            it('h motion when buffer is [""]', function() {
                vim.receiveKey('h');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });
            
            it('j motion when buffer is [""]', function() {
                vim.receiveKey('j');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });
            
            it('k motion when buffer is [""]', function() {
                vim.receiveKey('k');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });
            
            it('l motion when buffer is [""]', function() {
                vim.receiveKey('l');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });
            
            it('0 motion when buffer is [""]', function() {
                vim.receiveKey('0');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });
            
            it('$ motion when buffer is [""]', function() {
                vim.receiveKey('$');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });
            
            it('G motion when buffer is [""]', function() {
                vim.receiveKey('G');
                expect(vim.get('row')).to.be(0);
                expect(vim.get('col')).to.be(0);
            });
            
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
