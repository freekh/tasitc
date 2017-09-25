## TODO
Only for my eyes, the syntax propositions...

### Destructuring:
There no variables only context so there's no point in assigning anything, 
but we can use desctructring to extract new contexts:

[{ne: {st: {value: 'hello'}}, 1] | [
  [ { ne: {st: {value: $ } } } ] => $ //matches, returns
  [ { }, $ ] && eq 1 => $ //matches, but pattern above is before
  $ => $ //default
]

{ne: {st: {value: 'hello'} } | [
  [ { ne: {st: {value: $ } } } ] => $
]

html [:ul 'hello'] | [
  html [:ul $] || html [:div $] => $ //returns hello for ul or div
]

ls | [
  [{ name: $ }] => 'first file, exactly one file in dir'
  [?, { name: $ }] => 'second file, exactly two files in dir'
  [?, { name: $ }, ?] => 'second file, X (X >= 2) files in dir'
  [$] => first element
  [?] => must be list?
]

TYPES: fn, cbn, stg, text, num, boolean, {}, [], html, js, css, mime
MIME: fn, cbn, stg: error!404 text/plain
MIME: text & num & boolean == text/plain
MIME: {} & [] == application/json
etc...

EFFECTS: pure, impure

```js
    // const text = 'ls ~ | div $.path';
    // const text = 'ls /freekh';
    // https://term.tasitc.com/tasitc/core/dom/div##foo [#foo]
    // https://api.tasitc.com/freekh/div
    // `ls |> :js { (ctx) => 'hello' + ctx.path }`
    // `css { div { color: red; } }`
    // `ls | :li.Elem $.path | html { :ul $ }`
    // `for [ls, :li]`; $[0] |> map $[1]
    // `ls |> map (:li $.path)`
    // `ls |> flatmap (:li [$.path])`
    // `ls |> reduce [0, concat]`
    // `html [ :style css { div { color: red; } }, ]` 
    // `html { :div [.foo]) }`;
    // `html :div ['test'])`;
    // `html :div [.foo 'test']`;
    // `html :div [{} 'test']`;
    // `html :div [.foo {}]`;
    // `html :div.foo [{} 'test']`;

    // ls |> {
    //   [ { path: 'path' }, ?] if (:gt (:len ?node.path) 10) => ?node.path
    //   ? => fail
    // }

    // ls |> transduce [map $.path, flatmap :li] ;;ls | $.path | :li
    // ls |> map $.path |> flatmap :span#char |> html > foo
    // ls |> map $.path | :span#char |> html > foo

    // mount (/github/freekh --account=(ls ~/.accounts/github |> $[0])) > ~/github
    // ln ~/github/tasitc/trees/release > ~/myapp/code
    // cd ~/myapp
    // hook [
    //   ./package.json
    //   :/js/lock ./package.json |> ifte [eq [$.sha1  ./lock |> $.sha1], $, ./lock]
    // ] > ./lock
    // hook [

    //   [./code/**.js, ./lock]
    //   /browersify { entry: ./code/index.js, babelify: true } |> /tgz
    // ] > ./main.js.tgz
    // expose main.js.tgz
    // html [
    //   :body [
    //     :div#entry.test
    //     :script (url ./main.js.tgz)
    //   ]
    // ] >> ./index.html
    // expose index.html
    // ALT:
    // html [
    //   :body [
    //     :ul (ls |> map (:li $.path))
    //   ]
    // ]
    // ls |> map (if [{ ?path }, 'nope'])
    // { ?path, foo: 'value' } |> if [(gt [len $, 10]), ]
    // [ ?one, ?two, ?rest ]

    //const text = `ls | map $.path | $[0] | ifte [contains 'freekh', $, 'nope'] | html`;
    //const text = `request /tasitc/core/ns/list > /tasitc/ns/ls`; // or request --get ?,  should it be possible to write request --verb='get' > /tasitc/requests/get
    //const text = `map > /mapalt`; //%{ } / %&
    //const text = `[ls, 'freekh'] | swap map ifte [$.path | contains, $.name, 'nope']`;
    // ls | map $.path | filter 'freekh'
    // filter => [$, 'freekh'] | flatmap ifte [$[0] | contains $[1], [$[0]], []]
    //const text = `$ | filter 'freekh'`;
    // const text= `[['hello'], ['world']] | flatmap`;
    const text = `[['hello'], ['world']] | flatmap $`;
    //const text = `foo < js ((context, argument) => { return context + argument; })`; // ls | map :foo 'yeah'
    // dup 0 eq | [ pop 1 ] | [ dup 1 - fac * ] | if > fac

    // map ifte [$ | contains ?.sql, [$], []] > filter
    // ls | filter 'freekh'
    // '/tasitc/ns/core/ls' | request --get ? > ls
    // ls | sort | map psql { sql: "select $.name from names" }
    // '/tasitc/db/psql' | request --credentials=(credentials 'psql') ?.sql
    //const text = `ls | map $.path | /freekh/filter 'zoo'`;
    //const text = `ls | map $.path | filter 'freekh'`;
    //const text = `ls | map ifte [$.path | contains 'freekh', :li $.name, 'nope'] | html`;
    //const text = `ls | map ifte [$.path | contains 'freekh', 'yes', 'nope']`;
    // const text = `ls | map :li $.name`;
    // ls |> [map, ifte [ge [(len $.path) 200], $.path, 'too long']]
    test.done();
```


App sceleton:
app/init ~/foo

({ h, requests, parameter }) => {
  return requests([
  ], (ctx, arg, parameters, [config, write, read]) => {
    const execute = ([], []) => {
    };

    const exit = () => {
    };

    return {
      docs: '',
      offline: false, // must be present && fails if offline: true and http(s) in scripts/styles
      scripts: [
        '',
      ],
      styles: [
        '',
      ],
      elements: [],
      execute,
      exit,
    };
  });
};


// anotehr day
max.tas
reduce (
  if $.acc > $.prev
  $.acc
  else
  $.prev
)

Monoidic?
({ a: 1 } | $.a) | $ + 1
the same as:
{ a: 1 } | ($.a | $ + 1)
?
expr
($.a | $ + 1) requires a and increments it (so increment must be present)

./index.tas
html [
  style css "
    .bold {
      font-weight: bold;
    }
  ",
  body [
    h1 'Example' | style { color: 'red' },
    div [
      span 'hello' | attrs { class: 'bold' },
      span 'world',
    ],
    (node 'marquee') 'Content',
    form [
      input | style { name: 'msg' }, # notice 'msg'
      input | attrs { type: 'submit' },
    ] | attrs { action: (url ./submit) }, # trailing comma
  ] # no trailing comma
] | content-type text/html

./submit.tas
val { # val means cannot overwrite rows, let means overwrite is ok?
  rows: ./psql (
    insert [$.msg] # notice 'msg'
    into   [messages/value]
    messages
  )
}
html [
  body [
    span (
      if $.rows / 0
      "Wrote '$.msg' to messages" | status 200 # | content-type text/html not needed html has this
      else
      { error: 'Weird but an example of how to change content type' } 
      content-type application/json # flows up
      status 500
    )
  ]
]: { content-type (text/html || application/json), status (200 || 500) }


--------

(
  h1
  style { color: 'red' }
) 'Example'

equivalent but not equal to:

h1 'Example'
style { color: 'red' }

equals:
h1 'Example' | style { color: 'red' }


----

()

html/body.tas
?: html/element
"<body>?</body>" <: html/element 

?: _
'<body/>' <: html/element

html/element.tas

?: (string || number || iter html/element) 
$: (html/style || html/attrs)


git merge --abort

div [(span 'yeah') (span 'blah')]

[
  { foo: 1 },
  { foo: 2 },
] | map $.foo