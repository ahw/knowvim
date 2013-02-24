/**
 * A home-brewed Logger class. There are probably others out there, but this
 * will do what I want for now. If the URL query string has ?log=module_name
 * then this class logs all messages from "module_name". Otherwise, call to
 * this logger return nothing.
 */
var Logger = function(args) {

    this.module = args.module;
    this.prefix = args.prefix + ':';

    this.isEnabled = function() {
        // Matches log=mod1;mod2;mod3
        var isEnabledRegex = new RegExp("\\?.*log=[^&]*(" + this.module + "|all)");
        // Mathces log=-mod1;-mod2;-mod3
        var isNotEnabledRegex = new RegExp("\\?.*log=[^&]*-" + this.module);
        return (isEnabledRegex.test(window.location.search)
            && !isNotEnabledRegex.test(window.location.search));
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
            return 'debug'; // Default threshold is debug.
        }
    };

    this.levels = {
        debug : 0,
        info : 1,
        warn : 2,
        error : 3
    };

    this.colors = {
        debug : 'color:gray',
        info  : 'color:blue',
        warn  : 'color:black; background:yellow',
        error : 'color:red; text-decoration:underline'
    };

    this.printMessage = function(level, msg, obj) {
        if (!this.isEnabled() || !this.meetsThreshold(level))
            return;

        var augmentedMsg = sprintf('%5s - %s %s', level, this.prefix, msg);
        if (typeof obj != 'undefined')
            console[level]('%c' + augmentedMsg, this.colors[level], obj);
        else
            console[level]('%c' + augmentedMsg, this.colors[level]);
    };

    this.debug = function(msg, obj) {
        this.printMessage('debug', msg, obj);
    };

    this.info = function(msg, obj) {
        this.printMessage('info', msg, obj);
    };

    // Alias info to log.
    this.log = this.info;

    this.warn = function(msg, obj) {
        this.printMessage('warn', msg, obj);
    };

    this.error = function(msg, obj) {
        this.printMessage('error', msg, obj);
    };

};
