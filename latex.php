<?php require("header.php"); ?>
<pre class="num">  1</pre><pre class="line">\documentclass{article}</pre>
<pre class="num">  2</pre><pre class="line">\usepackage{graphicx}</pre>
<pre class="num">  3</pre><pre class="line">\usepackage{enumerate}</pre>
<pre class="num">  4</pre><pre class="line">\usepackage{hyperref}</pre>
<pre class="num">  5</pre><pre class="line">\newcommand{\EQ}{& = &}</pre>
<pre class="num">  6</pre><pre class="line"> </pre>
<pre class="num">  7</pre><pre class="line">\begin{document}</pre>
<pre class="num">  8</pre><pre class="line"> </pre>
<pre class="num">  9</pre><pre class="line">\begin{enumerate}[(a)]</pre>
<pre class="num"> 10</pre><pre class="line">\item Let $M$ be a Turing machine with two halting states, $y$ and $n$,</pre>
<pre class="num"> 11</pre><pre class="line">that does not decide a language.  Since $y$ and $n$ are the only two</pre>
<pre class="num"> 12</pre><pre class="line">halting states, we know that if $M$ halted for some input $w$ then</pre>
<pre class="num"> 13</pre><pre class="line">it would either be accepting or rejecting $w$.  To ensure that there are</pre>
<pre class="num"> 14</pre><pre class="line">some inputs $w$ in the universe of all possible inputs that \emph{cannot}</pre>
<pre class="num"> 15</pre><pre class="line">be decided by $M$ we must ensure that $M$ does not halt on all inputs.</pre>
<pre class="num"> 16</pre><pre class="line">The simplest way to do this of course it to define $M$ such that it never</pre>
<pre class="num"> 17</pre><pre class="line">halts at all.  $M = (K, \Sigma, \delta, s, H)$ where</pre>
<pre class="num"> 18</pre><pre class="line"> </pre>
<pre class="num"> 19</pre><pre class="line">\begin{eqnarray*}</pre>
<pre class="num"> 20</pre><pre class="line">K \EQ \{q, y, n\} \\</pre>
<pre class="num"> 21</pre><pre class="line">\Sigma \EQ \{\sqcup, \rhd\}\cup\{\text{ an alphabet }\} \\</pre>
<pre class="num"> 22</pre><pre class="line">s \EQ q \\</pre>
<pre class="num"> 23</pre><pre class="line">H \EQ \{y, n\} \\</pre>
<pre class="num"> 24</pre><pre class="line">\delta \EQ \{(q,\alpha), (q,\alpha)\} \\</pre>
<pre class="num"> 25</pre><pre class="line">\end{eqnarray*}</pre>
<pre class="num"> 26</pre><pre class="line"> </pre>
<pre class="num"> 27</pre><pre class="line">\end{enumerate}</pre>
<pre class="num"> 28</pre><pre class="line"> </pre>
<pre class="num"> 29</pre><pre class="line">\end{document}</pre>
<?php require("footer.php"); ?>
