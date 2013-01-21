var KeyboardOperations = {

    logger : new Logger({
        modules : 'insert|execute', // Triggers for insert or execute.
        prefix : 'KEYBOARD OPS'
    }),

    /**
     * Apply a control character. Controls include 'BACKSPACE'
     * and 'DELETE'. Expected properties of args:
     *
     *  line : String
     *  control : String, the control character name
     *  cursorPosition : Number, index of cursor
     *
     *  @return The updated line after applying control
     */
    applyControlCharacter : function(args) {

        this.logger.info('Called applyControlCharacter with args', args);
        var line = args.line;
        this.logger.debug('Result before "' + args.control + '":', line);
        switch(args.control) {
            case Helpers.controlCharacters.BACKSPACE:
                line = line.substring(0, args.cursorPosition - 1)
                    + line.substring(args.cursorPosition);
                break;
            case Helpers.controlCharacters.DELETE:
                line = line.substring(0, args.cursorPosition)
                    + line.substring(args.cursorPosition + 1);
                break;
            default:
                logger.warn('Unknown control character "' + args.control + '"; doing nothing');
        }
        this.logger.debug('Result after  "' + args.control + '":', line);
        return line;
    }
};
