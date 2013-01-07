/**
 * The Vim INSERT mode handler. This handler simply inserts all received
 * characters into the Vim model's Buffer. Expected properties of args:
 *
 *  vim : Reference to the Vim model
 */
var InsertHandler = function(args) {

    var logger = new Logger({
        module : 'insert',
        prefix : 'INSERT'
    });

    this.vim = args.vim;

    this.receiveKey = function(key) {

        switch(key) {
            case 'ESC':
                var mode = Helpers.modeNamesByKey[key];
                logger.log('Setting Vim mode to "' + mode + '" from INSERT');
                this.vim.changeMode(mode);
                break;

            default:
                var lines = this.vim.get('buffer').get('lines');
                var rowIndex = this.vim.get('cursorRow');
                var colIndex = this.vim.get('cursorCol');
                var leftChars = lines[rowIndex].substring(0, colIndex);
                var rightChars = lines[rowIndex].substring(colIndex);
                lines[rowIndex] = leftChars + key + rightChars;
                vim.set({
                    col : colIndex + 1
                });
                vim.trigger('change:buffer');
        }
    }
};
