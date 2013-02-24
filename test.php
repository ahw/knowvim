<?php require('header.php'); ?>
<link rel="stylesheet" type="text/css" href="/css/mocha.css"/>

<h1 style="text-align:left"><a href="/test.php">knowvim tests</a></h1>
<div id="mocha">
    
</div>

<script src="/js/expect.js"></script>
<script src="/js/mocha.js"></script>
<script>mocha.setup('bdd')</script>

<!-- Tests go here -->
<script src="/tst/tokenizer.js"></script>
<script src="/tst/normalHandler.js"></script>
<script src="/tst/vim.js"></script>

<!-- Run the tests using Mocha -->
<script>mocha.run();</script>

<?php require('footer.php'); ?>
