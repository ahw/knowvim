describe 'Deletions (boundary conditions)', ->

    LOG = TestHelpers.LOG
    vim = new Vim()

    beforeEach ->
        vim.reset()

    it 'dd on last line', ->
        lines = ['foo', 'bar', 'baz']
        vim.get('buffer').set lines: lines
        vim.set row:2, col:0
        vim.receiveKey 'd'
        vim.receiveKey 'd'

        # Deleting the last line should move the cursor up
        expect(vim.get 'row').to.be 1
        expect(vim.get 'col').to.be 0
        expect(vim.get('buffer').get('lines').length).to.be 2

    it 'dl on last character', ->
        lines = ['foo']
        vim.get('buffer').set lines: lines
        vim.set row:0, col:2
        vim.receiveKey 'd'
        vim.receiveKey 'l'
        expect(vim.get 'row').to.be 0
        expect(vim.get 'col').to.be 1
        expect(vim.get('buffer').get('lines')[0]).to.be 'fo'

    it 'dh on first character', ->
        lines = ['foo']
        vim.get('buffer').set lines: lines
        vim.set row:0, col:0
        vim.receiveKey 'd'
        vim.receiveKey 'h'
        expect(vim.get 'row').to.be 0
        expect(vim.get 'col').to.be 0
        expect(vim.get('buffer').get('lines')[0]).to.be 'foo'

    it 'dk on first line', ->
        lines = ['foo', 'bar', 'baz']
        vim.get('buffer').set lines: lines
        vim.set row:0, col:0
        vim.receiveKey 'd'
        vim.receiveKey 'k'
        expect(vim.get 'row').to.be 0
        expect(vim.get 'col').to.be 0
        expect(vim.get('buffer').get('lines').length).to.be 3
        expect(vim.get('buffer').get('lines')[0]).to.be 'foo'
