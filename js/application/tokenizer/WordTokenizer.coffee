class window.WordTokenizer

    LOG = new Logger(
        module: 'tokenizer'
        prefix: 'WORD TOKENIZER'
    )

    constructor : (options) ->
        @startRow = options?.startRow ? 0
        @startCol = options?.startCol ? 0
        @vim = options?.vim ? null

        if not @vim?
            LOG.error 'No reference to Vim model passed to WordTokenizer'

        LOG.info 'Instantiating new WordTokenizer with options:',
            startRow: @startRow
            startCol: @startCol
            vim: @vim

    getSmallWordToken : (startRow, startCol) ->
        @startRow ?= startRow
        @startCol ?= startCol
        LOG.debug('Executing getSmallWordToken with start row = ' + @startRow + ', start col = ' + @startCol)
        line = @vim.get('buffer').get('lines')[@startRow]
        substring = line.substring(@startCol)
        word = substring.match(/\w+/)?[0]
        LOG.debug 'Next word found:', word
        @startCol += word?.length
        # return new SmallWordToken(
        #     type: 'ALPHA_NUM'
        #     word: 'blah'
        #     position:
        #         row: 0
        #         col: 0
        # )

    getBigWordToken : (startRow, startCol) ->
        return new BigWordToken(
            type: 'WORD'
            word: 'blah!@#'
            position:
                row: 0
                col: 0
        )
