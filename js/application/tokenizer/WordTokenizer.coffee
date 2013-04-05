class WordTokenizer

    @getSmallWordToken : ->
        return new SmallWordToken(
            type: 'ALPHA_NUM'
            word: 'blah'
            position:
                row: 0
                col: 0
        )

    @getBigWordToken : ->
        return new BigWordToken(
            type: 'WORD'
            word: 'blah!@#'
            position:
                row: 0
                col: 0
        )
