/**
 * @class Buffer
 * @extends Backbone.Model
 */
var Buffer = Backbone.Model.extend({

    defaults : {
        name : 'new.txt',
        lines : [],
        mimetype : 'text'
    },

    /**
     * @method initialize The Buffer constructor.
     */
    initialize: function(options) {
        
        var model = this;

        if (options && options.name) {
            model.set({name : options.name});
        }

        model.on('change:name', function() {
            model.fetch();
        });

        model.fetch();
    },

    /**
     * @method open An alias for the <code>fetch</code> function. Named to
     * more closely align with the notion of 'opening' a buffer in real Vim.
     */
    open : function() {
        this.fetch();
    },

    /**
     * @method fetch Retrieves the file located in the server's
     * <code>files</code> directory, with name <code>this.name</code>. This
     * overrides the default Backbone <code>fetch</code> function.
     */
    fetch : function() {
        var model = this;
        $.ajax({
            url : '/files/' + this.get('name'),
            success : function(response) {
                model.set({lines : response.split('\n')});
            }
        });
    }
});
