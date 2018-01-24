## simple transform
http/get https://example.com?test=123 | await
$.body | check [{name: string}]
map ?.name | http/ok


## transform with types
http/get https://example.com?test=123 # : promise http/response
await # : http/response ({ status: int, body: [byte]})
$.body # { [byte] }
check [{ name: string }] # : [{ name: string }] 
map ?.name # : [string]
http/ok # : http/response 200 ([string]) TODO: something missing here?
: promise (http/response 200 ([string]))

## as html
http/get https://example.com?test=123 | await
http/parse [{name: string}] # an alternative
let names = $
html (
  head (
    # play with styles: use url here
    link { src: (".name { font-weight: bold }": css > ./styles.css | rel-url ) }
  )
  body (
    ul (
      names map (div ?  { class: "name" })
    )
  )
)
http/ok 
: promise (http/response 200 html)

## with error handling
do (
  http/get https://example.com?test=123 | await
  $.body | check [{name: string}] { exact: true } # exact is of course optional
  map ?.name
  http/ok # there is a to-string of vec, int, number, string, html, ... + a to-stream of [byte] in the http namespace
) catch (
  http/internal-error _
)
: promise (http/response 500 | (http/response 200 (json [string]))

## Implementation of http/response

let serialize = to-string . | to-stream . 
let [
  status: 200..510, 
  headers: { [str]: [string] },
  body: serialize # must exist to-string or to-stream implementation of ?[2]
] = ?

type {
  status,
  headers,
  body,
} > response

$: [string, response]

### This is not real of course - handled in tasitc
tasitc/socket/write "HTTP: $status" # bla bla bal
await
headers | foreach (
  let (key, values) = ?
  tasitc/socket/write "$key: "
  values | foreach (
    tasitc/socket/write (http/content-type ?)
  )
  await
)
tasitc/socket/write (serialize body)
await
