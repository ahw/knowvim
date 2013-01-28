/**
 * The Vim CMDLINE mode handler.  Expected properties of args:
 *
 *  vim : Reference to the Vim model
 */
var CmdlineHandler = function(args) {
    var logger = new Logger({
        module : 'execute|handler',
        prefix : 'CMDLINE-HANDLER'
    });

    this.vim = args.vim;
    this.parser = new CmdlineParser({ executeHandler : this });
    this.isInShowRegisterMode = false;

    this.done = function() {
        logger.info('Parsing command string: "' + statusBar() + '"');
        // Parse all text on the status bar from the colon onwards.
        // TODO: This feels ugly.
        var executeCommand = this.parser.parseCmdlineCommand(statusBar().substring(1));
        logger.info('Finished parsing execute comamnd:', executeCommand);

        switch(executeCommand.name) {
            case Helpers.executeCommands.OPEN:
                this.vim.openBuffer(executeCommand.arg);
                this.vim.changeMode(Helpers.modeNames.NORMAL);
                break;
            case Helpers.executeCommands.REGISTERS:
                this.vim.showRegisters();
                this.isInShowRegisterMode = true;
                break;
            default:
                logger.error('No implementation for command:', executeCommand.name);
                this.vim.changeMode(Helpers.modeNames.NORMAL);
        }
    };

    // Helper to get the statusBarCol
    var statusBarCol = function() {
        return this.vim.get('statusBarCol');
    };

    // Helper to get the statusBar
    var statusBar = function() {
        return this.vim.get('statusBar');
    };

    this.receiveKey = function(key) {

        // Small hack: if we recently executed a :reg command then Vim
        // should go into a special "mini" mode where the list of register
        // contents is shown and the next input key closes the list and goes
        // back to NORMAL.
        if (this.isInShowRegisterMode) {
            this.vim.set({ console : [] }, {silent : true });
            this.vim.changeMode(Helpers.modeNames.NORMAL);
            this.isInShowRegisterMode = false;
            return;
        }

        switch(key) {
            case 'ESC':
                var mode = Helpers.modeNamesByKey[key];
                logger.log('Setting Vim mode to "' + mode + '" from CMDLINE');
                this.vim.changeMode(mode);
                break;

            case '\n':
                this.done();
                break;

            case Helpers.controlCharacters.BACKSPACE:
                var newStatusBar = KeyboardOperations.applyControlCharacter({
                    line : statusBar(),
                    control : Helpers.controlCharacters.BACKSPACE,
                    cursorPosition : statusBarCol() + 1
                });
                this.vim.set({
                    statusBarCol : statusBarCol() - 1,
                    statusBar : newStatusBar
                });
                if (newStatusBar == "") {
                    logger.info('Removed all characters; changing to NORMAL mode');
                    this.vim.changeMode(Helpers.modeNames.NORMAL);
                }
                break;

            case Helpers.controlCharacters.DELETE:
                logger.debug('Received DELETE');
                logger.warn('No implementation to handle "' + Helpers.controlCharacters.DELETE + '" controls from CMDLINE mode');
                break;

            default:
                this.vim.set({
                    statusBar : statusBar() + key,
                    statusBarCol : statusBarCol() + 1
                });
        }
    };
};
