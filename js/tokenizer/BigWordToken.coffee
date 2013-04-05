# The BigWordToken class. From :help WORD:
#
# A WORD consists of a sequence of non-blank characters, separated with
# white space.  An empty line is also considered to be a WORD.
class BigWordToken

    constructor: (args) ->
        @type = args.type # NON_BLANK, EMPTY_LINE
        @value = args.value # The actual chunk of text
        @position = args.position # The row and col starting position of the chunk
