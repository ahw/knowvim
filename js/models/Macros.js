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
        var macro = window.location.search.match(/macro=([^&]+)/)[1];
        this.logger.log('Found macro string: ' + macro);
        return macro;
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
        macroString.split("").forEach(function(letter) {
            vim.keyHandler(letter);
        });
        this.logger.log('Finished running macro string ' + macroString);
    }

};
