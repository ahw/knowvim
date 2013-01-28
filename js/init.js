$(document).ready(function() {

    vim = new Vim();
    editor = new EditorView({model : vim});
    app = new ApplicationView({editorView : editor});
    var matches = window.location.search.match(/file=([^&]+)/);
    var fileName = matches ? matches[1] : 'grammar.txt';
    vim.openBuffer(fileName, function() {
        var macroString = Macros.getQueryStringMacro();
        if (typeof macroString == 'string') {
            Macros.runMacroString({
                vim : vim,
                macroString : macroString
            });
        }
    });

});
