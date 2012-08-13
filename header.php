<?php

session_start();
$browser = "";
$iphone = strpos($_SERVER['HTTP_USER_AGENT'], "iPhone");
$ipad = strpos($_SERVER['HTTP_USER_AGENT'], "iPad");
$android = strpos($_SERVER['HTTP_USER_AGENT'], "Android");
if ($iphone || $ipad || $android) {
    // Assert: the browser is on an iPhone
    $browser = 'mobile';
}

$terminal_page = strpos($_SERVER['REQUEST_URI'], "terminal");
$root = $_SERVER['REQUEST_URI'];
if ($root == "/") {
    $root = true;
} else {
    $root = false;
}

if (($terminal_page || $root) && $browser == 'mobile') {
    // Assert: the user is requesting terminal.php, which is radically
    // different from m.terminal.php.  We also know the user is on a mobile
    // device, so we'll serve up m.terminal.php and stop. If they are NOT on
    // a mobile device, then this code will get skipped and the page will
    // load as usual.
    $request_uri = "terminal.php";
    require("m.terminal.php");
    exit;
}

$pagename = $_SERVER['SCRIPT_NAME'];
// Strip the leading "/" and the trailing ".php" off.
$pagename = substr($pagename, 1, -4);
$pagetitle = $pagename;
if ($pagename == "terminal") {
    $pagename = "";
} else {
    $pagename = $pagename . " | ";
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">

<head>
<title><?= $pagename ?>know vim</title>
<!--
<link rel="icon" type="image/png" href="/images/favicon.png"/>
-->
<link rel="image_src" href="/images/knowvim-thumbnail.png"/>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<meta name="generator" content=""/>
<meta name="robots" content="index,follow"/>
<meta name="author" content="Andrew W. Hallagan"/>
<meta name="description" content="Try Vim, right in your browser!"/>
<meta name="Description" content="Try Vim, right in your browser!"/>
<meta name="abstract" content="Try Vim, right in your browser!"/>
<meta name="Abstract" content="Try Vim, right in your browser!"/>
<meta name="keywords" content="know, vim, browser, try, learn, vi, linux, unix, terminal, command, andrew, william, hallagan, bucknell, computer, science, engineering, awh"/>

<?php
if ($browser == 'mobile') {
    // Assert: we need the meta viewport tag and the mobile CSS file.
    echo '<meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0"/>';
    echo '<link rel="stylesheet" type="text/css" href="m.knowvim.css"/>';
} else {
    // Assert: it's a regular computer (hopefully), so use the regular CSS.
    echo '<link rel="stylesheet" type="text/css" href="knowvim.css"/>';
}
?>


<link rel="stylesheet" type="text/css" href="shCore.css"/>
<link rel="stylesheet" type="text/css" href="shThemeDefault.css"/>


<script type="text/javascript" src="jquery-1.6.1.js"></script>
<script type="text/javascript" src="jquery-ui-1.8.16.custom.min.js"></script>
<?php if (
    $pagetitle != "about"
    && $pagetitle != "faq"
    && $pagetitle != "contact"
    && $pagetitle != "devnotes") { ?>
<script type="text/javascript" src="knowvim-ui.js"></script>
<script type="text/javascript" src="knowvim.js"></script>
<?php } ?>

<!-- ye olde Google Analytics -->
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-26449993-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
</head>


<body>
