<?php

global $pagename;
global $pagetitle;
global $browser;

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
<meta name="keywords" content="know, vim, browser, try, learn, vi, linux,
unix, terminal, command, andrew, william, hallagan, bucknell, computer,
science, engineering, awh"/>

<?php
if ($browser == 'mobile') {
    // Assert: we need the meta viewport tag and the mobile CSS file.
    echo '<meta name="viewport"
                content="width=device-width, minimum-scale=1.0, maximum-scale=1.0"/>';
    echo '<link rel="stylesheet"
                type="text/css"
                href="/css/m.knowvim.css"/>';
} else {
    // Assert: it's a regular screen (hopefully).
    echo '<link rel="stylesheet"
                type="text/css"
                href="/css/knowvim.css"/>';
}
?>


<link rel="stylesheet" type="text/css" href="/css/shCore.css"/>
<link rel="stylesheet" type="text/css" href="/css/shThemeDefault.css"/>
<script type="text/javascript" src="/js/jquery.js"></script>
<script type="text/javascript" src="/js/jquery-ui.js"></script>

<?php if (
    $pagetitle != "about"
    && $pagetitle != "faq"
    && $pagetitle != "contact"
    && $pagetitle != "devnotes") { ?>
<script type="text/javascript" src="/js/knowvim-ui.js"></script>
<script type="text/javascript" src="/js/knowvim.js"></script>
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
<div id="source_code">
