<?php require("header.php"); ?>
<p style="display:none">
Why did I spend hours of my life on this? I thought it would get me a hot
girlfriend.
</p>

<div id="about" class="mainbox">
<h1><a id="homelink" href="/">know vim</a> <span id="beta">(beta)</span></h1>

<div id="narrow">

<h2 class="farleft">about</h2>
<p>My name is Andrew Hallagan and I started using Vim after my sophomore year
of college.  I was at Bucknell University, conducting <a class="contrast"
href="http://www.eg.bucknell.edu/~perrone/students/">research</a> with my
professor, <a class="contrast"
href="http://www.eg.bucknell.edu/~perrone">Dr. Luiz Felipe Perrone</a>.  He
was using Vim to show me some code, and having never heard of the program
before, it intrigued me.  I experimented for a few days and found modal
editing difficult to love. I stuck with it, however, because I thought Vim
had some crucial advantages over Emacs, the editor they half-heartedly tried
to teach us freshman year.  (After that first attempt freshman year, the
computer science department bailed and had us use Eclipse for everything,
which, if I may get on my soapbox for thirty seconds, was a real disservice
to greenhorn programmers like myself.  Once I started writing code in other
languages besides Java I realized I needed to learn a real editor
again.)</p>

<p> Commands in Emacs are in some ways easier for beginners in this day and
age to pick up on.  We (and by "we" I mean people born after 1990) are used
to using <span style="font-weight:bold">Ctrl+[some key]</span> to do lots of
things &mdash; I'm sure you know the standard shortcuts for things like
print, save, close, find, copy, cut, paste, select all, undo, open, and new
&mdash; so commands like <span class="bold">Ctrl+p</span> and <span
class="bold">Ctrl+n</span> are pretty intuitive ways to move up and down
lines because we're used to pressing those keys to do stuff.  I know it
sounds kind of dumb, but I think it makes Emacs that much easier for newbies
to acclimate to.</p>

<p>When I first started using Vim it seemed really annoying to have to press
"i" all the time just to start typing.  To make matters worse, I didn't know
about the "a" or "A" commands (Insert after) for an embarassingly long time,
so whenever I wanted to add something at the very end of a line, I had to
move all the way to the very end with "$", press "i" to insert, press "DEL"
to remove the last character, then type that character again so put me at
the end of the line in INSERT mode. Little did I know all it takes is a
single "A" from NORMAL mode.
What I'm saying is, if you're just starting out, I feel your pain.  This
website exists because I am a patient, methodical guy who took the time to
learn Vim and I believe it's well worth it.
</p>

<!--
<p>
Default colors in Vim are pretty cool as well.  I've been pretty loyal to
":colorscheme elflord" but I also have my .vimrc file set up to choose
":colorscheme pablo" for XML files since elflord colors the tags weirdly.
For some cool alternative schemes check out <a class="contrast"
href="http://vimcolorschemetest.googlecode.com/svn/html/index-java.html">this
page</a> with colorscheme "screenshots".</p>
-->
<!--
When I see people at work or
school who just type "i" to get into Insert mode and then arrow-key around
the document like they would in Notepad or Gedit I have to take a little
five-minute break to go cry by the water cooler. It's like buying a Ferarri
with an automatic transmission.
-->

<p>Apparently I'm not the first to try and implement Vim in
the browser.  <a class="contrast"
href="http://gpl.internetconnection.net/vi/">Jsvi</a> implements a lot of
commands I haven't, but it's not much to look and I don't think a beginner
would be inclined to spend a whole lot of time there.  I decided to build
this implementation from the ground up myself. It's more fun that way anyway
and I've come across a lot of interesting dilemmas not only in trying to
mimick the look and feel of Vim, but also in trying to write Javascript that
performs well in the browser.  A quick example: the "dd" command removes
certain HTML elements from the page and then has to go through and change
the numbering of each successive line to reflect the deletion.  My first
implementation of the "dd" command renumbered <span
style="font-style:italic">all</span> lines, which worked fine until I tried
loading a 200+ line file and performing a fast-repeating delete with "dd"
followed by a held-down "."  It was basically an n-squared operation that
came across slow and jerky.  I ended up changing the implementation to only
renumber lines within the 20-line viewing space (in other words,
renumbering, at most, 20 lines for a single "dd" command), and that sped
things up a lot, since a single "dd" command went from O(n) to O(1).</p>

<p>
So yeah, why did I spend my time on this?  I did it because if you don't
already know Vim, you should.  It's addicting.  I used to share Vim tips
with friends at college and every time one of us explained a new command
&mdash; <span style="font-style:italic">Did you know you can save and quit
with "ZZ"??? </span> &mdash; we would commit the new command to memory and
swear to incorporate it into our everyday editing.  I can't believe I used
to survive without knowing "cw" or "gqj".  I'm only just now getting into
the habit of marking spots with "m" and going back to them with " ' " (the
apostrophe).  Collecting Vim commands in your head is like collecting
baseball cards or, I don't know, stamps.  You'll never have all of them and
you'll never quite seem to have enough, but it's still fun.  And that's
pretty much why I did this.  </p>

</div> <!-- end #vimwindow -->
</div> <!-- end #about -->

<?php require("footer.php"); ?>
