/**
 * The Vim EXECUTE mode handler.  Expected properties of args:
 *
 *  vim : Reference to the Vim model
 */
var ExecuteHandler = function(args) {

    var logger = new Logger({
        module : 'execute',
        prefix : 'EXECUTE'
    });

    this.vim = args.vim;
    this.parser = new ExecuteParser({ executeHandler : this });

    this.done = function() {
        var executeCommand = this.parser.parseExecuteCommand();
        logger.info('Finished parsing execute comamnd:', executeCommand);
        var commands = Helpers.executeCommands;
        switch(executeCommand.type) {
            case commands.OPEN:
                this.vim.openBuffer(executeCommand.value);
                break;
            default:
                logger.warn('No implementation for command type:', executeCommand.type);
        }
        logger.info('Changing to NORMAL mode');
        this.vim.changeMode(Helpers.modeNames.NORMAL);
    };

    this.receiveKey = function(key) {

        switch(key) {
            case 'ESC':
                var mode = Helpers.modeNamesByKey[key];
                logger.log('Setting Vim mode to "' + mode + '" from EXECUTE');
                this.vim.changeMode(mode);
                break;

            case '\n':
                this.done();
                break;

            default:
                this.parser.receiveKey(key);
                var statusBar = this.vim.get('statusBar');
                this.vim.set({
                    statusBar : statusBar + key
                });
        }
    };
};
