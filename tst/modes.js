describe('Mode transitions', function() {
    var LOG = TestHelpers.LOG;
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
        vim.receiveKey(':');
        vim.receiveKey('x');
        vim.receiveKey('<CR>');
        expect(vim.get('mode')).to.be('NORMAL');
    });

    it('Should not crash when INSERTing when buffer is []', function() {
        vim.get('buffer').set({lines : []});
        vim.receiveKey('i');
        vim.receiveKey('x');
        vim.receiveKey('<ESC>');
        expect(vim.get('buffer').get('lines')).to.have.length(1);
        expect(vim.get('row')).to.be(0);
        expect(vim.get('col')).to.be(0);
        expect(vim.get('buffer').get('lines')[0]).to.be('x');
    });

    it('Should not crash when INSERTing when buffer is [""]', function() {
        vim.get('buffer').set({lines : [""]});
        vim.receiveKey('i');
        vim.receiveKey('x');
        vim.receiveKey('<ESC>');
        expect(vim.get('buffer').get('lines')).to.have.length(1);
        expect(vim.get('row')).to.be(0);
        expect(vim.get('col')).to.be(0);
        expect(vim.get('buffer').get('lines')[0]).to.be('x');
    });

});
