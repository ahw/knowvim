/**
 * The CMDLINE mode parser. Important public functions of this module
 * include:
 *
 *  parseCmdlineCommand() : Called when the CmdlineHandler receives a
 *      newline character, signaling the end of input in CMDLINE mode.
 */
var CmdlineParser = function(options) {

    this.executeHandler = options.executeHandler;
    var logger = new Logger({
        module : 'parser|execute',
        prefix : 'EXEC PARSER'
    });

    // A map of command names and their aliases to canonical command names.
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
    this.parseCmdlineCommand = function(commandString) {
        var command = {}; // Encapsulates an CMDLINE command.
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
                logger.debug('Matched command argument (may be null):', command.arg);
                break;

            case Helpers.executeCommands.QUIT:
                command.arg = null;
                break;
        }

        command.name = canonicalName;
        return command;
    };

};
