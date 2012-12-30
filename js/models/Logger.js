/**
 * A home-brewed Logger class. There are probably others out there, but this
 * will do what I want for now. If the URL query string has ?log=module_name
 * then this class logs all messages from "module". Otherwise, call to
 * this logger return nothing.
 */
var Logger = function(args) {

    this.module = args.module;
    this.prefix = args.prefix + ': ';

    this.isEnabled = function() {
        var re = new RegExp("\\?log=[a-zA-Z0-9;]*(" + this.module + "|all)");
        return re.test(window.location.search);
    };

    this.meetsThreshold = function(inputLevel) {
        var thresholdLevel = this.getLevel();
        return this.levels[inputLevel] >= this.levels[thresholdLevel];
    };

    this.getLevel = function() {
        var matches = window.location.search.match(/level=(debug|info|warn|error)/);
        if (matches) {
            return matches[1];
        } else {
            return 'debug';
        }
    };

    this.levels = {
        debug : 0,
        info : 1,
        warn : 2,
        error : 3
    };

    this.log = function(msg, obj) {
        if (!this.isEnabled() || !this.meetsThreshold('info'))
            return;

        if (obj)
            console.log(this.prefix + msg, obj);
        else
            console.log(this.prefix + msg);
    };

    this.warn = function(msg, obj) {
        if (!this.isEnabled() || !this.meetsThreshold('warn'))
            return;

        if (obj)
            console.warn(this.prefix + msg, obj);
        else
            console.warn(this.prefix + msg);
    };

};
