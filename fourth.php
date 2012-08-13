<?php require("header-global.php"); ?>
<pre class="lineno">  1</pre><pre class="inputline">Think of Normal mode as a giant sheet of perfectly transparent ice that has</pre>
<pre class="lineno">  2</pre><pre class="inputline">frozen over top of all the words in your document. You skate gracefully over</pre>
<pre class="lineno">  3</pre><pre class="inputline">this ice with "hjkl" movements.  Whenever you need to type something just triple</pre>
<pre class="lineno">  4</pre><pre class="inputline">toe loop over to where you want using the "hjkl" keys, then press "i" and begin</pre>
<pre class="lineno">  5</pre><pre class="inputline">furiously typing away.  When you're done, hit [ESC], and you'll surface from the</pre>
<pre class="lineno">  6</pre><pre class="inputline">depths of your deep blue document which will immediately freeze over again so</pre>
<pre class="lineno">  7</pre><pre class="inputline">you can use your favorite keys, "hjkl".</pre>
<pre class="lineno">  8</pre><pre class="inputline"> </pre>
<pre class="lineno">  9</pre><pre class="inputline">Let's review:</pre>
<pre class="lineno"> 10</pre><pre class="inputline"> </pre>
<pre class="lineno"> 11</pre><pre class="inputline">1) To get into your document you type (from the command line) "vim FILENAME".</pre>
<pre class="lineno"> 12</pre><pre class="inputline">   Since this is all in the browser, we haven't actually had to do that,</pre>
<pre class="lineno"> 13</pre><pre class="inputline">   which is why I want to mention it here.</pre>
<pre class="lineno"> 14</pre><pre class="inputline"> </pre>
<pre class="lineno"> 15</pre><pre class="inputline">2) To move the cursor up and down it's "j" like a hook sinking down and "k" like</pre>
<pre class="lineno"> 16</pre><pre class="inputline">   K2, pointing up.  To move left and right it's the two keys to the left and</pre>
<pre class="lineno"> 17</pre><pre class="inputline">   right of "jk", these are "h" and "l".</pre>
<pre class="lineno"> 18</pre><pre class="inputline"> </pre>
<pre class="lineno"> 19</pre><pre class="inputline">   (there's more text below this; 60 lines in total -- hold "j" to scroll down)</pre>
<pre class="lineno"> 20</pre><pre class="inputline"> </pre>
<pre class="lineno"> 21</pre><pre class="inputline">3) To get back into Normal mode, where everything is frozen and you just skate</pre>
<pre class="lineno"> 22</pre><pre class="inputline">   on top of it, hit [ESC].  If you're already in Normal mode hitting [ESC]</pre>
<pre class="lineno"> 23</pre><pre class="inputline">   won't hurt you, you'll just stay in that mode.</pre>
<pre class="lineno"> 24</pre><pre class="inputline"> </pre>
<pre class="lineno"> 25</pre><pre class="inputline">4) Getting out of Vim was covered briefly at the start, but it really deserves</pre>
<pre class="lineno"> 26</pre><pre class="inputline">   more discussion.  There's another mode we haven't covered yet, and that's</pre>
<pre class="lineno"> 27</pre><pre class="inputline">   "Execute" mode.  You can get to Execute mode from Normal mode by typing</pre>
<pre class="lineno"> 28</pre><pre class="inputline">   ":" -- a colon.  The cursor will move to the bottom of the screen.  Now</pre>
<pre class="lineno"> 29</pre><pre class="inputline">   you can type a command.  In most programs Ctrl+S is the shortcut for "save".</pre>
<pre class="lineno"> 30</pre><pre class="inputline">   In Vim it's ":w".  To quit, type ":q".  If you're trying to quit and haven't</pre>
<pre class="lineno"> 31</pre><pre class="inputline">   saved a modified file, Vim won't let you just leave without being more</pre>
<pre class="lineno"> 32</pre><pre class="inputline">   explicit.  Here you have two options:</pre>
<pre class="lineno"> 33</pre><pre class="inputline"> </pre>
<pre class="lineno"> 34</pre><pre class="inputline">     ":wq"  This says, "write and quit."</pre>
<pre class="lineno"> 35</pre><pre class="inputline">     ":q!"  This says, "Just quit, I don't want to save!"</pre>
<pre class="lineno"> 36</pre><pre class="inputline"> </pre>
<pre class="lineno"> 37</pre><pre class="inputline">   There are many other things you could type after the colon, but these</pre>
<pre class="lineno"> 38</pre><pre class="inputline">   two, ":wq" and ":q!" are the two you'll use 99% time.  The other one</pre>
<pre class="lineno"> 39</pre><pre class="inputline">   you've been using is ":o" which stands for "open" if you haven't figured</pre>
<pre class="lineno"> 40</pre><pre class="inputline">   that out. If you're feeling adventurous try ":colorscheme hicon.</pre>
<pre class="lineno"> 41</pre><pre class="inputline"> </pre>
<pre class="lineno"> 42</pre><pre class="inputline">A new finite state machine is in order:</pre>
<pre class="lineno"> 43</pre><pre class="inputline"> </pre>
<pre class="lineno"> 44</pre><pre class="inputline">        +--------+   "i"    +--------+</pre>
<pre class="lineno"> 45</pre><pre class="inputline">        |        |--------> |        |</pre>
<pre class="lineno"> 46</pre><pre class="inputline">        | Normal |          | Insert |</pre>
<pre class="lineno"> 47</pre><pre class="inputline">        |        | <--------|        |</pre>
<pre class="lineno"> 48</pre><pre class="inputline">        +--------+   [ESC]  +--------+</pre>
<pre class="lineno"> 49</pre><pre class="inputline">          |    ^</pre>
<pre class="lineno"> 50</pre><pre class="inputline">          |    |</pre>
<pre class="lineno"> 51</pre><pre class="inputline">      ":" |    | [ESC]   You can remember Execute mode because the two dots</pre>
<pre class="lineno"> 52</pre><pre class="inputline">          |    |         of the colon kind of look like the two sides of the</pre>
<pre class="lineno"> 53</pre><pre class="inputline">          V    |         coin that Twoface (from Batman?) always flips when</pre>
<pre class="lineno"> 54</pre><pre class="inputline">       +---------+       deciding whether or not to kill (i.e., execute)</pre>
<pre class="lineno"> 55</pre><pre class="inputline">       |         |       someone.  Macabre, I know, but now you'll remember.</pre>
<pre class="lineno"> 56</pre><pre class="inputline">       | Execute |</pre>
<pre class="lineno"> 57</pre><pre class="inputline">       |         |       Type ":o fifth.html" when you think you've had your</pre>
<pre class="lineno"> 58</pre><pre class="inputline">       +---------+       fill of this crazy-awesome ASCII art.</pre>
<pre class="lineno"> 59</pre><pre class="inputline"> </pre>
<pre class="lineno"> 60</pre><pre class="inputline"> </pre>
<?php require("footer-global.php"); ?>
