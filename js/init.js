$(document).ready(function() {

    vim = new Vim();
    editor = new EditorView({model : vim});
    app = new ApplicationView({editorView : editor});
    vim.openBuffer('python.py', function() {
        var macroString = Macros.getQueryStringMacro();
        Macros.runMacroString({
            vim : vim,
            macroString : macroString
        });
    });

});
