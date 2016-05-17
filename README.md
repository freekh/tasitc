## The AMAZING Shell In The Cloud (tasitc)

This repo is my personal scratchbook for a hobby project of mine: tasitc, an experimental cloud based tool.

### What
tasitc (pronounced *tas*, as in fan-tas-tic, then *itc*, as fel-icity) is meant to be a new way of interacting with web-services using a shell-like, bash-ish, lisp-derivative language. It is intended to make it easier to transform and produce web-services and web pages. 
tux2, the terminal user experience 2.0, is the "terminal" in which tasitc will run (at least intially). It is a reimagining of the ye olde terminal maintaining all its qualities, augmenting it subtly but substantialy. More to come.

### What?!?
Ah, you want an example? Here's an example (as it is now) where the rows of the first column of a Google spreadsheet is downloaded, based on a path http request assigned to ~/test/rows, then rendered in bootstrapped html:

```/google/drive --path=(str ?path '.gsheet') --acount=(account ~/google/freekh) | gsheet2json | html (ul ($.columns[0].rows | li)) /bootstrap/css > ~/test/rows```

It can then be called from the CLI `~/test/rows --path='Test'` or by hitting the endpoint: `https://tasitc.com/freekh/test/rows?path=Test` .

### When
When my experiments are done, the structure and code will be built properly.

### Why
Right now, I just want to put my thoughts down on paper so to speak.
Still, here are some imaginary use cases:
 - transforming (bablify) javascript(s) from some cdn(s)
 - transforming and aggregating webservices
 - simple and extensible admin pages and other 'throw-away' webpages (landing pages, etc etc)

Again, more to come in the next weeks or so... :)
