class window.WordTokenizer

    LOG = new Logger(
        module: 'tokenizer'
        prefix: 'WORD TOKENIZER'
    )

    getSmallWordTokenType = (ch) ->
        regexps = Helpers.smallWordTokenRegexps
        types = Helpers.smallWordTokenTypes
        if regexps.SPECIAL.test(ch)
            return types.SPECIAL
        else if regexps.ALPHA_NUM.test(ch)
            return types.ALPHA_NUM
        else if regexps.EMPTY_LINE.test(ch)
            return types.EMPTY_LINE
        else if regexps.WHITESPACE.test(ch)
            return types.WHITESPACE
        else
            LOG.warn 'Unknown character type for "' + ch + '"; doing nothing'

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

    getSmallWordToken : (startRow, startCol, direction) ->
        @startRow ?= startRow
        @startCol ?= startCol
        LOG.debug(sprintf('Executing getSmallWordToken with start row = %s, start col = %s (%s)', @startRow, @startCol, direction))
        lines = @vim.get('buffer').get('lines')
        row = @startRow
        col = @startCol
        state = 'START'
        text = ""
        finishedParsing = false
        states = Helpers.smallWordTokenTypes

        while not finishedParsing
            ch = lines[row].charAt(col)
            type = getSmallWordTokenType(ch)
            switch state
                when 'START'
                    text += ch
                    state = getSmallWordTokenType(ch)
                when states.ALPHA_NUM
                    if type is states.ALPHA_NUM
                        text += ch
                    else if type is states.SPECIAL
                        finishedParsing = true
                    else if type is states.EMPTY_LINE
                        finishedParsing = true
                when states.SPECIAL
                    if type is states.ALPHA_NUM
                        finishedParsing = true
                    else if type is states.SPECIAL
                        text += ch
                    else if type is states.EMPTY_LINE
                        finishedParsing = true
                when states.EMPTY_LINE
                    # LEFT OFF HERE
                else
                    LOG.warn 'Unknown state ' + state + '; exiting early'
                    finishedParsing = true

        if direction is 'forward'
            substring = line.substring(@startCol)
            result = wordRegExp.exec(substring)
            col = @startCol + result.index
            @startCol = @startCol + wordRegExp.lastIndex
            LOG.debug sprintf('Matched "%s"; setting new start col = %s', result[0], @startCol)

            type: 'hi' # if /\w+/.test(result[0]) then 'word' else 'special'
            value: result[0]
            position:
                row: @startRow
                col: col
        else
            substring = line.substring 0, @startCol
            substring = substring.split("").reverse().join("");

    getBigWordToken : (startRow, startCol) ->
        return new BigWordToken(
            type: 'WORD'
            word: 'blah!@#'
            position:
                row: 0
                col: 0
        )
