

https://tasitc.com/freekh/test?path=Test


ls ?path > freekh/test
freekh/test --path='.'

expose 'get' freekh/test







-> execute
->

http://worrydream.com/refs/Backus-CanProgrammingBeLiberated.pdf

An alternative functional style of programming is founded on the use of combining forms for creating programs. Functional programs deal with structured data, are often nonrepetitive and nonrecursive, are hierarchically constructed, do not name their arguments, and do not require the complex machinery of procedure declarations to become generally applicable. Combining forms can use high level programs to build still higher level ones in a style not possible in conventional languages.

Function-level

foo is the function ls composed of map

`ls | map`

Referential transparency
if foo equals bar I can replace foo with bar in a larger program (possibly composed of foo's and bar's)


An important aspect: you cannot compute anything inside of tasitc. You can only create functions.
All 
These functions will only be executed on a request.  You can only create functions which will be run by the runtime. `request` is the exception to this rule, it defines a `pure type`, a type which will either be transformed or part of a union of other types as in the result response.


Desire: I want to prove that for any request to this URI, there can never be a response of any other type than 300, Json{name: enumeration, name2: string} Union 404 Json{error: msg}q
