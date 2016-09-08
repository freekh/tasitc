req --verb=get http://api.google.com?query=(?.query: String) | $: Json([{url: String}]) > ~/search

~/search --query=foo

expose --verb=get ~/search

https://api.tasitc.com/freekh/search?query=foo

transducers:
map regex ? | take 3 |: Transducer(String) > ~/grep

    Name
1)  foo
2)  bar
cols [split '  ',
'heading', { num: $.line + 1, (lowercase $.heading[1]): $[1]}] > 
[{name: 'foo', num: 1}, {name: 'bar', num: 2}]

matrix [' ', {
  persons: [name: A[1:/^$/]]
}]
