<?php require("header-global.php"); ?>
<pre class="num">  1</pre><pre class="line">Think of Normal mode as a giant sheet of perfectly transparent ice that has</pre>
<pre class="num">  2</pre><pre class="line">frozen over top of all the words in your document. You skate gracefully over</pre>
<pre class="num">  3</pre><pre class="line">this ice with "hjkl" movements.  Whenever you need to type something just triple</pre>
<pre class="num">  4</pre><pre class="line">toe loop over to where you want using the "hjkl" keys, then press "i" and begin</pre>
<pre class="num">  5</pre><pre class="line">furiously typing away.  When you're done, hit [ESC], and you'll surface from the</pre>
<pre class="num">  6</pre><pre class="line">depths of your deep blue document which will immediately freeze over again so</pre>
<pre class="num">  7</pre><pre class="line">you can use your favorite keys, "hjkl".</pre>
<pre class="num">  8</pre><pre class="line"> </pre>
<pre class="num">  9</pre><pre class="line">Let's review:</pre>
<pre class="num"> 10</pre><pre class="line"> </pre>
<pre class="num"> 11</pre><pre class="line">1) To get into your document you type (from the command line) "vim FILENAME".</pre>
<pre class="num"> 12</pre><pre class="line">   Since this is all in the browser, we haven't actually had to do that,</pre>
<pre class="num"> 13</pre><pre class="line">   which is why I want to mention it here.</pre>
<pre class="num"> 14</pre><pre class="line"> </pre>
<pre class="num"> 15</pre><pre class="line">2) To move the cursor up and down it's "j" like a hook sinking down and "k" like</pre>
<pre class="num"> 16</pre><pre class="line">   K2, pointing up.  To move left and right it's the two keys to the left and</pre>
<pre class="num"> 17</pre><pre class="line">   right of "jk", these are "h" and "l".</pre>
<pre class="num"> 18</pre><pre class="line"> </pre>
<pre class="num"> 19</pre><pre class="line">   (there's more text below this; 60 lines in total -- hold "j" to scroll down)</pre>
<pre class="num"> 20</pre><pre class="line"> </pre>
<pre class="num"> 21</pre><pre class="line">3) To get back into Normal mode, where everything is frozen and you just skate</pre>
<pre class="num"> 22</pre><pre class="line">   on top of it, hit [ESC].  If you're already in Normal mode hitting [ESC]</pre>
<pre class="num"> 23</pre><pre class="line">   won't hurt you, you'll just stay in that mode.</pre>
<pre class="num"> 24</pre><pre class="line"> </pre>
<pre class="num"> 25</pre><pre class="line">4) Getting out of Vim was covered briefly at the start, but it really deserves</pre>
<pre class="num"> 26</pre><pre class="line">   more discussion.  There's another mode we haven't covered yet, and that's</pre>
<pre class="num"> 27</pre><pre class="line">   "Execute" mode.  You can get to Execute mode from Normal mode by typing</pre>
<pre class="num"> 28</pre><pre class="line">   ":" -- a colon.  The cursor will move to the bottom of the screen.  Now</pre>
<pre class="num"> 29</pre><pre class="line">   you can type a command.  In most programs Ctrl+S is the shortcut for "save".</pre>
<pre class="num"> 30</pre><pre class="line">   In Vim it's ":w".  To quit, type ":q".  If you're trying to quit and haven't</pre>
<pre class="num"> 31</pre><pre class="line">   saved a modified file, Vim won't let you just leave without being more</pre>
<pre class="num"> 32</pre><pre class="line">   explicit.  Here you have two options:</pre>
<pre class="num"> 33</pre><pre class="line"> </pre>
<pre class="num"> 34</pre><pre class="line">     ":wq"  This says, "write and quit."</pre>
<pre class="num"> 35</pre><pre class="line">     ":q!"  This says, "Just quit, I don't want to save!"</pre>
<pre class="num"> 36</pre><pre class="line"> </pre>
<pre class="num"> 37</pre><pre class="line">   There are many other things you could type after the colon, but these</pre>
<pre class="num"> 38</pre><pre class="line">   two, ":wq" and ":q!" are the two you'll use 99% time.  The other one</pre>
<pre class="num"> 39</pre><pre class="line">   you've been using is ":o" which stands for "open" if you haven't figured</pre>
<pre class="num"> 40</pre><pre class="line">   that out. If you're feeling adventurous try ":colorscheme hicon.</pre>
<pre class="num"> 41</pre><pre class="line"> </pre>
<pre class="num"> 42</pre><pre class="line">A new finite state machine is in order:</pre>
<pre class="num"> 43</pre><pre class="line"> </pre>
<pre class="num"> 44</pre><pre class="line">        +--------+   "i"    +--------+</pre>
<pre class="num"> 45</pre><pre class="line">        |        |--------> |        |</pre>
<pre class="num"> 46</pre><pre class="line">        | Normal |          | Insert |</pre>
<pre class="num"> 47</pre><pre class="line">        |        | <--------|        |</pre>
<pre class="num"> 48</pre><pre class="line">        +--------+   [ESC]  +--------+</pre>
<pre class="num"> 49</pre><pre class="line">          |    ^</pre>
<pre class="num"> 50</pre><pre class="line">          |    |</pre>
<pre class="num"> 51</pre><pre class="line">      ":" |    | [ESC]   You can remember Execute mode because the two dots</pre>
<pre class="num"> 52</pre><pre class="line">          |    |         of the colon kind of look like the two sides of the</pre>
<pre class="num"> 53</pre><pre class="line">          V    |         coin that Twoface (from Batman?) always flips when</pre>
<pre class="num"> 54</pre><pre class="line">       +---------+       deciding whether or not to kill (i.e., execute)</pre>
<pre class="num"> 55</pre><pre class="line">       |         |       someone.  Macabre, I know, but now you'll remember.</pre>
<pre class="num"> 56</pre><pre class="line">       | Execute |</pre>
<pre class="num"> 57</pre><pre class="line">       |         |       Type ":o fifth.html" when you think you've had your</pre>
<pre class="num"> 58</pre><pre class="line">       +---------+       fill of this crazy-awesome ASCII art.</pre>
<pre class="num"> 59</pre><pre class="line"> </pre>
<pre class="num"> 60</pre><pre class="line"> </pre>
<?php require("footer-global.php"); ?>
