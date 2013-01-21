/**
 * The EXECUTE mode parser. Important public functions of this module
 * include:
 *
 *  parseExecuteCommand() : Called when the ExecuteHandler receives a
 *      newline character, signaling the end of input in EXECUTE mode.
 */
var ExecuteParser = function(options) {

    var logger = new Logger({
        module : 'parser|execute',
        prefix : 'EXEC PARSER'
    });

    var colorschemeRegex = /^colorscheme ([\w]+)/;
    var openRegex = /^o ([\w\.]+)$/;
    var writeRegex = /^w ?([\w\.]+)$/;
    this.executeHandler = options.executeHandler;

    /**
     * Function called after user presses ENTER on the vim command line.
     * E.g., :wq<ENTER>.
     */
    this.parseExecuteCommand = function(commandString) {
        var command = {};

        if (colorschemeRegex.test(commandString)) {
            // Color scheme change.
            command.type = Helpers.executeCommands.COLORSCHEME;
            command.value = commandString.match(colorschemeRegex)[1];

        } else if (openRegex.test(commandString)) {
            // Open a new buffer.
            command.type = Helpers.executeCommands.OPEN;
            command.value = commandString.match(openRegex)[1];

        } else if (writeRegex.test(commandString)) {
            // Write current buffer.
            command.type = Helpers.executeCommands.WRITE;
            command.value = commandString.match(writeRegex)[1];

        } else if (commandString == 'q') {
            // Quit from current buffer.

        } else {
            logger.warn('Command string "' + commandString + '" not recognized. Just echoing');
        }

        // Reset the command string.
        commandString = "";
        return command;
    };

};
