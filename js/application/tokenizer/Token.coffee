class window.Token

    LOG = new Logger(
        module: 'tokenizer'
        prefix: 'TOKEN'
    )

    constructor : (options) ->
        @type = options?.type
        @value = options?.value
