<?php

require("header.php");
require("settings-panel.php");
require("instruction-panel.php");
require("basic-commands-panel.php");
require("advanced-commands-panel.php");

?>

<div id="main" class="mainbox">

<?php

// know vim (beta)
require("knowvim-title.php");

// what explain why start python latex java
require("knowvim-navigation.php");

// The actual window where stuff is typed.
require("vimwindow-header.php");
?>


