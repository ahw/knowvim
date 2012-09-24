#!/usr/bin/python
import sys

f = open(sys.argv[1])
i = 0
for line in f:
    prepend = '<pre class="num">%3s</pre><pre class="line">' % str(i+1)
    append = '</pre>\n'
    line = line.rstrip()
    if line == "":
        line = " "
    sys.stdout.write(prepend + line + append)
    i = i + 1
