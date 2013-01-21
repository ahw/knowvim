/**
 * The EXECUTE mode parser. Important public functions of this module
 * include:
 *
 *  receiveKey(key) : Called every time a new letter is typed into the
 *      status bar area of Vim. This function is NOT called with the initial
 *      colon which triggers entrance into EXECUTE mode. Nor is this
 *      function called with the final newline which signals the end of a
 *      command. For example, :wq<ENTER> will call receiveKey for "w" and
 *      "q" only.
 *
 *  parseExecuteCommand() : Called when the ExecuteHandler receives a
 *      newline character, signaling the end of input in EXECUTE mode.
 */
var ExecuteParser = function(options) {

    var logger = new Logger({
        module : 'parser',
        prefix : 'EXECUTE PARSER'
    });

    var colorschemeRegex = /^colorscheme ([\w]+)/;
    var openRegex = /^o ([\w\.]+)$/;
    var writeRegex = /^w ?([\w\.]+)$/;
    var commandString = "";
    this.executeHandler = options.executeHandler;

    /**
     * Function called after user presses ENTER on the vim command line.
     * E.g., :wq<ENTER>.
     */
    this.parseExecuteCommand = function() {
        var command = {};
        command.commandString = commandString;

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

    /**
     * Function called each time a new character is typed into the status
     * bar. Unlike NormalParser, this function does not try to parse the
     * command on the fly. Instead it waits until parseExecuteCommand is
     * called and parses the string statically. Note that this command will
     * never get called with the initial colon ":" that triggers entrance
     * into EXECUTE mode.
     */
    this.receiveKey = function(key) {
        logger.log('Received key ' + key);
        commandString += key;
    };

};
