<?php

global $browser;
require("header.php");
if ($browser != "mobile") { ?>
<script type="text/javascript" src="/js/shCore.js"></script>
<script type="text/javascript" src="/js/shBrushJScript.js"></script>
<script type="text/javascript" src="/js/shBrushXml.js"></script>
<script type="text/javascript" src="/js/shBrushPlain.js"></script>
<script type="text/javascript">
$(document).ready(function() {
    SyntaxHighlighter.all();
});
</script>
<?php } ?>

<div id="narrow">

<h2 class="farleft">notes on development</h2>
<p>
I thought it might be interesting to give some
discussion here on what has gone into the implementation of <span
class="tagname">knowvim</span>.  It's still very much a work in progress,
but I'll talk about what I've worked on so far.  The first two sections give
a brief overview of the model I used to mimic the look and feel of Vim in
the browser, and how I handle user input to mimic the functionality of Vim.
Subsequent sections talk about specific challenges I encountered and how I
dealt with them.  Just so you know, (and because I reference it later) the
entirety of <span class="tagname">knowvim's</span> Javascript logic is
contained in <span class="tagname">knowvim.js</span>, and yes, I used <a
class="contrast" href="http://git-scm.com/">git</a> from the very beginning
for version control of everything (I'm looking at you, Team Tarball).  I set
up a <a class="contrast"
href="http://joemaller.com/990/a-web-focused-git-workflow/">post-update
hook</a> on my server to pull freshly-pushed changes to the "master" branch
into the live site.  This lets me work on development locally without
changing what's on knowvim.com until I push those changes out.  </p>

<p>
<span class="tagname">Contents</span>:
<a class="contrast" href="/devnotes.php#the_model">the model</a>,
<a class="contrast" href="/devnotes.php#user_interaction">user interaction</a>,
<a class="contrast" href="/devnotes.php#w_and_b_movements">w and b movements</a>, <a class="contrast"
href="/devnotes.php#search_and_replace_cycle_detection">search and replace cycle detection</a>, and
<a class="contrast" href="/devnotes.php#line_visibility_issues">line visibility issues</a>.
</p>

<a name="the_model" href="#"></a>
<h3 class="farleft">the model</h3>
<p>
All the stuff that is made too look like a Vim window is contained within
the <span class="tagname">div</span> container with ID <span
class="tagname">vimwindow</span>.
A note on terminology: I'm pretty sure Vim refers to the actual text that
you're editing as a "buffer", although I sometimes speak more loosely and
call it a "file" as in, "G will move the cursor to the last line in the
file."  The contents of <span class="tagname">vimwindow</span> are pretty
straight-forward.  There is a <span class="tagname">source_code</span>
element which contains the lines of the "file" being edited, and a <span
class="tagname">bottom_bar</span> element which contains special
placeholders for the contents at the bottom of the window. Each line in the
file is represented as a pair of <span class="tagname">&lt;pre&gt;</span>
tags in the following way:
</p>

<pre class="brush:xml">
&lt;div id=&quot;source_code&quot;&gt;
&lt;pre class=&quot;num&quot;&gt;  1&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;x = 2&lt;/pre&gt;
&lt;pre class=&quot;num&quot;&gt;  2&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;y = 5&lt;/pre&gt;

              &lt;!--        more lines         --&gt;

&lt;pre class=&quot;num&quot;&gt; 20&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;print("hi")&lt;/pre&gt;
&lt;/div&gt;
&lt;div id=&quot;bottom_bar&quot;&gt;
&lt;!-- placeholders for bottom bar contents --&gt;
&lt;/div&gt;
</pre>

<p>
The <span class="tagname">bottom_bar</span> is of course where commands are
entered, error messages are displayed, informational messages are displayed,
and row and column values are updated.  Manipulating parts of the <span
class="tagname">bottom_bar</span> is relatively straight-forward, and
the bulk of the logic in <span class="tagname">knowvim's</span> Javascript
is there to make appropriate changes in <span
class="tagname">num</span> and <span class="tagname">line</span>
elements.  The sorts of changes here include turning element visibility on
and off, manipulating HTML element contents, manipulating CSS properties,
and inserting/removing HTML elements from the page.  The cursor (you know,
the red block thing) is modeled with a special <span
class="tagname">span</span> element that has CSS styling to make its
background and foreground colors different than the rest of the text. It
always contains just a single character within its <span
class="tagname">span</span> tags and looks like this:
</p>

<pre class="brush:xml">
&lt;pre class="line"&gt;The last lette&lt;span class="cursor_char"&gt;r&lt;/span&gt;&lt;/pre&gt;
</pre>

<a name="user_interaction" href="#"></a>
<h3 class="farleft">user interaction</h3>
<p>
Predictably, <span class="tagname">knowvim.js</span> contains a global
variable, "mode", which is used to direct keyboard input to various handlers
in the code.  It's exactly the sort of setup you'd expect.
</p>

<pre class="brush:js">
// There are lower-level handlers before this to grab the
// actual keydown events and send vim_handler the appropriate
// char.  Keys like ESCAPE, BACKSPACE, DELETE, ENTER, and
// ARROWS are sent to vim_handler() as strings of the form
// '&lt;ESC&gt;', '&lt;ENTER&gt;', etc.

function vim_handler(key) {
    switch(mode) {
        case "NORMAL":
            normal_handler(key);
            break;
        case "INSERT":
            insert_handler(key);
            break;
        case "EXECUTE":
            execute_handler(key);
            break;
        case "NEWFILE":
            newfile_handler(key);
            break;
        case "SEARCH_AND_REPLACE":
            searchreplace_handler(key);
            break;
        case "VISUAL_LINE":
            visual_line_handler(key);
            break;
        case "REPLACE":
            replace_handler(key);
            break;
        case "REPLACE_SINGLE":
            replace_single_handler(key);
            break;
        default:
            // Equivalent to a null handler.
            break;
    }
}
</pre>

<p>
At this point, we've got the character the user pressed, or something like
"&lt;ENTER&gt;" if they pressed ENTER, and we're sending it to any one of
the implemented handler functions, depending on the mode.  From here on out
it's just raw logic manipulating HTML contents and CSS properties to mimic
Vim functionality.
</p>

<a name="w_and_b_movements" href="#"></a>
<h3 class="farleft">w and b movements</h3>
<img alt="W motion FSM 1" src="/images/fsm-300.png"/>
<img alt="W motion FSM 2" src="/images/fsm2-300.png"/>

<p>
The "w" and "b" movements proved to be particularly challenging to
implement.  I'll talk only about the w-motion algorithm here, but know that
the b-motion algorithm is more-or-less the same just reversed (as in, you
can literally reverse the contents of a line and run the w-motion algorithm,
with a few tweaks).  The algorithm would already be complicated enough if we were
just looking at a text file composed of a sequence of lines, but because of
the way I implemented things in HTML, each line in the "file" that you see
on the screen is contained within its own <span
class="tagname">line</span> element.  This adds a couple of weird
complications:
</p>

<ol>
    <li>There are no newline characters, just a sequence of <span
    class="tagname">line</span> elements which appear one after
    the other. So we can't write code that says, "move forward according to
    w-motion logic until you hit a newline, then jump to the next
    line."</li>
    <li>There are no such things as "empty" lines in the file (lines which
    contain no other characters other than newline). There are simply <span
    class="tagname">line</span> elements with empty contents.  But in
    fact, even this is not the case, because when the cursor is on what
    should be an empty line, we still have to insert a blank space so that
    the cursor shows up (it makes the background of that blank space a red
    rectangle).  In other words, we can't ever have this:
    <pre class="brush:xml">
&lt;pre class="line"&gt;&lt;/pre&gt;
    </pre>
    Because we need, at minimum, a blank space available to wrap the
    cursor's <span class="tagname">span</span> tags around.  We have to have
    this instead:
    <pre class="brush:xml">
&lt;pre class="line"&gt; &lt;/pre&gt;
    </pre>
    Which means that <span class="italic">lines with a single
    space are actually interpreted as newlines.</span>  So unlike real
    Vim, we can't ever have an <span class="tagname">line</span> whose
    contents mimics ' \n'.  I figured it's a very small edge case that
    many people won't even notice or care about.</li>
</ol>

<p>
Why does this make things difficult?  Well, consider the standard w-motion
algorithm:
</p>

<pre class="brush:plain">
Let W = the set of word characters [a-zA-Z0-].
            "W" stands for "word."
Let P = the set of punctuation characters [!@#$% etc.].
            "P" stands for "punctuation."
Let B = the set of whitespace characters.
            "B" stands for "blank."
Let N = the set of newline characters (a one-element set).
            "N" stands for "newline."
Let c = the character under the cursor.

If c is in P then move to the next W character.
Else If c is in W then move to the next P character.
Else If c is in B then move to the next W or P character.
Else If c is in N then
    Try:
        jump to the beginning of the next line, update 'c' and:
        If c is in B then move to next W or P character.
        Else if c is in W or P then stay there.
    Except (No more lines):
        Put cursor at the very last character of the file.
</pre>

<p>
The algorithm is straight-forward enough, but it's implementation is
difficult given the environment provided by HTML.  We could extract the
contents of each <span class="tagname">line</span> element and feed it
to the w-motion algorithm as a stream, but the lack of newline characters
poses a serious setback. We know that single blank spaces are sometimes
interpreted as newline characters, but only if they are the only contents on
a line.  Once all <span class="tagname">line</span> elements are strung
together though, we have no way of knowing which blank spaces are to be
interpreted as newlines and which as actual blank spaces.
</p>

<p>
Still, I didn't initially think this would be a huge issue.  After all, we
can just "pretend" we saw a newline whenever we've looked at all the
characters in an <span class="tagname">line</span>.  As the algorithm
seemed to correspond nicely to a finite state machine, I implemented it as
such.
</p>

<!--
<img alt="W motion FSM 1" class="figure" src="/images/fsm-400.png"/>
<div class="caption">A first attempt at the w-motion finite state
machine.</div>
-->

<p>
This almost works, but suppose we have a file like this:
</p>

<pre class="example">
Here is line one<span id="cursor_char">.</span>

Here is another line, which followed an empty line.
</pre>

<p>
Assuming the cursor is on the last character in line 1 (the period), this
machine will read the last character in line 1 and correctly transition to the
"Just-saw-a-newline (N) state" but afterwards, it will read the blank
character and transition to the "Just-saw-a-whitespace (B)" state.
(Remember that <span class="italic">all</span> lines &mdash; even "empty"
ones &mdash; have at least a single blank space in them so that we can
display the cursor.)  At that point it will begin looking for either a word
character or a punctuation character, which is incorrect behavior.  When it
comes to a line which contains <span style="font-style:italic">only</span> a
newline, it <span class="italic">should</span>
put the cursor on that line.  (Try this out in real Vim and you'll see what
I mean.)
</p>

<p>
To get around this, I added another state to the machine, called
"NEWLINE_BLANK" which, as you might guess, is used to handle the case when
we just finished reading a line and have read a single whitespace character
on the next.  At this point, the algorithm reads <span
class="italic">another</span> character, and if that character is one that
came from the line below, we know that this line contained only a single
space, and in fact represents an empty line.
</p>

<!--
<img alt="W motion FSM 2" class="figure" src="/images/fsm2-400.png"/>
<div class="caption">A new w-motion machine which handles empty lines
correctly.</div>
-->

<p>
There are a lot of code-level details I haven't talked about, but this was
the gist of the w-motion problem.  It took a huge amount of debugging to get
right, and hopefully I won't ever have to look at it again.  It seems fast,
which isn't all that surprising, considering that any given time it's only
looking at a stream of perhaps 80 characters and is just applying tiny
amounts of logic to figure out the next cursor position.  Nonetheless, a
fair question to ask at this point is why not use regular expressions?  My very
first implementation of the w-motion algorithm actually did just that.  I
used regular expressions to match blocks of word characters, punctuation
characters, and blank spaces.  </p>

<p>
So just apply a regular expression and put the cursor at the first match
that comes up, right?  Well, the first issue I ran into involved a case
where a line looks something like this (I know, it looks dumb and contrived, but it's
valid):
</p>

<pre class="example">

H<span id="cursor_char">e</span>re ere is a (line).

</pre>

<p>
Since the cursor is on the "e", we can ignore the "H" when applying the
regular expression.  If you were to use pattern matching with the
appropriate right regular expression on this truncated line you'd get an
array like this:
</p>

<pre class="brush:js">
var matches = "ere ere is a (line).".match(reg_exp);
return matches; // ["ere", "ere", "is", "a", "(", "line", ")."];
</pre>
<p>
Now, I was smart enough to realize that we should probably always just throw
out the first match that comes up, because it will typically be some
substring of the word or punctuation block the cursor is on (unless the cursor
is on a blank space, but that's easy to handle).  But the second
entry of "matches" in this case is the same thing, so the logic falls apart;
if we put the cursor at the first occurrence of "ere", it will just stay where it
is, because "ere" as a substring occurs twice in this line.  </p>

<p>
One option I saw was to implement some logic that simply consumed the rest
of the word "Here" and applied the matching while the cursor was on a blank
space. This seemed ugly though, and frankly, at that point it would
basically be a finite state machine operating on a stream of input
characters which only occasionally took very brief shortcuts with pattern
matching.  This hybrid approach seemed difficult to justify from a
performance standpoint and even more so from a "can I read and undestand
this code?" standpoint.  </p>

<a name="search_and_replace_cycle_detection" href="#"></a>
<h3 class="farleft">search and replace cycle detection</h3>
<img alt="Search" class="figure" src="/images/search-400.png"/>

<p>
My original search-and-replace algorithm went something like this:
</p>

<ol>
<li>Look for an occurrence of the search pattern on the current <span
class="tagname">line</span>.</li>
<li>If an occurrence is found, replace it with the given replacement string
and start again.</li>
<li>If no occurrences are found, move to the next <span
class="tagname">line</span> and try again.  If we've already looked at
every <span class="tagname">line</span> (we can keep a count going to
figure this out), then there aren't any more occurrences of the search
pattern in the file, so we're done.</li>
</ol>

<p>
Search-and-replace was going swimmingly until I typed in the following
command:
</p>

<pre class="brush:plain">
:%s/data/big_data/gc
</pre>
<p>
The problem here is that when "data" is replaced by "big_data", we'll
still have an occurrence of "data" which search-and-replace will dutifully
replace with "big_data" <span class="italic">again</span> the next time
around. This
can go on indefinitely, leaving you with something like "big_big_big_data."
If the command was typed in without the "c" flag then the browser will
probably freeze as the code gets stuck in an infinite loop.
</p>

<p>
To get around this problem, I first tried the obvious: change the algorithm
so that after "data" is replaced with "big_data", the next round of
searching begins at some point after the word "big_data", or whatever string
was just used to replace the search pattern.  This only temporarily fixes
the problem however, because when we use the "g" flag, we're telling Vim to
search through the entire file, and eventually it will cycle back around to
the same point we started from, find an occurrence of "data", and make the
"big_data" replacement again, leaving us with "big_big_data."  It will
continue looping through all the lines in the file, always finding an
occurrence of "data" to replace.
</p>

<p>
You might wonder why I don't just keep track of how many lines the
search-and-replace algorithm has looked it, and make sure it doesn't look at
the same line twice.  Actually, that would be a perfectly acceptable
solution if I had known exactly how global search-and-replace worked.  But
believe it or not, I didn't.  To explain my misunderstanding let's look at
an example:
</p>

<pre class="example">
def __init__(self, options):
    self.host = options.host
    self.port = options.port
    self.backlog = 5
    self.size = 1024
    self.sock = None
    if options.verbose == True:
        print("<span id="cursor_char">H</span>ost: %s" % self.host)
        print("Port: %s" % self.port)
</pre>

<p>
Let's say the cursor is on the word "Host" in the second-to-last line
and you run a command like
</p>

<pre class="brush:plain">
:%s/self/something_else/gc
</pre>

<p>
When I implemented search and replace, I just assumed the search part worked
exactly the same way as a "slash" search (i.e., typing "/pattern" to look
for a pattern in NORMAL mode).  Spoiler alert: it doesn't.  The slash search finds the first occurrence
of the search pattern, <span class="italic">starting from the current row
and column the cursor is on.</span>  So if the cursor is on the word "Host",
it will first find the "self" on line 8, then the "self" on line 9, then the
"self" on line 1, and so on.  In this scheme, detecting the kind of
search-and-replace cycle that happens with ":%s/data/big_data/gc" is more
difficult, because you'd actually have to visit line 8 twice, since the
first time around the search function is only scanning the characters to the
right of the cursor, ignoring any potential occurrences of the search
pattern that are to the left.
</p>

<p>
Thus, I made my life difficult by trying to handle the case where the user
started the search in the middle of a line, searching to the right of the
cursor the first time around, and searching the contents to the left of the
original cursor position the second time around.  As it turns out, even real Vim
isn't this smart; a ":%s/data/big_data/gc" command will actually just start
the search from Line 1, Column 1, and proceed down the file, looking at each
line once.  Very easy.  I wish I had checked on this before implementing the hard
version with cycle detection.  Even though it was difficult, I got it to
work by first counting the number of occurrences of the search pattern
before any replacements were made, and then comparing this number to the
number of occurrences found after each iteration of the search loop.  When
the number of found occurrences was equal to the original number of
occurrences, my algorithm stopped.  That's what you get for not checking
assumptions I guess.  It bugs me that this represents a deviation from real
Vim behavior, but I also don't have the energy to refactor my code at this
point, so for now, it will stay as-is.
</p>

<a name="line_visibility_issues" href="#"></a>
<h3 class="farleft">line visibiliy issues</h3>
<img alt="Line Visibilities" class="figure" src="/images/linevis-400.png"/>
<p>
The very first iterations of <span class="tagname">knowvim</span> made no
adjustments to line visibility, meaning that if you were looking at a
100-line file, all 100 lines would be visible in the browser.  I wanted a
more authentic feel though, and part of that feel involved restricting
the size of the "viewing window" such that only say, 20 lines, were visible
at once.  In terms of what's actually happening in the browser, when a
user moves the cursor to a line above or below this viewing window, certain
<span class="tagname">line</span> and <span
class="tagname">num</span> elements become visible, and others become
invisible.  At first I tried using CSS to accomplish this, using the
"display:none" property, but ultimately I switched to jQuery's ".hide()" and
".show()" functions because they were easier to work with.
</p>

<p>
The original algorithm to accomplish looked something like the following.
It's very straight-forward because it just loops over every line in the file
and adjusts the visibility based on its index.  This works exactly as you'd
expect.
</p>

<pre class="brush:js">
function maintain_line_visibilities() {
    for (var i = 0; i &lt; num_lines; i++) {
        var num = $(".num").get(i);
        var line = $(".line").get(i);
        if (i &lt; top_visible_row || i &gt; (top_visible_row + num_display_lines - 1)) {
            // Assert this line is NOT in the visible range.
            $(num).hide();
            $(line).hide();
        } else {
            // Assert: this line IS in the visible range.
            $(num).show();
            $(line).show();
        }
    }
}
</pre>

<p>
This methods works just fine for small files, but it begins to slow things
down if the user is looking at a big, 100-line file.  To see why, imagine
what would happen if a user is using the <span class="tagname">j</span> movement to move all the way
down the file.  Every downward motion will triger a call to this
<code>maintain_line_visibilities()</code> function, which iterates over all
lines, adjusting their visibility settings.  To move down <span
class="italic">n</span> lines, we make <span class="italic">n-squared</span>
visibility adjustments!  This makes things jerky and slow.
</p>

<p>
Turns out this is a pretty classic case of the trade-off between
writing an easy-to-understand algorithm and writing an algorithm optimized
for performance.  Once I noticed this problem, I realized
there's no need to iterate over <span class="italic">every</span> line
when adjusting visibilities, because, generally speaking, only a very
small number of lines will actually need their visibility settings
changed.  If the cursor is on the last visible row in the window and the
user presses <span class="tagname">j</span>, we really only need to do two things:
</p>

<ol>
    <li>Make the very top line in the window invisible.</li>
    <li>Make the line we just moved to visible.</li>
</ol>

<p>
That's a whole lot less work than looping over all lines.  I decided to keep
track of a movement "delta" &mdash; the difference between the row the
cursor used to be on, and the one it just got moved to (for <span class="tagname">j</span>
and <span class="tagname">k</span> this will be 1, for <span class="tagname">gg</span>, <span class="tagname">G</span>, <span class="tagname">{</span>, and <span class="tagname">}</span> this will be something
else).  If this delta puts the cursor outside the viewing window then a
function I called <code>set_line_visibilities()</code> is called, and this
function basically has a giant IF/ELSE chain that figures out what kind of
visibility adjustments need to be made (if any), and the optimized logic for
making those adjustments.
</p>

<p>
There are still some cases when it's necessary to use the brute-force
visibility adjustment method, so I added this comment to my original
function:
</p>
<pre class="brush:js">
function maintain_line_visibilities() {
    // This method iterates over ALL .num and .line elements and
    // sets their visibilities accordingly.  Because it loops through all
    // lines, it is an expensive operation that should only be called when a
    // complete re-setting of line visiblities is needed.  For example, when
    // the num_display_lines global var is changed through a :set
    // displaylines=&lt;NUMBER&gt; command.  To handle any other changes in line
    // visibilities because of cursor movements, use set_line_visibilities().
    
    // ... same code as above .. //
}
</pre>

<p>
The optimized version looks like this.  It's super long because I
didn't collapse the <span class="tagname">for</span> loops into a single
parametrized function (I know, it's on the TODO list), but nonetheless, you
can see that breaking the algorithm into 4 separate cases requires a lot
more explanation of what's going on than the brute-force method I showed
earlier.</p>

<pre class="brush:js">
function set_line_visibilities() {
    // This method is intended to be called after any vertical movement of
    // the cursor.  It checks if the cursor is outside the visible range.
    // If so, it adjusts the visibility of each line to make the cursor
    // row in the visible range.  It also renumbers rows, since only lines
    // within the old visibility range are guaranteed to have the right line
    // numbering.
    if (num_display_lines == 0) { return; }
    if (current_row &lt; top_visible_row) {
        // Assert: the current row is above the visible space.
        var delta = top_visible_row - current_row;
        if (delta &lt; num_display_lines) {
            // Assert: some of the old viewing window is still visible, so
            // we'll be adjusting some subset of the lines in this window.
            // Loop through all rows starting with current up to the first
            // row that we know is already visible. (There are &lt;delta&gt; number of
            // these.)
            for (var i = current_row; i &lt; (current_row + delta); i++) {
                var num = $(".num").get(i);
                var line = $(".line").get(i);
                // By design, we know these elements were outside the visible
                // range but should now be set to visible.
                $(num).show();
                $(line).show();
            }
            // last_row represents the last previously visible row that should
            // be set to invisible.
            var last_row = top_visible_row + num_display_lines - 1;
            for (var i = last_row; i &gt; last_row - delta; i--) {
                var num = $(".num").get(i);
                var line = $(".line").get(i);
                // By design, we know these elements were within the visible
                // range but should now be set to invisible.
                $(num).hide();
                $(line).hide();
            }
            top_visible_row = current_row;
        } else {
            // Assert: we jumped so far that none of the old window is
            // visible.  We have to make a whole new window.
            for (var i = current_row; i &lt; (current_row + num_display_lines); i++) {
                var num = $(".num").get(i);
                var line = $(".line").get(i);
                // By design, we know these elements were outside the visible
                // range but should now be set to visible.
                $(num).show();
                $(line).show();
            }
            for (var i = top_visible_row; i &lt; (top_visible_row + num_display_lines); i++) {
                var num = $(".num").get(i);
                var line = $(".line").get(i);
                // By design, we know these elements were within the visible
                // range but should now be set to invisible.
                $(num).hide();
                $(line).hide();
            }
            top_visible_row = current_row;
        }
    } else if (current_row &gt; (top_visible_row + num_display_lines - 1)) {
        // Assert: the current row is below the visible space.
        var delta = current_row - (top_visible_row + num_display_lines) + 1;
        if (delta &lt; num_display_lines) {
            // Assert: some of the old viewing window is still visible, so
            // we'll be adjusting some subset of the lines in this window.
            for (var i = current_row; i &gt; (current_row - delta); i--) {
                var num = $(".num").get(i);
                var line = $(".line").get(i);
                $(num).show();
                $(line).show();
            }
            for (var i = top_visible_row; i &lt; (top_visible_row + delta); i++) {
                var num = $(".num").get(i);
                var line = $(".line").get(i);
                $(num).hide();
                $(line).hide();
            }
            top_visible_row = current_row - num_display_lines + 1;
        } else {
            // Assert: we jumped so far that none of the old window is
            // visible.  We have to make a whole new window.
            for (var i = current_row; i &gt; (current_row - num_display_lines); i--) {
                var num = $(".num").get(i);
                var line = $(".line").get(i);
                $(num).show();
                $(line).show();
            }
            for (var i = top_visible_row; i &lt; (top_visible_row + num_display_lines); i++) {
                var num = $(".num").get(i);
                var line = $(".line").get(i);
                $(num).hide();
                $(line).hide();
            }
            top_visible_row = current_row - num_display_lines + 1;
        }
    }
}

</pre>

<p>
Line renumbering works in much the same way.  Just as I had done for setting
the line visibilities, I initially used a naive brute-force method for
renumbering lines when the user deleted or added lines to the file.  If a
user tries a fast-repeating delete (by pressing <span class="tagname">dd</span> and then holding down
<span class="tagname">.</span>) in a large file, the brute-force method will slow things down
significantly.  I optimized this algorithm to only iterate over lines within
the viewing window, so that when a user presses <span class="tagname">dd</span> to delete a line, the
only <span class="tagname">num</span> elements affected are those between
and including the current line and the bottom of the viewing window. This
makes for an interesting situation because if you had a 100-line file and a
20-line viewing window,  and deleted 25 lines by pressing <span class="tagname">dd</span> from Line 1,
you would end up with with HTML source that looks like this:
</p>

<pre class="brush:xml">
&lt;!-- This is the top of the viewing window. --&gt;
&lt;pre class=&quot;num&quot;&gt;  1&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;x = 2&lt;/pre&gt;
&lt;pre class=&quot;num&quot;&gt;  2&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;y = 5&lt;/pre&gt;

              &lt;!--     16 more lines         --&gt;

&lt;pre class=&quot;num&quot;&gt; 19&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;x = 2&lt;/pre&gt;
&lt;pre class=&quot;num&quot;&gt; 20&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;y = 5&lt;/pre&gt;
&lt;!-- This is the bottom of the viewing window. --&gt;
&lt;pre class=&quot;num&quot;&gt; 45&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;x = 2&lt;/pre&gt;
&lt;pre class=&quot;num&quot;&gt; 46&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;y = 5&lt;/pre&gt;
&lt;pre class=&quot;num&quot;&gt; 47&lt;/pre&gt;&lt;pre class=&quot;line&quot;&gt;print("hi")&lt;/pre&gt;
</pre>

<p>
Where all lines below the viewing window have been hidden, making their
out-of-sequence line numbering irrelevant.
</p>


</div> <!-- end #narrow -->

<?php require("footer.php"); ?>
