# The dream:
Imagine: a grammar that works for all known languages (CFG), 
It discards parse nodes based on type semantics, even from type inference.
It is immutable and cachable - it is incremental! It works on persistent datastructures, it even shares cached data, making it possible to stream data through it. It is fully multi-threadable (or what was the word?), even uses the GPU if available.
It takes ropes and buffers and creates a stream of rules and AST nodes.
Since it is reactive it makes it possible to plugin any semantics one might want.
It is written in a Rust macro giving type safety.
It has a helper lib making it possible to output to LLVM.

# Getting there:

To achieve this we want an ambigious grammar, i.e. we do not want to only provide trees of the first matching choice, because it does not describe languages well. A grammar is based on rules. The rules should map to a rope string, which so that partial ASTs can be regenerated.

However, we want to have a grammar that feeds into another semantic system, in our case: the AST.
A constraint we can work with is that all ASTs have a rule, but not all rules have an AST.

In tas this would look like this:

```
parse { # multiple results
  foo: letters+ / float / bool,
}
ast [ # fails if more than one
  case foo: program,
  ...
]
llvm/ir {
  program: fn body,
  body: cond if else,
  if: ...
  else: ...
}
llvm/execute { # or compile
  
}
```


actor [
   
]


## Take 5
We want a grammar that's incremental from the ground up.

If we could make this consist of only 3 leaf nodes of rules and in the AST: 
{
  foo: true,
  foo1: true,
  foo2: false,
  foo3: true,
  foo4: false,
  foo5: true,
}
We could possibly improve how parsing is done.

Effecient type checking means less AST nodes.

Result of parsing should have a size << than the input in most scenarios where we have lots of repeating structures (i.e. the common case).
Being able to use immutable structures that can be cached and invalidation is the key.