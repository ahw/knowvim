var Token = function(options) {

    this.type = null;
    this.value = null;

    if (options && options.type) {
        this.type = options.type;
    }

    if (options && options.value) {
        this.value = options.value;
    }

    this.toString = function() {
        return JSON.stringify(this);
    };

};
