<?php require("header.php"); ?>
<p style="display:none">
Answers to some of the obvious questions about knowvim.com.
</p>

<div id="about" class="mainbox">
<h1><a id="homelink" href="/">know vim</a> <span id="beta">(beta)</span></h1>

<div id="narrow">

<h3 class="farleft">Are all Vim commands available here?</h3>
<p>No, not even close.  <span style="font-weight:bold">knowvim</span> aims
to provide a friendly introduction to novice users and as such, implements
only an extremely tiny subset of all Vim commands.  They are not very
difficult to learn and can be an excellent starting point before learning
the more advanced features of Vim.  See <a class="contrast"
href="http://stackoverflow.com/questions/1218390/what-is-your-most-productive-shortcut-with-vim/1220118#1220118">this
Stackoverflow response</a> by Jim Dennis for a famously thorough explanation
of what is means to "know Vim," articulated more elegantly than I possibly
could here.</p>

<h3 class="farleft">I found a bug and/or have a cool suggestion</h3>
<p>Feel free to email me.  My contact info is <a class="contrast"
href="contact.php">here</a>.</p>

<h3 class="farleft">Why not just use vimtutor?</h3>
<p>For those of you unaware, you can just type "vimtutor" on the command
line, and you'll immediately enter a Vim tutorial, in Vim itself.
I promise I won't take it personally if you leave this page now and go try
it.  In fact, I'd recommend it if you're serious about learning.  I'm not
trying to take the place of
vimtutor or pretend that <span class="bold">knowvim</span> is in any way as
powerful as real Vim, but I do think the first place people look for help is
the web, and having <span class="italic">something</span> to try in the
browser lowers the barrier to entry that much more. (If anyone has ever
Googled "ruby language tutorial" you've probably found <a class="contrast"
href="http://www.tryruby.org">tryruby.org</a>, which has the same sort of
"try this in your browser!" concept.)  Plus, I just thought this would be
fun to do anyway.</p>

<h3 class="farleft">Um, what about Visual Mode?</h3>
<p style="text-decoration:line-through">Not sure how hard that
would be to implement.  My guess is "kinda hard." Mostly I just need a break
before attempting this.  It's sort of on a vague to-do list that may or may
not actually get done.  You can survive without Visual mode which is why I
left it off for now.  If I implement anything it would be Visual yank,
Visual delete and uh, that's it.</p>

<p>It's there, but I didn't talk about it in any of the tutorial
files (start.html, and second.html up to sixth.html).  Right now it's mostly
spike code; I haven't optimized any of the implementation of VISUAL LINE and
I know it struggles with "big" operations, like deleting over 50 selected
lines, for example (and yes, that's what I'm considering "big" so you can
imagine VISUAL LINE doesn't scale well at all right now).  Perhaps I'll work
on a limited version of VISUAL later, but I definitely won't be doing VISUAL BLOCK, because
that's just crazy.  Go use real Vim at that point.  As it is, VISUAL LINE
has very limited functionality (only "j" and "k" movements with "y", "d" and
"p" commands) and will probably stay that way for some time.  This is only a
demo, after all.</p>


<h3 class="farleft">Can I use this source for stuff?</h3>
<p>Sure, I even added the GPL to the Javascript source to
make it official.  That being said, I can't promise it's particularly
gorgeous code, though I have tried to make the program flow
intuitive and semi-well-commented.  If you do anything cool, let me
know.</p>

<h3 class="farleft">Why are you not paying homeage to vi?</h3>
<p>
Eh, Vim. Vi. Same thing these days, right?  But seriously, on many systems
it is the same thing, because the "vi" command is often just an alias for
"vim".  I understand that <span class="tagname">vim</span> takes its name
from "vi improved," and that <span class="tagname">vi</span> was originally
developed as the "visual interface" for <span class="tagname">ex</span>,
which itself was developed as an improved version of <span
class="tagname">ed</span>, the most original of original Unix text editors,
born in the beginning, when God created the world.
(See <a class="contrast" href="http://www.linfo.org/vi/history.html">this brief history of
vi</a>.)
But look, I'm not old, I'm not a sysadmin, and I'm not that hardcore. In
my world, "vi" and "vim" are interchangeable.</p>

<h3 class="farleft">How come the '&lt;' and '&gt;' characters break stuff?</h3>
<p>The angle brackets are reserved characters in HTML, so trying to render
them "as is" on a web page is a pain.  You have to use the ampersand escape
character to do it correctly, but I haven't designed my Javascript to handle
these escape codes in the right way.  Probably never will.</p>

<h3 class="farleft">What about those "tilda lines" in real Vim?</h3>
<p>
So I actually had those for a while, but I thought they looked ugly.
</p>

</div> <!-- end #vimwindow -->
</div> <!-- end #main -->

<?php require("footer.php"); ?>
