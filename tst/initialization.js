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
