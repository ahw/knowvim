/**
 * The EXECUTE mode parser. Important public functions of this module
 * include:
 *
 *  parseExecuteCommand() : Called when the ExecuteHandler receives a
 *      newline character, signaling the end of input in EXECUTE mode.
 */
var ExecuteParser = function(options) {

    this.executeHandler = options.executeHandler;
    var logger = new Logger({
        module : 'parser|execute',
        prefix : 'EXEC PARSER'
    });

    var validCommands = {
        q           : Helpers.executeCommands.QUIT,
        quit        : Helpers.executeCommands.QUIT,
        o           : Helpers.executeCommands.OPEN,
        open        : Helpers.executeCommands.OPEN,
        w           : Helpers.executeCommands.WRITE,
        write       : Helpers.executeCommands.WRITE,
        reg         : Helpers.executeCommands.REGISTERS,
        registers   : Helpers.executeCommands.REGISTERS,
        di          : Helpers.executeCommands.REGISTERS,
        dis         : Helpers.executeCommands.REGISTERS,
        display     : Helpers.executeCommands.REGISTERS,
        colo        : Helpers.executeCommands.COLORSCHEME,
        colorscheme : Helpers.executeCommands.COLORSCHEME
    };

    /**
     * Function called after user presses ENTER on the vim command line.
     * E.g., :wq<ENTER>.
     */
    this.parseExecuteCommand = function(commandString) {
        var command = {}; // Encapsulates an EXECUTE command.

        // Match the first word chunk in the command string
        var commandName = commandString.match(/^(\w+)/)[1];

        // Check if the command name is a valid one
        var commandType = validCommands[commandName];

        if (commandType) {
            command.type = commandType;
            // Match space and word chunk following the command name.
            var matches = commandString.match(/^\w+( [\w\.]+)/);
            command.value = matches ? matches[1] : null;
        } else {
            logger.warn('Command string "' + commandString + '" not recognized. Just echoing');
        }

        // Reset the command string.
        commandString = "";
        return command;
    };

};
