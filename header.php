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
<meta name="keywords" content="know, vim, browser, try, learn, vi, linux, unix, terminal, command, andrew, william, hallagan, bucknell, computer, science, engineering, awh"/>

<?php
if ($browser == 'mobile') {
    // Assert: we need the meta viewport tag and the mobile CSS file.
    echo '<meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0"/>';
    echo '<link rel="stylesheet" type="text/css" href="/css/m.knowvim.css"/>';
} else {
    // Assert: it's a regular computer (hopefully), so use the regular CSS.
    echo '<link rel="stylesheet" type="text/css" href="/css/knowvim.css"/>';
}
?>


<link rel="stylesheet" type="text/css" href="/css/shCore.css"/>
<link rel="stylesheet" type="text/css" href="/css/shThemeDefault.css"/>


<script type="text/javascript" src="/js/lib/jquery.js"></script>
<script type="text/javascript" src="/js/lib/jquery-ui.js"></script>
<script type="text/javascript" src="/js/lib/underscore.js"></script>
<script type="text/javascript" src="/js/lib/json2.js"></script>
<script type="text/javascript" src="/js/lib/backbone.js"></script>
<script type="text/javascript" src="/js/lib/deep-model.js"></script>
<script type="text/javascript" src="/js/lib/sprintf.js"></script>
<?php if (
    $pagetitle != "about"
    && $pagetitle != "faq"
    && $pagetitle != "contact"
    && $pagetitle != "devnotes"
    && $pagetitle != "devnotes2") { ?>
<!--
<script type="text/javascript" src="/js/knowvim-ui.js"></script>
<script type="text/javascript" src="/js/knowvim.js"></script>
-->
<script type="text/javascript" src="/js/models/Token.js"></script>
<script type="text/javascript" src="/js/models/Tokenizer.js"></script>
<script type="text/javascript" src="/js/models/Buffer.js"></script>
<script type="text/javascript" src="/js/models/NormalHandler.js"></script>
<script type="text/javascript" src="/js/models/Vim.js"></script>
<script type="text/javascript" src="/js/views/Application.js"></script>
<script type="text/javascript" src="/js/views/Editor.js"></script>
<script type="text/javascript" src="/js/init.js"></script>
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

<?php
require("settings-panel.php");
require("instruction-panel.php");
require("basic-commands-panel.php");
require("advanced-commands-panel.php");
?>

<div id="main" class="mainbox">
<h1>
<?php

if ($_SERVER['SERVER_NAME'] == "dev.knowvim.com") {
    echo '<span style="color:#c00; font-size:80%">dev .</span>';
}
?>

<a id="homelink" href="/">know vim</a> <span id="beta">(beta)</span>
</h1>
<div id="file_links">
    <a class="source_code_link" id="what" href="/">what</a>
    <a class="source_code_link" id="explain" href="/explain.php">explain</a>
    <a class="source_code_link" id="why" href="/why.php">why</a>
    <a class="source_code_link" id="start" href="/start.php">start</a>
    <!-- Is the advanced page necessary?
    <a class="source_code_link" id="advanced" href="#">advanced</a>
    -->
    <a class="source_code_link" id="python" href="/python.php">python</a>
    <a class="source_code_link" id="latex" href="/latex.php">latex</a>
    <a class="source_code_link" id="java" href="/java.php">java</a>
</div>
<div id="vimwindow">
<div id="buffer">

