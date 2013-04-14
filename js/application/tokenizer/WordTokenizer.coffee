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

    getSmallWordToken : (direction, startRow, startCol) ->
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

            LOG.debug 'Inspecting character "' + ch + '" (' + type + ')'
            switch state
                when 'START'
                    text += ch
                    state = getSmallWordTokenType(ch)

                when 'ERROR'
                    LOG.error 'WordTokenizer is in error state; exiting early'
                    finishedParsing = true

                when states.ALPHA_NUM
                    if type is states.ALPHA_NUM
                        text += ch
                    else if type is states.SPECIAL
                        finishedParsing = true
                    else if type is states.EMPTY_LINE
                        finishedParsing = true
                    else if type is states.WHITESPACE
                        finishedParsing = true
                    else
                        LOG.error 'Unknown character type ' + type + ' in state ' + state +'; returning early'
                        state = 'ERROR'

                when states.SPECIAL
                    if type is states.ALPHA_NUM
                        finishedParsing = true
                    else if type is states.SPECIAL
                        text += ch
                    else if type is states.EMPTY_LINE
                        finishedParsing = true
                    else if type is states.WHITESPACE
                        finishedParsing = true
                    else 
                        LOG.error 'Unknown character type ' + type + ' in state ' + state +'; returning early'
                        state = 'ERROR'

                when states.EMPTY_LINE
                    if type is states.ALPHA_NUM
                        finishedParsing = true
                    else if type is states.SPECIAL
                        finishedParsing = true
                    else if type is states.EMPTY_LINE
                        finishedParsing = true
                    else if type is states.WHITESPACE
                        state = states.WHITESPACE
                    else
                        LOG.error 'Unknown character type ' + type + ' in state ' + state +'; returning early'
                        state = 'ERROR'

                when states.WHITESPACE
                    if type is states.ALPHA_NUM
                        text += ch
                        state = states.ALPHA_NUM
                    else if type is states.SPECIAL
                        text += ch
                        state = states.SPECIAL
                    else if type is states.EMPTY_LINE
                        finishedParsing = true
                    else if type is states.WHITESPACE
                        # Do nothing
                    else
                        LOG.error 'Unknown character type ' + type + ' in state ' + state +'; returning early'
                        state = 'ERROR'

                else
                    LOG.warn 'Unknown state ' + state + '; exiting early'
                    finishedParsing = true

            # Update the row and col positions
            if direction is 'forward'
                if col < lines[row].length - 1
                    col += 1
                else if row < lines.length - 1
                    row += 1
                    col = 0
                else
                    finishedParsing = true
                    LOG.warn 'Hit EOF; unsure what will happen next'
            else if direction is 'backward'
                if col > 0
                    col -= 1
                else if row > 0
                    row -= 1
                    col = lines[row].length - 1
                else
                    finishedParsing = true
                    LOG.warn 'Hit SOF; unsure what will happen next'
            else
                LOG.error 'Unknown direction ' + direction

        LOG.info('Found token "' + text + '"')
        @startRow = row
        @startCol = col

    getBigWordToken : (startRow, startCol) ->
        return new BigWordToken(
            type: 'WORD'
            word: 'blah!@#'
            position:
                row: 0
                col: 0
        )
