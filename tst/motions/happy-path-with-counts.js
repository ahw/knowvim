describe('Motions (happy path with counts)', function() {
    var LOG = TestHelpers.LOG;

    var vim;

    before(function() {
        vim = new Vim();
    });

    beforeEach(function() {
    });

    it('[count] h motion', function() {
        var lines = [
            'foo bar baz foo bar baz',
            '     ^       ^         '
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
        vim.receiveKey('8');
        vim.receiveKey('h');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('[count] l motion', function() {
        var lines = [
            'foo bar baz foo bar baz',
            '     ^       ^         '
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
        vim.receiveKey('8');
        vim.receiveKey('l');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });


    it('[count] j motion', function() {
        var lines = [
            'foo',
            '^',
            'bar',
            'baz',
            'foor',
            'bar',
            '^',
            'baz'
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
        vim.receiveKey('4');
        vim.receiveKey('j');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('[count] k motion', function() {
        var lines = [
            'foo',
            '^',
            'bar',
            'baz',
            'foor',
            'bar',
            '^',
            'baz'
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
        vim.receiveKey('4');
        vim.receiveKey('k');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('[count] w motion', function() {
        vim.get('buffer').set({
            lines : [ 'foo bar baz', 'foo bar baz', 'foo bar baz' ]
        });
        vim.set({row : 1, col : 5});
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

    it('[count] G motion', function() {
        var lines = [
            'foo bar baz',
            '    ^',
            'foo bar baz',
            'foo bar baz',
            'foo bar baz',
            'foo bar baz',
            '  some indented line',
            '  ^'
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

        // In the case of the G motion, the {count} actually refers to the
        // line number.
        vim.receiveKey('6');
        vim.receiveKey('G');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('[count] $ motion', function() {
        var lines = [
            'foo bar baz',
            '     ^     ',
            'foo bar baz foo',
            'foo bar baz foo bar',
            '                  ^',
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

        vim.receiveKey('3');
        vim.receiveKey('$');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('[count] } motion', function() {
        var lines = [
            'foo bar baz',
            '    ^      ',
            'foo bar baz',
            '',
            'foo bar baz',
            'foo bar baz',
            '',
            'foo bar baz',
            'foo bar baz',
            '',
            '^',
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
        vim.receiveKey('3');
        vim.receiveKey('}');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

    it('[count] { motion', function() {
        var lines = [
            'foo bar baz',
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
            '    ^      ',
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
        vim.receiveKey('3');
        vim.receiveKey('{');
        expect(vim.get('row')).to.be(positions.endRow);
        expect(vim.get('col')).to.be(positions.endCol);
    });

});
