/**
 * A home-brewed Logger class. There are probably others out there, but this
 * will do what I want for now. If the URL query string has ?log=module_name
 * then this class logs all messages from "moduleName". Otherwise, call to
 * this logger return nothing.
 */
var Logger = function(moduleName) {

    this.moduleName = moduleName;

    this.isEnabled = function() {
        var re = new RegExp("\\?log=[a-zA-Z0-9;]*" + this.moduleName);
        return re.test(window.location.search);
    };

    this.log = function(msg, obj) {
        if (!this.isEnabled())
            return;

        if (obj)
            console.log(msg, obj);
        else
            console.log(msg);
    };

    this.warn = function(msg, obj) {
        if (!this.isEnabled())
            return;

        if (obj)
            console.warn(msg, obj);
        else
            console.warn(msg);
    };

};
