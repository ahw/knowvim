<?php require("header-global.php"); ?>
<pre class="num">  1</pre><pre class="line">SEARCH ONLY</pre>
<pre class="num">  2</pre><pre class="line">-----------</pre>
<pre class="num">  3</pre><pre class="line">For a simple search just type "/word_i_want_to_find".  The slash will put your</pre>
<pre class="num">  4</pre><pre class="line">cursor down below, kind of like Execute mode, except it's not.  Hit ENTER and</pre>
<pre class="num">  5</pre><pre class="line">Vim will put the cursor at the next occurrence of whatever word you were</pre>
<pre class="num">  6</pre><pre class="line">searching for.  If you were to type "i" from here you'd start Inserting at that</pre>
<pre class="num">  7</pre><pre class="line">point.  Try typing "/the" then press ENTER.  Cool, huh?</pre>
<pre class="num">  8</pre><pre class="line"> </pre>
<pre class="num">  9</pre><pre class="line">If you want to find the next occurrence, just start hitting "n" (for "next") and</pre>
<pre class="num"> 10</pre><pre class="line">the cursor will jump around to each occurence of the word.  "Search" isn't</pre>
<pre class="num"> 11</pre><pre class="line">really it's own separate mode in Vim but I'm going to make this finite state</pre>
<pre class="num"> 12</pre><pre class="line">machine anyway just to provide some idea of what's going on.  You'll figure it</pre>
<pre class="num"> 13</pre><pre class="line">out soon enough.</pre>
<pre class="num"> 14</pre><pre class="line"> </pre>
<pre class="num"> 15</pre><pre class="line">        +--------+   "/"    . . . . . .</pre>
<pre class="num"> 16</pre><pre class="line">        |        |--------> .         .-----+</pre>
<pre class="num"> 17</pre><pre class="line">        | Normal |          . Search  .     | "n" Find the next occurence.</pre>
<pre class="num"> 18</pre><pre class="line">        |        | <--------.         . <---+</pre>
<pre class="num"> 19</pre><pre class="line">        +--------+   [ESC]  . . . . . .</pre>
<pre class="num"> 20</pre><pre class="line"> </pre>
<pre class="num"> 21</pre><pre class="line">              (there are more lines after this, 50 in all)</pre>
<pre class="num"> 22</pre><pre class="line"> </pre>
<pre class="num"> 23</pre><pre class="line">SEARCH AND REPLACE</pre>
<pre class="num"> 24</pre><pre class="line">------------------</pre>
<pre class="num"> 25</pre><pre class="line">Ah yes, ye olde search-and-replace. This piece of functionality has been around</pre>
<pre class="num"> 26</pre><pre class="line">ever since people started doing things one way for a really long time only to</pre>
<pre class="num"> 27</pre><pre class="line">realize they actually wanted to do it differently. Ever done that? Let's not go</pre>
<pre class="num"> 28</pre><pre class="line">crazy here (there are many variations), I'm just going to give you the command</pre>
<pre class="num"> 29</pre><pre class="line">that I use 99% of the time and I'm sure you'll take it from there. Here she is:</pre>
<pre class="num"> 30</pre><pre class="line"> </pre>
<pre class="num"> 31</pre><pre class="line">              :%s/old_term/new_term/gc     Try :%s/the/TTTHHHEEE/gc</pre>
<pre class="num"> 32</pre><pre class="line">              ||  |        |        ||</pre>
<pre class="num"> 33</pre><pre class="line">              ||  |        |        ||</pre>
<pre class="num"> 34</pre><pre class="line">              ||  what     |        ||</pre>
<pre class="num"> 35</pre><pre class="line">              ||  you are  |        |+----+</pre>
<pre class="num"> 36</pre><pre class="line">              ||  looking  |        |     |</pre>
<pre class="num"> 37</pre><pre class="line">              ||  for     what      |     |</pre>
<pre class="num"> 38</pre><pre class="line">              ||         you are    | "confirm" means</pre>
<pre class="num"> 39</pre><pre class="line">         +----+|        replacing   | ask before each replace</pre>
<pre class="num"> 40</pre><pre class="line">         |     +--+      it with    |</pre>
<pre class="num"> 41</pre><pre class="line">         |        |             "global"</pre>
<pre class="num"> 42</pre><pre class="line">         |    "%s" means        means do</pre>
<pre class="num"> 43</pre><pre class="line">         |    search the        this for</pre>
<pre class="num"> 44</pre><pre class="line">         |    whole dang    all occurences</pre>
<pre class="num"> 45</pre><pre class="line">         |     document</pre>
<pre class="num"> 46</pre><pre class="line">      Execute</pre>
<pre class="num"> 47</pre><pre class="line">        mode</pre>
<pre class="num"> 48</pre><pre class="line"> </pre>
<pre class="num"> 49</pre><pre class="line">That's it! We've covered the basics of Normal, Insert, Execute, Search and</pre>
<pre class="num"> 50</pre><pre class="line">Search-and-Replace. Other modes real Vim has that have been left out include</pre>
<pre class="num"> 51</pre><pre class="line">Visual, Visual-Block, and Command-Line, but you'll look those up later,</pre>
<pre class="num"> 52</pre><pre class="line">right? The only modes I have partially implemented here and not mentioned at</pre>
<pre class="num"> 53</pre><pre class="line">all are Replace ("R") and Visual-Line ("V").</pre>
<?php require("footer-global.php"); ?>
