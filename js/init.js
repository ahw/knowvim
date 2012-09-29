$(document).ready(function() {

    vim = new Vim();
    editor = new EditorView({model : vim});
    app = new ApplicationView({editorView : editor});
    vim.openBuffer('new.txt');
});
