<?php require('header.php'); ?>
<link rel="stylesheet" type="text/css" href="/css/mocha.css"/>

<h1 style="text-align:left"><a href="/test.php">knowvim tests</a></h1>
<div id="mocha">
(Using <a style="text-decoration:underline"
href="http://visionmedia.github.com/mocha/#browser-support">Mocha</a> in the
browser)
</div>

<script src="/js/build-tst/helpers.js"></script>
<script src="/js/build-tst/lib/expect.js"></script>
<script src="/js/build-tst/lib/mocha.js"></script>
<script>mocha.setup('bdd')</script>

<!-- Tests go here -->
<script src="/js/build-tst/initialization.js"></script>
<script src="/js/build-tst/motions/happy-path.js"></script>
<script src="/js/build-tst/motions/happy-path-with-counts.js"></script>
<script src="/js/build-tst/motions/boundary-conditions.js"></script>
<script src="/js/build-tst/motions/with-empty-buffer.js"></script>
<script src="/js/build-tst/operators/delete.js"></script>
<script src="/js/build-tst/operators/delete-boundary-conditions.js"></script>
<script src="/js/build-tst/operators/delete-with-empty-buffer.js"></script>
<script src="/js/build-tst/modes.js"></script>

<!-- Run the tests using Mocha -->
<script>mocha.run(function () {
    // Some test cleanup
    $('.test.fail h2').click(function () {
        $(this).siblings('.error').show();
    });

    var numFailures = $('.failures').children('em').html();
    if (numFailures > 0) {
        $('.failures').css({
            'color' : '#c00',
            'background-color' : '#faa'
        });
    }
});</script>

<?php require('footer.php'); ?>
