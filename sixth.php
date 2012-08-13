<?php require("header-global.php"); ?>
<pre class="lineno">  1</pre><pre class="inputline">SEARCH ONLY</pre>
<pre class="lineno">  2</pre><pre class="inputline">-----------</pre>
<pre class="lineno">  3</pre><pre class="inputline">For a simple search just type "/word_i_want_to_find".  The slash will put your</pre>
<pre class="lineno">  4</pre><pre class="inputline">cursor down below, kind of like Execute mode, except it's not.  Hit ENTER and</pre>
<pre class="lineno">  5</pre><pre class="inputline">Vim will put the cursor at the next occurrence of whatever word you were</pre>
<pre class="lineno">  6</pre><pre class="inputline">searching for.  If you were to type "i" from here you'd start Inserting at that</pre>
<pre class="lineno">  7</pre><pre class="inputline">point.  Try typing "/the" then press ENTER.  Cool, huh?</pre>
<pre class="lineno">  8</pre><pre class="inputline"> </pre>
<pre class="lineno">  9</pre><pre class="inputline">If you want to find the next occurrence, just start hitting "n" (for "next") and</pre>
<pre class="lineno"> 10</pre><pre class="inputline">the cursor will jump around to each occurence of the word.  "Search" isn't</pre>
<pre class="lineno"> 11</pre><pre class="inputline">really it's own separate mode in Vim but I'm going to make this finite state</pre>
<pre class="lineno"> 12</pre><pre class="inputline">machine anyway just to provide some idea of what's going on.  You'll figure it</pre>
<pre class="lineno"> 13</pre><pre class="inputline">out soon enough.</pre>
<pre class="lineno"> 14</pre><pre class="inputline"> </pre>
<pre class="lineno"> 15</pre><pre class="inputline">        +--------+   "/"    . . . . . .</pre>
<pre class="lineno"> 16</pre><pre class="inputline">        |        |--------> .         .-----+</pre>
<pre class="lineno"> 17</pre><pre class="inputline">        | Normal |          . Search  .     | "n" Find the next occurence.</pre>
<pre class="lineno"> 18</pre><pre class="inputline">        |        | <--------.         . <---+</pre>
<pre class="lineno"> 19</pre><pre class="inputline">        +--------+   [ESC]  . . . . . .</pre>
<pre class="lineno"> 20</pre><pre class="inputline"> </pre>
<pre class="lineno"> 21</pre><pre class="inputline">              (there are more lines after this, 50 in all)</pre>
<pre class="lineno"> 22</pre><pre class="inputline"> </pre>
<pre class="lineno"> 23</pre><pre class="inputline">SEARCH AND REPLACE</pre>
<pre class="lineno"> 24</pre><pre class="inputline">------------------</pre>
<pre class="lineno"> 25</pre><pre class="inputline">Ah yes, ye olde search-and-replace. This piece of functionality has been around</pre>
<pre class="lineno"> 26</pre><pre class="inputline">ever since people started doing things one way for a really long time only to</pre>
<pre class="lineno"> 27</pre><pre class="inputline">realize they actually wanted to do it differently. Ever done that? Let's not go</pre>
<pre class="lineno"> 28</pre><pre class="inputline">crazy here (there are many variations), I'm just going to give you the command</pre>
<pre class="lineno"> 29</pre><pre class="inputline">that I use 99% of the time and I'm sure you'll take it from there. Here she is:</pre>
<pre class="lineno"> 30</pre><pre class="inputline"> </pre>
<pre class="lineno"> 31</pre><pre class="inputline">              :%s/old_term/new_term/gc     Try :%s/the/TTTHHHEEE/gc</pre>
<pre class="lineno"> 32</pre><pre class="inputline">              ||  |        |        ||</pre>
<pre class="lineno"> 33</pre><pre class="inputline">              ||  |        |        ||</pre>
<pre class="lineno"> 34</pre><pre class="inputline">              ||  what     |        ||</pre>
<pre class="lineno"> 35</pre><pre class="inputline">              ||  you are  |        |+----+</pre>
<pre class="lineno"> 36</pre><pre class="inputline">              ||  looking  |        |     |</pre>
<pre class="lineno"> 37</pre><pre class="inputline">              ||  for     what      |     |</pre>
<pre class="lineno"> 38</pre><pre class="inputline">              ||         you are    | "confirm" means</pre>
<pre class="lineno"> 39</pre><pre class="inputline">         +----+|        replacing   | ask before each replace</pre>
<pre class="lineno"> 40</pre><pre class="inputline">         |     +--+      it with    |</pre>
<pre class="lineno"> 41</pre><pre class="inputline">         |        |             "global"</pre>
<pre class="lineno"> 42</pre><pre class="inputline">         |    "%s" means        means do</pre>
<pre class="lineno"> 43</pre><pre class="inputline">         |    search the        this for</pre>
<pre class="lineno"> 44</pre><pre class="inputline">         |    whole dang    all occurences</pre>
<pre class="lineno"> 45</pre><pre class="inputline">         |     document</pre>
<pre class="lineno"> 46</pre><pre class="inputline">      Execute</pre>
<pre class="lineno"> 47</pre><pre class="inputline">        mode</pre>
<pre class="lineno"> 48</pre><pre class="inputline"> </pre>
<pre class="lineno"> 49</pre><pre class="inputline">That's it! We've covered the basics of Normal, Insert, Execute, Search and</pre>
<pre class="lineno"> 50</pre><pre class="inputline">Search-and-Replace. Other modes real Vim has that have been left out include</pre>
<pre class="lineno"> 51</pre><pre class="inputline">Visual, Visual-Block, and Command-Line, but you'll look those up later,</pre>
<pre class="lineno"> 52</pre><pre class="inputline">right? The only modes I have partially implemented here and not mentioned at</pre>
<pre class="lineno"> 53</pre><pre class="inputline">all are Replace ("R") and Visual-Line ("V").</pre>
<?php require("footer-global.php"); ?>