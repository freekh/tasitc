## The AMAZING Shell In The Cloud (tasitc)

This repo is my personal scratchbook for a hobby project of mine: tasitc, an experimental cloud based tool.

### What
tasitc (pronounced *tas*, as in fan-tas-tic, then *eeteesee*, as in fel-icity or like *tacit*-*ity* choose whatever mnemonic you like) is meant to be a new way of interacting with web-services using a shell-like, bash-ish, lisp-derivative language. It is intended to make it easier to transform and produce web-services and web pages. 
term, is the "terminal" in which tasitc will run (at least intially). It is a reimagining of the ye olde terminal in a browser maintaining the feeling and qualities of a terminal, augmenting it subtly but substantialy.
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

There are 4 building blocks of tasitc: statements, combinators (the '|'), sinks and a virtual filesystem, called the 'node structure' (there are no files in tasitc so _file_system would be misleading).
- statements are composed of: 
  - request: returns the response of a specified http request (mime type is the same as the response)
  - h: returns dom elements (mime type: text/html)
  - str: returns strings (mime type: text/plain)
  - json: returns json (mime type: application/json)
- combinators: can be used to reduce iterable requests. There are only one (at least for now) which is the monadic combinator: the pipe ('|'). Example: In the following expression: [['a'], ['c']] | $ | $, the first | will map and the second will flatmap (mapcat, bind).
- sinks: wait for requests at end-points or performs crud on a virtual filesystem. Examples:
  - named pipe ('>'): assigns a tasitc statement to the endpoint structure.
  - listen: listens on the endpoint structure and executes a tasitc statement. Used for one-off request handling.
  - http/verb: specifies the http verb a function reacts to.
  - http/status: specifices the status of response.
- node structure: are opaque for most users so no examples (here), but hackable non the less. They can be used to emulate a file system. Other than CRUD operations, they also have a user permission model.

## Language
### Basic structure
- Syntax:
  - Every expression starts with a request id, e.g., in `ls`, 'ls' is the request id. The request id will be lookup and an absolute path will be given. Example: `ls` is alias, and its full path is: `/tasitc/base/ls`.
  - It is possible to pass in query parameters to an expression: `foo --bar='cool'`.
  - Use parenthesis to denote expression bounderies: `foo (bar $)` 
  - $: context, an instance that represents the response content.
  - $$: full context, represents the current request and response.
  - ?<name> (e.g. ?path): is a short hand to extract the query string from a request.
  - $?: the short hand for the body of a request. Example: `json $? | $.foo`, converts the body of a request to json and extracts `foo`.
  - {}: signifies an instance (same syntax as JS).
  - []: lists (same as JS).
  - |: the monadic combinator. The first '|' in an expression, will be a map, e.g. `['hello', 'there'] | $[0]` outputs: `['h', 't']`. Then every '|' is a flatmap: `[[1,2], [3,4]] | $ | $`, outputs: `[1,2,3,4]`. To avoid flattening a structure, it is possible to encapsulate a context in a list: `[[1,2], [3,4]] | [$] | $`, outputs: `[[1,2], [3,4]]`
  - filter: This is the planned syntax for filtering (filter is just an expression though since we do not care about perf): `['a', 'b', 'c'] | filter '[a|b]'` outputs, `['a', 'b']`. Numbers doesn't have their own mime type and thus no representation in tasitc. It is useful though so filter will have some support for it: `[1,2,3] | filter --gte=2` outputs: [2,3]. 

  
- Loops: there are no loops - tasitc-lang is an expression based functional language. Instead there are combinators which allows you to iterate over iterables.
- Variables: there are no variables. Variables are inheritly mutable and fits poorly for an http based language. It is possible to read query parameters, but it is not possible to.
- Function definitions: there are no function defintions, instead every statement is a function. Since there's only type of expression (a function) in tasitc, it doesn't make sense to have a special syntax for it.
- Function parameters: there can only be one function paramter. 
- Query & path parameter: tasitc is http based and has syntactical sugar to make it easy to parse query (`/name?name='fredrik'`) and path (`/name/:name`) parameters.
- Pattern matching: this is in the works. An example of the planned syntax:
```
$ | [
  { 'cwd: foo} => "found the following value in cwd: ?foo"
  ? => 'hitting the default case'
]
```

### When
When my experiments are done! Oh, you meant when in time? Well, that is not up to me really :) Maybe in 2 weeks or maybe never :)

### Why
Right now, I just want to put my thoughts down on paper so to speak.
Still, here are some imaginary use cases:
 - transforming (bablify) javascript(s) from some cdn(s)
 - transforming and aggregating webservices
 - simple and extensible admin pages and other 'throw-away' webpages (landing pages, etc etc)

Again, more to come... :)

## Notes:
- When ready, move master (again). First commit: ab incunabulis ofc..


## More notes:
tasitc is a semi-tacit programming language.
A combinator combines an argument with the context.
The context is the result of the last operation.

When a function operates on the context it is by definition a combinator.
All context-less functions operate on the argument only.

`ifte [?, ?, '.'] | post --text '/tasitc/ns/core/list > ls`
`range [0, 100] | ls` expands to: `range [0, 100] | (ifte ['', '', '.'] | post --text '/tasitc/ns/core/list')` which posts '.' to '/tasitc/ns/core/list' a 100 times.

`filter < flatmap ifte [regex ?, [$], []]`

Other core combinators: `ifte`, `map`, `flatmap`, `id` (identity, returns whateer it had before), `reduce` (reduces context using the argument), `swap` (swaps argument and context with eachother), `ctxarg` (creates a new list argument that has the argument (first) then the context. useful to create a combinator out of a function), `argctx` (takes an argument and puts it in the context).

`ls | reduce concat $.path`
`ls | dup 'seed' | reduce concat $.path`

`[/google/drive/Spreadsheet | gsheet2json, psql "select email from users"] | reduce { name: $[0], email: $[1]} | html :ul map :li [:div $.email, :div $.name]`

`/google/drive/Spreadsheet | gsheet2json | psql "select * from users where email = $" | html :ul map :li [:div $.email, :div $.name]`

The main goal of tasitc is to aggregate http requests into a responses. The secondary goal of tasitc is to create purely functional and consistent shell experience. The tertiary goal is to create a language that grows, built around as few constructs as possible. 

Hypothesis:
- authors of (rest) endpoints are willing (and eager) to codify and document them
- many (most) web services aggregates (rest or db) endpoints and does little else
- authentication (managing and creating keys) is akward in a world where there are many (rest) endpoints.
- building good staging, development, production environments is still harder than it needs to be
- deploying is harder than it needs to be
- sharing internal web sites and the like in a team/company is harder than it needs to be
- tasitc is a good language/platform/way to aggregate, express and share endpoints

If these can be asserted then tasitc helps developers develop and deploy web services easier than before.
In that case, tasitc is valuable.

Why another language? Why not just use javascript or some other well known language?
Uhm... I am not sure. The idea came to me while thinking that it should be easier to get a landing page up and running. I didnt want a hosted WSIWYG, I find it easier and cleaner to write it myself. I wanted a precise way to handle this. A hosted WSIWYG was the only real alternative to writing it in node, which is what I ended up doing. However, I thought to myself: if there was a way to programming a landing page directly in the cloud I would have gone for it. After some thought, a bit of research and a lot of experiments tasitc is what I ended up with.


`/babel@6.1.0 ~/github/project@release/index.js > ./index.js`
`/scss { entry: ~/github/project@release/index.css, dir: ~/github/project@release } > ./index.css`
`[:h1 ['Welcome to my landing page'], :form [{ action: url ./newsletter}, :input 'Signup for newsletter']] > ./body`
`html [head [:script url /jquery/jquery@3.0.0], body [./body, :script { src: url ./index.js}] ] > index.html`
`./psql "insert into users values($.email)" | exists > get --url-encoded ./login`
`ln -r . ../staging`
`{ prod: false } > ../staging/env`
`ln -r . ../prod`
`{ prod: true } > ../prod/env`


## More thoughts
Could composition be a monoid?: x | (y | z) == (x | y) | z && $ | x == x && x | $ == x???

x | ($ | y | z) == (x | y) | $ | z


a b c === c | b | a == c | a b

Types... 


On requests:


/products/:id/:name

-products.tas:
$: { id: number, name: string }
../psql "select products where id = $.id and name = $.name"
$: [{ product: { id: number, name: string, email: string } }]

products.tas:
$$: get { path: /:(id: number)/:(name: string), params: { page: number } } | -products

$$: post { files: [1;] } | $.files | ../s3 ../images

../images.tas

$$: get { params: { w: number, h: number } } | imgx ../images

Use '$>' to define tas files?
