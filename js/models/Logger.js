/**
 * A home-brewed Logger class. There are probably others out there, but this
 * will do what I want for now. If the URL query string has ?log=module_name
 * then this class logs all messages from "module". Otherwise, call to
 * this logger return nothing.
 */
var Logger = function(args) {

    this.module = args.module;
    this.prefix = args.prefix;

    this.isEnabled = function() {
        var re = new RegExp("\\?log=[a-zA-Z0-9;]*" + this.module);
        return re.test(window.location.search);
    };

    this.log = function(msg, obj) {
        if (!this.isEnabled())
            return;

        if (obj)
            console.log(this.prefix + msg, obj);
        else
            console.log(this.prefix + msg);
    };

    this.warn = function(msg, obj) {
        if (!this.isEnabled())
            return;

        if (obj)
            console.warn(this.prefix + msg, obj);
        else
            console.warn(this.prefix + msg);
    };

};
