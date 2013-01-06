$(document).ready(function() {

    vim = new Vim();
    editor = new EditorView({model : vim});
    app = new ApplicationView({editorView : editor});
    vim.openBuffer('python.py', function() {
        var macroString = Macros.getQueryStringMacro();
        if (typeof macroString == 'string') {
            Macros.runMacroString({
                vim : vim,
                macroString : macroString
            });
        }
    });

});
