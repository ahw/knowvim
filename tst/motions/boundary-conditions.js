describe('Motions (boundary conditions)', function() {
    var LOG = TestHelpers.LOG;

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
        LOG.reportTest(this.test.title);
        vim.receiveKey('h');
        vim.receiveKey('h');
        vim.receiveKey('h');
        vim.receiveKey('h');
        vim.receiveKey('h');
        expect(vim.get('row')).to.be(1);
        expect(vim.get('col')).to.be(0);
    });

    it('Bounded l movement', function() {
        LOG.reportTest(this.test.title);
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

    it('Bounded w movement', function() {
        // First w motion should put cursor at next word
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(2);
        expect(vim.get('col')).to.be(0);

        // Next w motion should put cursor at end of last word
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(2);
        expect(vim.get('col')).to.be(2);

        // Subsequent w motions should not affect cursor
        vim.receiveKey('w');
        vim.receiveKey('w');
        vim.receiveKey('w');
        vim.receiveKey('w');
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(2);
        expect(vim.get('col')).to.be(2);
    });
});
