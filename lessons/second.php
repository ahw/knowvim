<?php require("header-global.php"); ?>
<pre class="num">  1</pre><pre class="line">The reason why the letters you type sometimes cause strange things to happen and</pre>
<pre class="num">  2</pre><pre class="line">sometimes insert text as you would expect is because Vim is a "modal editor,"</pre>
<pre class="num">  3</pre><pre class="line">meaning the keys you press will cause different things to happen depending on</pre>
<pre class="num">  4</pre><pre class="line">the "mode" Vim is in.</pre>
<pre class="num">  5</pre><pre class="line"> </pre>
<pre class="num">  6</pre><pre class="line">For now, let's talk about two modes: Normal and Insert.  When you press "i" you</pre>
<pre class="num">  7</pre><pre class="line">enter "INSERT" mode.  This allows you to type stuff.  Hitting [ESC] causes you</pre>
<pre class="num">  8</pre><pre class="line">to leave Insert mode and enter Normal mode.  Nothing appears in the bottom  bar</pre>
<pre class="num">  9</pre><pre class="line">of the screen in Normal mode because there isn't any need; it's the default</pre>
<pre class="num"> 10</pre><pre class="line">mode, the most common mode, the mode you want to see after a long day at the</pre>
<pre class="num"> 11</pre><pre class="line">office, the mode of your dreams, the mode you desire.  A brief finite state</pre>
<pre class="num"> 12</pre><pre class="line">machine, because I'm a computer scientist and I love these things:</pre>
<pre class="num"> 13</pre><pre class="line"> </pre>
<pre class="num"> 14</pre><pre class="line">        +--------+   "i"    +--------+   See? It's real simple, just switchin'</pre>
<pre class="num"> 15</pre><pre class="line">        |        |--------> |        |   back 'n' forth between modes in a</pre>
<pre class="num"> 16</pre><pre class="line">        | Normal |          | Insert |   modal editor.</pre>
<pre class="num"> 17</pre><pre class="line">        |        | <--------|        |</pre>
<pre class="num"> 18</pre><pre class="line">        +--------+   [ESC]  +--------+   Type ":o third.html" and hit ENTER.</pre>
<pre class="num"> 19</pre><pre class="line"> </pre>
<pre class="num"> 20</pre><pre class="line"> </pre>
<?php require("footer-global.php"); ?>
