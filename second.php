<?php require("header-global.php"); ?>
<pre class="lineno">  1</pre><pre class="inputline">The reason why the letters you type sometimes cause strange things to happen and</pre>
<pre class="lineno">  2</pre><pre class="inputline">sometimes insert text as you would expect is because Vim is a "modal editor,"</pre>
<pre class="lineno">  3</pre><pre class="inputline">meaning the keys you press will cause different things to happen depending on</pre>
<pre class="lineno">  4</pre><pre class="inputline">the "mode" Vim is in.</pre>
<pre class="lineno">  5</pre><pre class="inputline"> </pre>
<pre class="lineno">  6</pre><pre class="inputline">For now, let's talk about two modes: Normal and Insert.  When you press "i" you</pre>
<pre class="lineno">  7</pre><pre class="inputline">enter "INSERT" mode.  This allows you to type stuff.  Hitting [ESC] causes you</pre>
<pre class="lineno">  8</pre><pre class="inputline">to leave Insert mode and enter Normal mode.  Nothing appears in the bottom  bar</pre>
<pre class="lineno">  9</pre><pre class="inputline">of the screen in Normal mode because there isn't any need; it's the default</pre>
<pre class="lineno"> 10</pre><pre class="inputline">mode, the most common mode, the mode you want to see after a long day at the</pre>
<pre class="lineno"> 11</pre><pre class="inputline">office, the mode of your dreams, the mode you desire.  A brief finite state</pre>
<pre class="lineno"> 12</pre><pre class="inputline">machine, because I'm a computer scientist and I love these things:</pre>
<pre class="lineno"> 13</pre><pre class="inputline"> </pre>
<pre class="lineno"> 14</pre><pre class="inputline">        +--------+   "i"    +--------+   See? It's real simple, just switchin'</pre>
<pre class="lineno"> 15</pre><pre class="inputline">        |        |--------> |        |   back 'n' forth between modes in a</pre>
<pre class="lineno"> 16</pre><pre class="inputline">        | Normal |          | Insert |   modal editor.</pre>
<pre class="lineno"> 17</pre><pre class="inputline">        |        | <--------|        |</pre>
<pre class="lineno"> 18</pre><pre class="inputline">        +--------+   [ESC]  +--------+   Type ":o third.html" and hit ENTER.</pre>
<pre class="lineno"> 19</pre><pre class="inputline"> </pre>
<pre class="lineno"> 20</pre><pre class="inputline"> </pre>
<?php require("footer-global.php"); ?>