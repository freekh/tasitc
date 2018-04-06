We want an ambigious grammar, i.e. we do not want to only provide trees of the first matching choice, because it does not describe languages well. A grammar is based on rules. The rules should map to a rope string, which so that partial ASTs can be regenerated.

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

If we could make this AST consist of only 3 leaf nodes: 
{
  foo: true,
  foo1: true,
  foo2: false,
  foo3: true,
  foo4: false,
  foo5: true,
}

Effecient type checking means less AST nodes.

Result of parsing should have a size << than the input in most scenarios where we have lots of repeating structures (i.e. the common case).
Being able to use immutable structures that can be cached and invalidation is the key.