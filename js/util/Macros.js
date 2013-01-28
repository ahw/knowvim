var Macros = {

    logger : new Logger({
        module : 'vim',
        prefix : 'MACRO'
    }),

    /**
     * Returns the macro string provided in the query string, null if not
     * present.
     */
    getQueryStringMacro : function() {
        var matches = window.location.search.match(/macro=([^&]+)/);
        if (matches) {
            var macroString = decodeURIComponent(matches[1]);
            this.logger.log('Found macro string: ' + macroString);
            return macroString;
        } else {
            return null;
        }
    },

    /**
     * Runs a macro string. Expected attributes of args:
     *
     *  macroString : The macro string to run.
     *  vim : Reference to the Vim model
     */
    runMacroString : function(args) {
        var vim = args.vim;
        var macroString = args.macroString;

        this.logger.log('Running macro string ' + macroString);
        // --- var re = /(<.+>|.)/g;
        // --- macroString.match(re).forEach(function(letter) {
        macroString.split("").forEach(function(letter) {
            vim.receiveKey(letter);
        });
        this.logger.log('Finished running macro string ' + macroString);
    }

};
