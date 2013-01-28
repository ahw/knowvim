var Colorizer = {

    color : function(str, colorName) {
        return sprintf('<span style="color:%s">%s</span>', colorName, str);
    }
};
