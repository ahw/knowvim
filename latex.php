<?php require("header-global.php"); ?>
<pre class="lineno">  1</pre><pre class="inputline">\documentclass{article}</pre>
<pre class="lineno">  2</pre><pre class="inputline">\usepackage{graphicx}</pre>
<pre class="lineno">  3</pre><pre class="inputline">\usepackage{enumerate}</pre>
<pre class="lineno">  4</pre><pre class="inputline">\usepackage{hyperref}</pre>
<pre class="lineno">  5</pre><pre class="inputline">\newcommand{\EQ}{& = &}</pre>
<pre class="lineno">  6</pre><pre class="inputline"> </pre>
<pre class="lineno">  7</pre><pre class="inputline">\begin{document}</pre>
<pre class="lineno">  8</pre><pre class="inputline"> </pre>
<pre class="lineno">  9</pre><pre class="inputline">\begin{enumerate}[(a)]</pre>
<pre class="lineno"> 10</pre><pre class="inputline">\item Let $M$ be a Turing machine with two halting states, $y$ and $n$,</pre>
<pre class="lineno"> 11</pre><pre class="inputline">that does not decide a language.  Since $y$ and $n$ are the only two</pre>
<pre class="lineno"> 12</pre><pre class="inputline">halting states, we know that if $M$ halted for some input $w$ then</pre>
<pre class="lineno"> 13</pre><pre class="inputline">it would either be accepting or rejecting $w$.  To ensure that there are</pre>
<pre class="lineno"> 14</pre><pre class="inputline">some inputs $w$ in the universe of all possible inputs that \emph{cannot}</pre>
<pre class="lineno"> 15</pre><pre class="inputline">be decided by $M$ we must ensure that $M$ does not halt on all inputs.</pre>
<pre class="lineno"> 16</pre><pre class="inputline">The simplest way to do this of course it to define $M$ such that it never</pre>
<pre class="lineno"> 17</pre><pre class="inputline">halts at all.  $M = (K, \Sigma, \delta, s, H)$ where</pre>
<pre class="lineno"> 18</pre><pre class="inputline"> </pre>
<pre class="lineno"> 19</pre><pre class="inputline">\begin{eqnarray*}</pre>
<pre class="lineno"> 20</pre><pre class="inputline">K \EQ \{q, y, n\} \\</pre>
<pre class="lineno"> 21</pre><pre class="inputline">\Sigma \EQ \{\sqcup, \rhd\}\cup\{\text{ an alphabet }\} \\</pre>
<pre class="lineno"> 22</pre><pre class="inputline">s \EQ q \\</pre>
<pre class="lineno"> 23</pre><pre class="inputline">H \EQ \{y, n\} \\</pre>
<pre class="lineno"> 24</pre><pre class="inputline">\delta \EQ \{(q,\alpha), (q,\alpha)\} \\</pre>
<pre class="lineno"> 25</pre><pre class="inputline">\end{eqnarray*}</pre>
<pre class="lineno"> 26</pre><pre class="inputline"> </pre>
<pre class="lineno"> 27</pre><pre class="inputline">\end{enumerate}</pre>
<pre class="lineno"> 28</pre><pre class="inputline"> </pre>
<pre class="lineno"> 29</pre><pre class="inputline">\end{document}</pre>
<?php require("footer-global.php"); ?>
