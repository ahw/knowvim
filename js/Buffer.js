/**
 * @class Buffer
 * @extends Backbone.Model
 */
var Buffer = Backbone.DeepModel.extend({

    defaults : {
        name : 'new.txt',
        lines : [],
        mimetype : 'text'
    },

    /**
     * @method initialize The Buffer constructor.
     */
    initialize: function(options) {
        
        console.log("Buffer >>> initialize()");
        var model = this;

        if (options && options.name) {
            model.set({name : options.name});
        }

        model.on('change:name', function() {
            model.fetch();
        });

        console.log("Buffer <<< initialize()");

    },

    /**
     * @method fetch Retrieves the file located in the server's
     * <code>files</code> directory, with name <code>this.name</code>. This
     * overrides the default Backbone <code>fetch</code> function.
     */
    fetch : function(options) {
        console.log("Buffer >>> fetch()");
        var model = this;
        $.ajax({
            url : '/files/' + model.get('name'),
            success : function(response) {
                // Split the text into an array of lines.
                model.set({lines : response.split('\n')});
                // Make the "success" callback.
                options.success();
            }
        });
        console.log("Buffer <<< fetch()");
    }
});
