#!/usr/bin/python
import sys

f = open(sys.argv[1])
i = 0
sys.stdout.write("<?php require(\"header-global.php\"); ?>\n")
# sys.stdout.write('<script type="text/javascript" src="/js/knowvim-ui.js"></script>');
# sys.stdout.write('<script type="text/javascript" src="/js/knowvim.js"></script>');
for line in f:
    sys.stdout.write(line)
sys.stdout.write("<?php require(\"footer-global.php\"); ?>\n")
