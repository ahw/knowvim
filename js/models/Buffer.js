/**
 * @class Buffer
 * @extends Backbone.Model
 */
var Buffer = Backbone.DeepModel.extend({

    defaults : {
        name : 'new.txt',
        lines : [],
        outOfSyncLineIndices : [],
        raw : null,
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

    },

    /**
     * @method fetch Retrieves the file located in the server's
     * <code>files</code> directory, with name <code>this.name</code>. This
     * overrides the default Backbone <code>fetch</code> function.
     */
    fetch : function(options) {
        var model = this;
        $.ajax({
            url : '/files/' + model.get('name'),
            success : function(response) {
                // Trim of the newline that gets appended.
                response = response.trim();

                model.set({
                    raw : response,
                    lines : response.split('\n')
                });

                // Make the "success" callback.
                options.success();
            }
        });
    },

    /**
     * @method toString Overrides Backbone's toString function.
     */
    toString : function() {
        return lines.join('\n');
    }
});
