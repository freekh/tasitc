## The AMAZING Shell In The Cloud (tasitc)

This repo is my personal scratchbook for a hobby project of mine: tasitc, an experimental cloud based tool.

### What
tasitc (pronounced *tas*, as in fan-tas-tic, then *eeteesee*, as in fel-icity or like *tacit*-*ity* choose whatever mnemonic you like) is meant to be a new way of interacting with web-services using a shell-like, bash-ish, lisp-derivative language. It is intended to make it easier to transform and produce web-services and web pages. 
tux, the next gen Terminal User eXperience (an homage (or wink?) to the 'other' (https://en.wikipedia.org/wiki/Tux)[tux]), is the "terminal" in which tasitc will run (at least intially). It is a reimagining of the ye olde terminal in a browser maintaining the feeling and qualities of a terminal, augmenting it subtly but substantialy.
Note: the structure and code will be built properly, when I get the parser and AST are more stable (+ you would be mad to fork this - there's not even a single star here :)).
More to come.

### What?!?
Ah, you want an example? Here's an example (as it is now) where the rows of the first column of a Google spreadsheet is downloaded, based on a path http request assigned to `~/test/rows`, then rendered in bootstrapped html:

```
/google/drive --path=(str ?path '.gsheet') --acount=(account ~/google/freekh) | 
  gsheet2json | 
  html (ul ($.columns[0].rows | li)) /bootstrap/css > 
  ~/test/rows
```

It can then be called from the tux (the next gen Terminal User Experience, aka an on-line command line interface) `~/test/rows --path='Test'` or by hitting the endpoint: `https://tasitc.com/freekh/test/rows?path=Test` .

## Architecture
tldr; 
Tasitc statements are one-arg functions that take an http request/response object and returns an http response.
A tasitc statement can be composed of multiple statements, either using an arg or using combinators. 
The argument of the function is either specified (by the user) or 'piped' in by the previous statement.
In the end, all statements are reduced and, thus, return one http response.

There are 4 building blocks of tasitc: statements, combinators (the '|'), sinks and the virtual filesystem, called the endpoint structure.
- statements are composed of: 
  - request: returns the response of a specified http request (mime type is the same as the response)
  - h: returns dom elements (mime type: text/html)
  - str: returns strings (mime type: text/plain)
  - json: returns json (mime type: application/json)
- combinators: can be used to reduce iterable requests. There are only one (at least for now) which is the monadic combinator: the pipe ('|'). Example: In the following expression: [['a'], ['c']] | $ | $, the first | will map and the second will flatmap (mapcat, bind).
- sinks: wait for requests at end-points or performs crud on a virtual filesystem. Examples:
  - named pipe ('>'): assigns a tasitc statement to the endpoint structure.
  - listen: listens on the endpoint structure and executes a tasitc statement. Used for one-off request handling.
  - http/verb: specifies the http verb a function reacts to
  - http/status: specifices the status of response.
- endpoint structure: are opaque for most users so no examples (here), but hackable non the less. They can be used to emulate a file system. Other than CRUD operations, they also have a user permission model.

## Basic syntax
- Loops: there are no loops
- Variables: there are no variables
- Function definitions: there are no function defintions - every statement is a function
- Parameters: it is possible to 

### When
When my experiments are done! Oh, you meant when in time? Well, that is not up to me really :) Maybe in 2 weeks or maybe never :)

### Why
Right now, I just want to put my thoughts down on paper so to speak.
Still, here are some imaginary use cases:
 - transforming (bablify) javascript(s) from some cdn(s)
 - transforming and aggregating webservices
 - simple and extensible admin pages and other 'throw-away' webpages (landing pages, etc etc)

Again, more to come... :)
