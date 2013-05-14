knowvim
=======

A Vim web demo.  http://knowvim.com aims to provide a friendly introduction
to beginners fresh off their first Google searches on the subject.

Background
----------
Note that http://knowvim.com is running off of a much older version of this
code. That version is pretty hacky and gross. The most recent stuff on
`master` here represents a bunch of work I've done to organize and rework
the code to make it more extensible. For example, I've built a NORMAL mode
tokenizer and parser that I think will do a much better job of treating the
set of NORMAL commands as a language, rather than simply a collection of
discrete movements and operations. So whereas the old version at
http://knowvim.com required additional implementation for every particular
d{motion} or y{motion} I wanted to handle, the most recent code separates
the {motion} logic entirely and makes it easy to add new motions and have
them "just work" with delete and yank operations.

Demo
----
Although it's not in a releasable state yet, you can demo the tip of
`master` on http://dev.knowvim.com. A few cool tricks:

* http://dev.knowvim.com?log=all will emit log messages from all modules.
  If you want individual modules you can specify one or more of the modules
  listed below. To include multiple modules just separate them with a
  semicolon. E.g., `?log=normal` or `?log=normal;parser;tokenizer`. Possible
  modules include:
  * `vim`
  * `view`
  * `motion`
  * `normal`
  * `insert`
  * `operations`
  * `delete`
  * `yank`
  * `put`
  * `execute`
  * `parser`
  * `tokenizer`
* http://dev.knowvim.com?level=warn controls the logging threshold. Possible
  values include
  * `debug` (default)
  * `info`
  * `warn`
  * `error`
* http://dev.knowvim.com?macro=jjkd2l will run whatever arbitrary sequence
  of characters you associate with the `macro` query parameter as if they
  were typed into the editor starting from NORMAL mode.

Tests
-----
I've started writing some unit tests. They run in the browser and are
available at http://dev.knowvim.com/test.php.
