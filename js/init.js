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
toastr.options = {
  "closeButton": false,
  "debug": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut",
  "preventDuplicates": true
};
