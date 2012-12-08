<?php

global $browser;
require("header.php");
if ($browser != "mobile") { ?>
<script type="text/javascript" src="/js/shCore.js"></script>
<script type="text/javascript" src="/js/shBrushJScript.js"></script>
<script type="text/javascript" src="/js/shBrushXml.js"></script>
<script type="text/javascript" src="/js/shBrushPlain.js"></script>
<script type="text/javascript">
$(document).ready(function() {
    SyntaxHighlighter.all();
});
</script>
<?php } ?>

<div id="narrow">

<h2 class="farleft">ApplicationView</h2>
<p>ApplicationView is an extension of Backbone.View. Since Backbone views
can only listen to events which occur inside their <code>el</code> selector,
I had to create a view which could listen to all keyboard input events. The
ApplicationView has <code>body</code> as its <code>el</code> property, which
lets it listen to all keyboard events. This view contains the logic to
figure out which key was pressed and handle some of the special cases for
different browsers. It ultimately calls
<code>EditorView.keyHandler(key)</code> where <code>key</code> is either a
string like 'a', 's', 'd', 'f', or 'BACKSPACE', 'DELETE', 'ESC', etc.

<pre>
ApplicationView
    el : 'body',

    events : {
        keydown : Function,
        keypress : Function,
    },

    initialize : Function // Sets up the this.editorView reference.
</pre>


<h2 class="farleft">EditorView</h2>
<p>EditorView is an extension of Backbone.View. This view controls the 
<code>#vimwindow</code> element. It has a function
<code>keyHandler(key)</code> which simply passes input along to
<code>Vim.keyHandler</code>. When a Vim model's state changes this view
reacts by updating HTML on the page accordingly.</p>

<pre>
EditorView
    el : '#vimwindow',
    buffer : '#buffer',
    statusBar : '#statusbar',
    row : '#row',
    col : '#col',

    initialize : Function,

    keyHandler : Function, // Passes input along to Vim.keyHandler()

    updateCursor : Function, // Fired when model's row or col changes
    updateRowAndColCounters : Function, // Fired when model's row or col changes
    renderStatusBar : Function, // Fired when model's mode changes
    renderBuffer : Function, // Fired when model's buffer changes

    convertEmptyToSpace : Function, // Helper
    addCursorTags : Function, // Helper
    removeCursorTags : Function // Helper





</pre>

</div> <!-- end #narrow -->

<?php require("footer.php"); ?>
