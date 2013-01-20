/**
 * Simple module for recording keystrokes and appending them to the Vim
 * model's keystrokes attribute. Expected attributes of args:
 *
 *  vim : Reference to the Vim model
 */
var KeystrokeLogger = function(args) {

    this.vim = args.vim;
    this.isEnabled = /keystrokes=(true|1)/i.test(window.location.search);

    this.log = function(key) {
        var keys = vim.get('keystrokes') || "";
        vim.set({
            keystrokes : keys.concat(key)
        });
    }
};
