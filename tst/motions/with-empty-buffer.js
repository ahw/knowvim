describe('Motions with empty buffer', function() {

    var LOG = TestHelpers.LOG;

    describe('When buffer is []', function() {
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

        it('w motion when buffer is []', function() {
            vim.receiveKey('w');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });

        it('b motion when buffer is []', function() {
            vim.receiveKey('b');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });

        it('} motion when buffer is []', function() {
            vim.receiveKey('}');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });

        it('{ motion when buffer is []', function() {
            vim.receiveKey('{');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });
    });

    describe('When buffer is [""]', function() {
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
        
        it('w motion when buffer is [""]', function() {
            vim.receiveKey('w');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });
        
        it('b motion when buffer is [""]', function() {
            vim.receiveKey('b');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });
        
        it('} motion when buffer is [""]', function() {
            vim.receiveKey('}');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });

        it('{ motion when buffer is [""]', function() {
            vim.receiveKey('{');
            expect(vim.get('row')).to.be(0);
            expect(vim.get('col')).to.be(0);
        });
    });
});
