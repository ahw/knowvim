knowvim
=======

A Vim web demo that used to exist at http://knowvim.com. It's aim was to
provide a friendly introduction to beginners fresh off their first "vim"
Google searches, and I thought maybe it could be worked into some sort of
Chrome extension or integrated into the ACE editor or something. Ultimately,
it was a fun thing that I worked on for a while just because I could, but
something I no longer really make time for.

Demo
----
You can demo the un-minified source at https://ahw.github.io/knowvim. A few
cool tricks:

* https://ahw.github.io/knowvim?log=all will emit log messages from all modules.
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
* https://ahw.github.io/knowvim?level=warn controls the logging threshold. Possible
  values include
  * `debug` (default)
  * `info`
  * `warn`
  * `error`
* https://ahw.github.io/knowvim?macro=jjkd2l will run whatever arbitrary sequence
  of characters you associate with the `macro` query parameter as if they
  were typed into the editor starting from NORMAL mode.

Tests
-----
I've started writing some unit tests. They run in the browser and are
available at https://ahw.github.io/knowvim/test.html.
