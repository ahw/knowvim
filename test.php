<?php require('header.php'); ?>
<link rel="stylesheet" type="text/css" href="/css/mocha.css"/>

<h1 style="text-align:left"><a href="/test.php">knowvim tests</a></h1>
<div id="mocha">
(Using <a style="text-decoration:underline"
href="http://visionmedia.github.com/mocha/#browser-support">Mocha</a> in the
browser)
</div>

<script src="/tst/helpers.js"></script>
<script src="/js/expect.js"></script>
<script src="/js/mocha.js"></script>
<script>mocha.setup('bdd')</script>

<!-- Tests go here -->
<script src="/tst/initialization.js"></script>
<script src="/tst/motions/happy-path.js"></script>
<script src="/tst/motions/happy-path-with-counts.js"></script>
<script src="/tst/motions/boundary-conditions.js"></script>
<script src="/tst/motions/with-empty-buffer.js"></script>
<script src="/tst/modes.js"></script>

<!-- Run the tests using Mocha -->
<script>mocha.run();</script>

<?php require('footer.php'); ?>
