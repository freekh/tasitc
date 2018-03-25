We want an ambigious grammar, i.e. we do not want to only provide trees of the first matching choice, because it does not describe languages in well.
However, we want to have a grammar that feeds into another semantics system, in our case: the AST.

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
