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

recursion/loops with alternative ifte syntax?:
let { count: 0 }             : extends { ...?, count: number }
loop $.count < 100           : loops extends { count: number }
cons (                       : stream (string || empty)
  if mod $.count == 15       : if requires { count: == number }
  ['FizzBuzz']               : if requires { count: == number } | stream string
  else mod $.count == 5      : if requires { count: == number } | stream string
  ['Fizz']                   : ...
  else mod $.count == 3
  ['Buzz']
  else
  []                         : if requires { count: == number } | stream empty
)                            : requires { count: == number } | stream (string || empty)
recur $.count + 1            
$ > fizzbuzz.tas             : $ | stream (string || empty)

let { count: 0 } | loop | if $.count == 100 | [] | cons (if mod $.count == 15 | ['FizzBuzz'] | if mod $.count == 5 ['Fizz'] | if mod $.count == 3 | ['Buzz'] | []) | recur $.count + 1

loop ? | cons aka 'loop-cons'

Ideas on 'variables'

let { max: 100 }
let { count : 0 }
loop
if $.count == $.max
[]
else
cons (
  if mod $.count == 15
  ['FizzBuzz']
  else mod $.count == 5
  ['Fizz']
  else mod $.count == 3
  ['Buzz']
  else
  []
)
recur $.count + 1

should this be possible?
let { count : 0 }
let { count : $.count + 1 }

exceptions
there is none. | will only "execute" on 2xx responses. it is possible to handle a non 2xx with:
catch (handle $) 

$.count : requires { count: ? } | ?
map $.count : stream requires { count: ? } | stream ?
map ($.count: number) : stream requires { count: number } | stream number
map $.count + 1 : stream requires { count: + number } | stream number
map $.count - 1 : stream requires { count: - number } | stream number
map $.count - [1] : stream requires { count: - stream number } | stream stream number
fmap $.count - [1] : stream requires { count: - stream number } | stream number