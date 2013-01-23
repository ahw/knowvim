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

    var canonicalNames = {
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
        command.commandString = commandString;

        // Match the first word chunk in the command string
        var matches = commandString.match(/^(\w+)/);
        var commandName = matches ? matches[1] : null;

        // Check if the command name is a valid one.
        var canonicalName = canonicalNames[commandName];

        switch(canonicalName) {
            case undefined:
                logger.error('Not a supported editor command:', commandString);
                break;

            case null:
                logger.error('Somehow the command entered was null');
                break;

            case Helpers.executeCommands.OPEN:
            case Helpers.executeCommands.WRITE:
            case Helpers.executeCommands.REGISTERS:
            case Helpers.executeCommands.COLORSCHEME:
                // All of these cases have one optional argument
                var matches = commandString.match(/^\w+ ([\w\.]+)/);
                command.arg = matches ? matches[1] : null;
                logger.debug('Matched command argument:', command.arg);
                break;

            case Helpers.executeCommands.QUIT:
                command.arg = null;
                break;
        }

        command.name = canonicalName;
        return command;
    };

};
