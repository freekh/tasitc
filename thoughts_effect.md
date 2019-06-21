# Type system
So the general idea here is to find ways of making strict type systems easier to get started with.

Now, what are the problems one face with strict type systems?

The ML-style languages I have the most experience with, Haskell, or its more streamlined cousin PureScript, are arguably nice languages to work with once you get the hang of them, but the learning curve is, or was at least for me, exceedingly steep.

So let's try to understand what makes them hard to get started with.

First of all, it's the syntax, which is different from what most programmers are used to.
Now, what is cool in ML languages is the syntax really lends itself particularly well to type inference.

In lim, what I aim to achieve is to have a compiler and runtime that really never needs any types to work.
One could claim that this is what is nice with dynamically, gradually or loosely typed languages.
What lim does differently, however, is that everyting has a generic type. The type system in general works with constraints.
You can add constraints to any part of your code. Typescript this approach is common. You take untyped JS and make it more safe.

However, the problem here is that you now have partially well-typed parts of your code.
What if you had a way to globally apply rules, like a linter, to what level of strictness your program should be at.
If this was integrated in the language, you could even have different levels of strictness in different parts of the program.

This is the main motivation of lims effect system.

# Effect system
Here some snippets of hello world progressing from completely inferenced types:
```lim
# valid code
main = println "hei"
```
To declared types:
```lim
# also valid
main :: Unit 
main = println "hei"
```
Then to something that considers the effects:
```lim
# accept all IO effects
main :: Unit ~ IO
main = println "hei"
```
Then finally to a compile error:
```lim
# accept only pure effects (fails to compile)
main :: Unit ~ Pure
main = println "hei"

# Problems:
# Incompatible effects:
#
# Effect console.Write is not of effect std.effects.Pure:
# 1: main :: Unit ~ Pure
#                   ^^^^------
# 2: main = println "hei"    |
#           ^^^^^^^          |
#           |> console.Write | 
#         std.effects.Pure  <|
#           
# Fix: Replace Pure with console.Write or omit it.
#
# More info: https://lim-lang/v/1.0.0/errors/12345
```

So the idea here, in general, is to replace Haskell/Purescripts monads with declarative effects.

One might ask why? The idea is to help programmers form an intuition for the language, letting them experiment with their domain, their problem, and then later once, motivated handle.

Note that it is obviously to combine both approaches. In order, to make sure that monads does not leak into the ecosystem, there needs to be something that holds it in check. Maybe, guides explaining that this is not idomatic is enough but if one looks at Scala one would not be amiss to be sceptical to exactly that.

Other effects more traditional exceptions, like:
```lim
test :: List a -> a ~ std.collection.NoElement
test lst = head list
```

If would be cool if this example above could somehow be tied to refinement types, so that the error is:
```lim
# fails:
main = test [1] ~ Pure

# Problems:
# Incompatible effects:
#
# Effect std.collection.NoElement is not std.effects.Pure:
# 1: main = test [1] ~ Pure
#           ^^^^       ^^^^------------|
#           |>std.collection.NoElement | 
#                     std.effects.Pure<|
# Because:
# test :: List a -> a ~ std.collection.NoElement          
# 
# Fix: Replace Pure with std.collection.NoElement or List with NonEmptyList
#
# More info: https://lim-lang/v/1.0.0/errors/12345
```
Granted, in the example above it would be cool if there is no head that accepts List only NonEmptyList.

There's also the possibility to take it further:
Imagine that lim is not only GCed but also have move semantics. GC could be an effect of its own, and so could Move or Deref or whatever.
You could also have effects for interpreted language. For Rust you could rust.mem.Unsafe for example and etc etc.
I think you can add these later.

In addition, how about saying that an effect or class of effects should NOT be present:
```lim
my_pure :: Int -> Int ~ [IO, !rust.mem.Unsafe]
```

# Compiler errors
It would be cool if you could have compiler errors that looked like stack traces.
Perhaps like this?

```lim
test :: List a -> a ~ NoElement
test lst = head lst

test2 lst = test lst

main = test2 [1] ~ Pure

# Incompatible effect here:
# 6: main = test2 [1] ~ Pure
#
# Because test2 ~ NoElement which is not Pure:
# 
# test2 has signature:
# test2 :: List a -> a ~ NoElement
# test2 lst = test lst
#
# Based on:
# test :: List a -> a ~ NoElement
#
# Fix: ...
# More info: ...
```

Not quite there? Needs a bit more of that stack tracy nature. Could be exactly like a thrown exception? But there is more than one place it is called from so it is tricky how to represent it...

Also want to utilize the incremental parsing for error messages.

```
# Changes in error output since last success:
# 6: main = test2 [1] ~ Pure
#                    +++++++
```

# Type checking and parsing...

```lsh
curl https://test.sh/api :: Stream Byte | decode-json | head | $.foo  # type after decode-json must be List { a | foo :: Json } where enum Json = JString | JNumber | JBool | JNull | JArray | JObject
curl https://test.sh/api | decode-json | head | $.foo :: String  # type after decode-json must be List { a | foo :: String } and there is a show :: Json -> String
```