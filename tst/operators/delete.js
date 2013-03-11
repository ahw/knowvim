describe('Deletions (happy path)', function() {
    var LOG = TestHelpers.LOG;

    var vim;

    before(function() {
        vim = new Vim();
    });

    beforeEach(function() {
        vim.reset();
    });

    it('dd', function() {
        LOG.reportTest(this.test.title);
        var lines = ['abc', 'bar', 'ghi'];
        var deletedRowIndex = 1; // We'll delete row 1
        var linesAfter = lines.slice(); // Copy the original line array
        linesAfter.splice(deletedRowIndex, 1); // Remove the row we'll delete

        vim.get('buffer').set({
            lines : lines
        });
        vim.set({row : deletedRowIndex, col : 1});
        vim.receiveKey('d');
        vim.receiveKey('d');
        expect(vim.get('row')).to.be(deletedRowIndex);
        expect(vim.get('col')).to.be(0);

        // The unnamed register should be set
        expect(vim.get('registers')['"']['type']).to.be('linewise');
        expect(vim.get('registers')['"']['text'].length).to.be(1);
        expect(vim.get('registers')['"']['text'][0]).to.be('bar');

        // The 1 register should be set for deletes
        expect(vim.get('registers')['1']['type']).to.be('linewise');
        expect(vim.get('registers')['1']['text'].length).to.be(1);
        expect(vim.get('registers')['1']['text'][0]).to.be('bar');

        // The small delete register should not be set for this delete
        expect(vim.get('registers')['-']).to.be(undefined);
    });

    it('dl', function() {
        LOG.reportTest(this.test.title);
        var row = 1;
        var col = 1;
        var lines = ['abc', 'def', 'ghi'];
        var linesAfter = ['abc', 'df', 'ghi'];

        vim.get('buffer').set({
            lines : lines
        });

        vim.set({row : row, col : col});
        vim.receiveKey('d');
        vim.receiveKey('l');
        expect(vim.get('row')).to.be(row);
        expect(vim.get('col')).to.be(col);

        // The unnamed register should be set
        expect(vim.get('registers')['"']['type']).to.be('characterwise');
        expect(vim.get('registers')['"']['text'].length).to.be(1);
        expect(vim.get('registers')['"']['text'][0]).to.be('e');

        // The small delete register should be set
        expect(vim.get('registers')['-']['type']).to.be('characterwise');
        expect(vim.get('registers')['-']['text'].length).to.be(1);
        expect(vim.get('registers')['-']['text'][0]).to.be('e');

        // The 1 register should not be set.
        expect(vim.get('registers')['1']).to.be(undefined);
    });

    it('dh', function() {
        LOG.reportTest(this.test.title);
        var row = 1;
        var col = 1;
        var lines = ['abc', 'def', 'ghi'];
        var linesAfter = ['abc', 'ef', 'ghi'];

        vim.get('buffer').set({
            lines : lines
        });

        vim.set({row : row, col : col});
        vim.receiveKey('d');
        vim.receiveKey('h');
        expect(vim.get('row')).to.be(row);
        expect(vim.get('col')).to.be(col - 1);

        // The unnamed register should be set
        expect(vim.get('registers')['"']['type']).to.be('characterwise');
        expect(vim.get('registers')['"']['text'].length).to.be(1);
        expect(vim.get('registers')['"']['text'][0]).to.be('d');

        // The small delete register should be set
        expect(vim.get('registers')['-']['type']).to.be('characterwise');
        expect(vim.get('registers')['-']['text'].length).to.be(1);
        expect(vim.get('registers')['-']['text'][0]).to.be('d');

        // The 1 register should not be set.
        expect(vim.get('registers')['1']).to.be(undefined);
    });

    it('dj', function() {
        LOG.reportTest(this.test.title);
        var lines = ['abc', 'def', 'ghi'];
        var linesAfter = ['abc'];

        vim.get('buffer').set({
            lines : lines
        });

        vim.set({row : 1, col : 1});
        vim.receiveKey('d');
        vim.receiveKey('j');
        expect(vim.get('row')).to.be(0);
        expect(vim.get('col')).to.be(0);

        // The unnamed register should be set
        expect(vim.get('registers')['"']['type']).to.be('linewise');
        expect(vim.get('registers')['"']['text'].length).to.be(2);
        expect(vim.get('registers')['"']['text'][0]).to.be('def');
        expect(vim.get('registers')['"']['text'][1]).to.be('ghi');

        // The 1 register should be set.
        expect(vim.get('registers')['1']['type']).to.be('linewise');
        expect(vim.get('registers')['1']['text'].length).to.be(2);
        expect(vim.get('registers')['1']['text'][0]).to.be('def');
        expect(vim.get('registers')['1']['text'][1]).to.be('ghi');

        // The small delete register should not be set
        expect(vim.get('registers')['-']).to.be(undefined);
    });

    it('dk', function() {
        LOG.reportTest(this.test.title);
        var lines = ['abc', 'def', 'ghi'];
        var linesAfter = ['abc'];

        vim.get('buffer').set({
            lines : lines
        });

        vim.set({row : 1, col : 1});
        vim.receiveKey('d');
        vim.receiveKey('k');
        expect(vim.get('row')).to.be(0);
        expect(vim.get('col')).to.be(0);

        // The unnamed register should be set
        expect(vim.get('registers')['"']['type']).to.be('linewise');
        expect(vim.get('registers')['"']['text'].length).to.be(2);
        expect(vim.get('registers')['"']['text'][0]).to.be('abc');
        expect(vim.get('registers')['"']['text'][1]).to.be('def');

        // The 1 register should be set.
        expect(vim.get('registers')['1']['type']).to.be('linewise');
        expect(vim.get('registers')['1']['text'].length).to.be(2);
        expect(vim.get('registers')['1']['text'][0]).to.be('abc');
        expect(vim.get('registers')['1']['text'][1]).to.be('def');

        // The small delete register should not be set
        expect(vim.get('registers')['-']).to.be(undefined);
    });
});
