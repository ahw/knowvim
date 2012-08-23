<?php

$browser = "";
$iphone = strpos($_SERVER['HTTP_USER_AGENT'], "iPhone");
$ipad = strpos($_SERVER['HTTP_USER_AGENT'], "iPad");
$android = strpos($_SERVER['HTTP_USER_AGENT'], "Android");
if ($iphone || $ipad || $android) {
    // Assert: the browser is on an iPhone or something like it.
    $browser = "mobile";
}

$path_parts = explode("/", $_SERVER['PATH_INFO']);

$root = false;
if ($path_parts[0] == "" && $path_parts[1] == "") {
    $root = true;
}
require("header.php");
?>


<?php
if ($browser == 'mobile' && $root) {
    // Assert: mobile browser, requesting root page.
} else if ($browser == "mobile") {
    // Assert: mobile browser, but not requesting root.
} else if ($browser != "mobile" && $root) {
    // Assert: non-mobile browser requesting root.
    require('knowvim.php');
} else {
    // Assert: non-mobile browser, but not requesting root.
    $page = $path_parts[1];
    if (file_exists("$page")) {
        require("$page");
    } else {
        require('notfound.php');
    }
}


require("footer.php");
?>
