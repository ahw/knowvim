describe('Motions (happy path with counts)', function() {
    var LOG = TestHelpers.LOG;

    var vim;

    before(function() {
        vim = new Vim();
    });

    beforeEach(function() {
        vim.get('buffer').set({
            lines : [ 'foo bar baz', 'foo bar baz', 'foo bar baz' ]
        });
        // Set position to the middle 'a' of the middle line
        vim.set({row : 1, col : 5});
    });

    it('{count}h motion', function() {
        vim.receiveKey('4');
        vim.receiveKey('h');
        expect(vim.get('row')).to.be(1);
        expect(vim.get('col')).to.be(1);
    });

    it('{count}w motion', function() {
        var lines = [
            'one two three',
            '     ^       ',
            'one two three',
            'one two three',
            '    ^        '
        ];
        var positions = TestHelpers.getPositionsFromStrings({
            lines : lines,
            higherOrLower : 'higher'
        });
        vim.get('buffer').set({
            lines : TestHelpers.removeCaretsFromStrings(lines)
        });
        vim.set({
            row : positions.startRow,
            col : positions.startCol
        });
        vim.receiveKey('6');
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });
});
