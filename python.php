<?php require("header-global.php"); ?>
<pre class="num">  1</pre><pre class="line">import random</pre>
<pre class="num">  2</pre><pre class="line"> </pre>
<pre class="num">  3</pre><pre class="line">def quick(ls):</pre>
<pre class="num">  4</pre><pre class="line">    # Base cases: list of length 1 or 0 is already sorted.</pre>
<pre class="num">  5</pre><pre class="line">    if (len(ls) == 1 or len(ls) == 0):</pre>
<pre class="num">  6</pre><pre class="line">        return ls</pre>
<pre class="num">  7</pre><pre class="line"> </pre>
<pre class="num">  8</pre><pre class="line">    pivot = ls[len(ls) - 1] # last element is pivot</pre>
<pre class="num">  9</pre><pre class="line">    gt = [x for x in ls[:len(ls)-1] if x > pivot]</pre>
<pre class="num"> 10</pre><pre class="line">    lt = [x for x in ls[:len(ls)-1] if x <= pivot]</pre>
<pre class="num"> 11</pre><pre class="line">    return quick(lt) + [pivot] + quick(gt)</pre>
<pre class="num"> 12</pre><pre class="line"> </pre>
<pre class="num"> 13</pre><pre class="line"># Create a random list.</pre>
<pre class="num"> 14</pre><pre class="line">ls = [random.randint(1, 100) for i in range(0, 30)]</pre>
<pre class="num"> 15</pre><pre class="line">print(ls)</pre>
<pre class="num"> 16</pre><pre class="line"> </pre>
<pre class="num"> 17</pre><pre class="line"># Get the (quick)sorted list.</pre>
<pre class="num"> 18</pre><pre class="line">ls = quick(ls)</pre>
<pre class="num"> 19</pre><pre class="line">print(ls)</pre>
<?php require("footer-global.php"); ?>
