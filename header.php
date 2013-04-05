<!DOCTYPE html>
<html>
    <head>
    <title>know vim</title>
    <link rel="image_src" href="/images/knowvim-thumbnail.png"/>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
    <meta name="generator" content=""/>
    <meta name="author" content="Andrew"/>
    <meta name="description" content="Try Vim, right in your browser!"/>
    <meta name="keywords" content="know, vim, browser, try, learn, vi, andrew, hallagan, bucknell, awh"/>
    <link rel="stylesheet" type="text/css" href="/css/knowvim.css"/>
    <!--
    <link rel="stylesheet" type="text/css" href="/css/mocha.css"/>
    -->

    <link rel="stylesheet" type="text/css" href="/css/shCore.css"/>
    <link rel="stylesheet" type="text/css" href="/css/shThemeDefault.css"/>


    <script type="text/javascript" src="/js/lib/jquery-1.8.3.min.js"></script>
    <script type="text/javascript" src="/js/lib/jquery-ui-1.9.1.custom.min.js"></script>
    <script type="text/javascript" src="/js/lib/underscore.js"></script>
    <script type="text/javascript" src="/js/lib/json2.js"></script>
    <script type="text/javascript" src="/js/lib/backbone.js"></script>
    <script type="text/javascript" src="/js/lib/deep-model.js"></script>
    <script type="text/javascript" src="/js/lib/sprintf.js"></script>

    <!--
    <script type="text/javascript" src="/js/knowvim-ui.js"></script>
    <script type="text/javascript" src="/js/knowvim.js"></script>
    -->
    <script type="text/javascript" src="/js/build/util/Helpers.js"></script>
    <script type="text/javascript" src="/js/build/util/Logger.js"></script>
    <script type="text/javascript" src="/js/build/util/KeystrokeLogger.js"></script>
    <script type="text/javascript" src="/js/build/tokenizer/Token.js"></script>
    <script type="text/javascript" src="/js/build/tokenizer/Tokenizer.js"></script>
    <script type="text/javascript" src="/js/build/parser/NormalParser.js"></script>
    <script type="text/javascript" src="/js/build/parser/CmdlineParser.js"></script>
    <script type="text/javascript" src="/js/build/motion/Motions.js"></script>
    <script type="text/javascript" src="/js/build/motion/WordMotions.js"></script>
    <script type="text/javascript" src="/js/build/motion/ObjectMotions.js"></script>
    <script type="text/javascript" src="/js/build/motion/JumpMotions.js"></script>
    <script type="text/javascript" src="/js/build/util/Positioning.js"></script>
    <script type="text/javascript" src="/js/build/util/KeyboardOperations.js"></script>
    <script type="text/javascript" src="/js/build/operations/YankOperations.js"></script>
    <script type="text/javascript" src="/js/build/operations/DeleteOperations.js"></script>
    <script type="text/javascript" src="/js/build/operations/MarkOperations.js"></script>
    <script type="text/javascript" src="/js/build/operations/PutOperations.js"></script>
    <script type="text/javascript" src="/js/build/util/Macros.js"></script>
    <script type="text/javascript" src="/js/build/util/Colors.js"></script>

    <script type="text/javascript" src="/js/build/models/Buffer.js"></script>
    <script type="text/javascript" src="/js/build/handlers/NormalHandler.js"></script>
    <script type="text/javascript" src="/js/build/handlers/InsertHandler.js"></script>
    <script type="text/javascript" src="/js/build/handlers/CmdlineHandler.js"></script>
    <script type="text/javascript" src="/js/build/models/Vim.js"></script>
    <script type="text/javascript" src="/js/build/views/Application.js"></script>
    <script type="text/javascript" src="/js/build/views/Editor.js"></script>
</head>

<body>

    <div id="rotate-outer">
        <p class="fork-me">
    ......................................................<br/>
    ======================================================<br/>
                  <a href="https://github.com/ahw/knowvim" target="_blank">Fork me on Github</a><br/>
    ......................................................<br/>
    ======================================================<br/>
        </p>
    </div>

    <div id="main" class="mainbox">
    <h1>
    <?php

    if ($_SERVER['SERVER_NAME'] == "dev.knowvim.com") {
        echo '<span style="color:#777;">dev</span>';
    }
    ?>
    <a id="homelink" href="/">know vim</a></span>
    </h1>
    <div id="file_links">
        <a class="source_code_link" id="what" href="/">:o what</a>
        <a class="source_code_link" id="explain" href="/explain.php">:o explain</a>
        <a class="source_code_link" id="why" href="/why.php">:o why</a>
        <a class="source_code_link" id="start" href="/start.php">:o start</a>
        <!-- Is the advanced page necessary?
        <a class="source_code_link" id="advanced" href="#">advanced</a>
        -->
        <a class="source_code_link" id="python" href="/python.php">:o python.py</a>
        <a class="source_code_link" id="latex" href="/latex.php">:o latex.tex</a>
        <a class="source_code_link" id="java" href="/java.php">:o java.java</a>
        <a class="source_code_link" id="test" href="/test.php">tests</a>
    </div>
    <div id="vimwindow">
    <div id="buffer">

