# TAS

TAS is a language aimed to make it easy to manipulate data.

Here's an example before we get started:

```tas
http/get https://tasitc.com/tas/date/now | await # this is a comment
http/json { now: { epoch: number } }
$.now.epoch
> ./now
```

You can run this in a REPL [here](https://repl.tasitc.com).

This creates a TAS command in `./now` which prints out the epoch according to tasitc.com, assuming it completes.

As you can see, a command can be composed of multiple expressions seperated by a new line or by a bar (`|`).
Every command in TAS represents a function. A function can take one argument (`?`) and a context (`$`). The `$` operator is the return value of the last expression:

```tas
1 | $ + 1
```

The example above is the **long form** expression of the equivalent, **tall form**, expression:

```tas
# the same in tall form:
1
$ + 1
```

You can mix and match long and tall forms as approriate.

You can create a function by using the `@` operator like this:

```tas
1 | $ + @ > ./one-plus
```

Which we can apply like this:

```tas
./one-plus 2 # yields 3
```

The `?` operator makes it possible to create lambdas like this:

```tas
[1,2,3] | map ? + 1
```

The `let` command lets you bind names to contexts and arguments:

```tas
[1,2,3] | map (
  let i = ?
  i + 1
)
```

`let` supports structural decomposition, meaning you can do things like this:

```tas
[{ age: 36 }] | map (
  let { age } = ?
  age
)
```

As `tas` is functional at its core, the `reduce` command is pretty central. Here's an example of how to use `reduce` to find a max in a vector.

```tas
[3,2,5,2] | reduce (
  let ( prev, curr ) = ? # reduce takes 2 arguments
  if (curr > prev) curr
  else prev
)
```

Interestingly conditionals are just built-in commands that takes 2 arguments.
TODO: more here

## Standard types


## Bind

Binding is a way to syntactically avoid nesting. We have already used an alias of it `await`, which does exactly the same thing.

Example:

```tas
let persons = http/get https://tasitc.com/freekh/examples/persons | bind | http/json [{ name: string, id: string }]
let emails =  http/get https://tasitc.com/freekh/examples/emails | bind | http/json [{ email: string, id: string }]
persons | reduce (
  let (prev, curr) = ?
  let email = emails | find (
    let { id } = ?
    id == curr.id
  )
  if (exists email) (
    [...prev, { ...curr, ...email }]
  ) else prev
)
```

## Shapes (i.e. types)

Types in TAS are represented a bit differently than in most other languages, being functional and not having type classes.
For example:

```tas
[1]: [int]
```

```tas
[@]: [@]
```

```tas
[?]: [?]
```

```tas
$: _ # implicit
@: ?
shape { hello: (?: @) } (
  { hello: @ }
) > foo

@: foo ?
shape [{value: @.hello }] (
  [{value: @.hello}]
) > bar

bar (foo 'world')
```

### Shapes

TODO

## Alias

TODO

## Effects

TODO: remove read, write, ... side is enough

A unique feature of TAS is effects, which describes side-effects (if any) that functions produces. The built-in effects in TAS are:

- `effect/pure`, a pure function i.e. referentially transparent (for a given context and set of arguments it will never change). A pure function can only composed of other pure or constant functions.
- `effect/constant`, a constant function is a function who's result will never change and has no arguments.
- `effect/read`, a function that reads from a source, i.e. result may change.
- `effect/write`, a function that writes to a source, i.e. side-effects something that will change if read later.
- `effect/read-write`, a function that reads and writes to a source.
- `effect/idempotent`, a function who will yield the same result everytime, but will write something.
- `effect/side`, is any unknown side-effect, such as writing to stdout or to a db.
- `effect/unknown`, self-explanatory: we do not know the effect of a function.

> NOTE: It is currently not possible to extend or change effects.

As with types, inference is used for effects. 
The most interesting effect is the `effect/constant` or `const` as its alias is named.

```tas
let hello: const str = "hello"
```

Writing a result to disk:
```tas
"hello" >  write ./hello.txt
```
This is different than:
```tas
"hello" > ./hello # file ending does not matter, it's just the for clarity
```

Which will create a TAS executable file.

TODO: why is this the default behaviour?

## Parsing

TAS is as mentioned before a data manipulation language. In the earlier examples we showed how to manipulate data within TAS' own data model (using normal functional constructions), but how do we get to well-formed data?

The answer is TAS' `parser` command. TODO: more here

## Using the REPL as a shell

TODO fix this section

TAS was made with the conviction of exploratory programming is the best way to create and manipulate data. This author believes that shells are the natural interface for many developers, thus TAS should work as a shell to be.

To use it as a shell, simply TODO

Later you can move around as per usual:
```tas
mkdir hello
cd hello
cd ..
cd ./hello
echo "1 + 1" > ./two
chmod +x ./two
./two
cat ./two | grep 1
```

### Arguments

TODO: this can't be the way to handle this

```tas
let long-arg { blah: string, foo: string } = @
```

TODO: explain
