<?php require("header-global.php"); ?>
<pre class="lineno">  1</pre><pre class="inputline">import random</pre>
<pre class="lineno">  2</pre><pre class="inputline"> </pre>
<pre class="lineno">  3</pre><pre class="inputline">def quick(ls):</pre>
<pre class="lineno">  4</pre><pre class="inputline">    # Base cases: list of length 1 or 0 is already sorted.</pre>
<pre class="lineno">  5</pre><pre class="inputline">    if (len(ls) == 1 or len(ls) == 0):</pre>
<pre class="lineno">  6</pre><pre class="inputline">        return ls</pre>
<pre class="lineno">  7</pre><pre class="inputline"> </pre>
<pre class="lineno">  8</pre><pre class="inputline">    pivot = ls[len(ls) - 1] # last element is pivot</pre>
<pre class="lineno">  9</pre><pre class="inputline">    gt = [x for x in ls[:len(ls)-1] if x > pivot]</pre>
<pre class="lineno"> 10</pre><pre class="inputline">    lt = [x for x in ls[:len(ls)-1] if x <= pivot]</pre>
<pre class="lineno"> 11</pre><pre class="inputline">    return quick(lt) + [pivot] + quick(gt)</pre>
<pre class="lineno"> 12</pre><pre class="inputline"> </pre>
<pre class="lineno"> 13</pre><pre class="inputline"># Create a random list.</pre>
<pre class="lineno"> 14</pre><pre class="inputline">ls = [random.randint(1, 100) for i in range(0, 30)]</pre>
<pre class="lineno"> 15</pre><pre class="inputline">print(ls)</pre>
<pre class="lineno"> 16</pre><pre class="inputline"> </pre>
<pre class="lineno"> 17</pre><pre class="inputline"># Get the (quick)sorted list.</pre>
<pre class="lineno"> 18</pre><pre class="inputline">ls = quick(ls)</pre>
<pre class="lineno"> 19</pre><pre class="inputline">print(ls)</pre>
<?php require("footer-global.php"); ?>
