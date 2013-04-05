# The SmallWordToken class. From :help word:
#
# A word consists of a sequence of letters, digits and underscores, or a
# sequence of other non-blank characters, separated with white space
# (spaces, tabs, <EOL>).
class SmallWordToken

    constructor: (args) ->
        @type = args.type # ALPHA_NUM, SPECIAL, EMPTY_LINE
        @value = args.value # The actual chunk of text
        @position = args.position # The row and col starting position of the chunk
