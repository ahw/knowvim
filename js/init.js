$(document).ready(function() {

    vim = new Vim();
    editor = new EditorView({model : vim});
    vim.openBuffer('students.txt');
});
