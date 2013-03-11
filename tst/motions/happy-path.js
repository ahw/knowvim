describe('Motions (happy path)', function() {
    var LOG = TestHelpers.LOG;

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

    it('w motion', function() {
        var positions = TestHelpers.getPositionsFromStrings({
            lines : [
                'one two three',
                '     ^  ^'
            ],
            higherOrLower : 'higher'
        });
        vim.get('buffer').set({
            lines : ['one two three']
        });
        vim.set({
            row : positions.startRow,
            col : positions.startCol
        });
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('w motion with punctuation (Word to Punct)', function() {
        var lines = [
            'one two# three',
            '     ^ ^'
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
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('w motion with punctuation (Punct to Word)', function() {
        var lines = [
            'one @#$ w three',
            '     ^  ^'
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
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('w motion over newline', function() {
        var lines = [
            'one two three',
            '         ^',
            ' four',
            ' ^'
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
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('w motion over blank lines', function() {
        LOG.reportTest(this.test.title);
        var lines = [
            'one two three',
            '         ^',
            '',
            '^',
            '',
            '',
            '',
            ' four',
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
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(positions.endRow + 1);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('w motion over whitespace lines', function() {
        LOG.reportTest(this.test.title);
        var lines = [
            'one two three',
            '         ^',
            '    ',
            '   ',
            '  ',
            ' ',
            ' four',
            ' ^',
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
        vim.receiveKey('w');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('} motion', function() {
        var lines = [
            'foo bar baz',
            '    ^      ',
            'foo bar baz',
            '',
            '^',
            'foo bar baz',
            'foo bar baz',
            '',
            'foo bar baz',
            'foo bar baz',
            '',
            'foo bar baz',
            'foo bar baz'
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
        vim.receiveKey('}');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('{ motion', function() {
        var lines = [
            'foo bar baz',
            'foo bar baz',
            '',
            '^',
            'foo bar baz',
            'foo bar baz',
            '    ^      ',
            '',
            'foo bar baz',
            'foo bar baz',
            '',
            'foo bar baz',
            'foo bar baz'
        ];
        var positions = TestHelpers.getPositionsFromStrings({
            lines : lines,
            higherOrLower : 'lower'
        });
        vim.get('buffer').set({
            lines : TestHelpers.removeCaretsFromStrings(lines)
        });
        vim.set({
            row : positions.startRow,
            col : positions.startCol
        });
        vim.receiveKey('{');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });
});
