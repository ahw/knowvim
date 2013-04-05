describe 'Deletions with empty buffer', ->

    vim = new Vim()
    
    beforeEach ->
        vim.reset()

    describe 'When buffer is []', ->
        it 'dd when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey 'd'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'dh when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey 'h'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'dj when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey 'j'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'dk when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey 'k'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'dl when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey 'l'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'd0 when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey '0'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'd$ when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey '$'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'dG when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey 'G'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'dw when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey 'w'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'd} when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey '}'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'd{ when buffer is []', ->
            vim.get('buffer').set lines: []
            vim.receiveKey 'd'
            vim.receiveKey '{'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 0

    describe 'When buffer is [""]', ->
        it 'dd when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey 'd'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            # In the case of dd we expect the buffer to become empty
            expect(vim.get('buffer').get('lines').length).to.be 0

        it 'dh when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey 'h'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1

        it 'dj when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey 'j'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1

        it 'dk when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey 'k'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1

        it 'dl when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey 'l'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1

        it 'd0 when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey '0'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1

        it 'd$ when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey '$'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1

        it 'dG when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey 'G'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1

        it 'dw when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey 'w'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1

        it 'd} when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey '}'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1

        it 'd{ when buffer is [""]', ->
            vim.get('buffer').set lines: [""]
            vim.receiveKey 'd'
            vim.receiveKey '{'
            expect(vim.get 'row').to.be 0
            expect(vim.get 'col').to.be 0
            expect(vim.get('buffer').get('lines').length).to.be 1
