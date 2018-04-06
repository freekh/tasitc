# On constructing a typed csv parser
## Example CSV:

```
name;email;age;
fredrik;fredrik@gmail.com;36;
ingrid;ingrid@gmail.com;35;
```

## Parser
```
parse {
  (item: str) = (except ?.sep) & (except line/ends) & char)+
  row: str[] = (line/sep item ?.sep)
  rows = ({ headers: row } & { rows: row* })
} # 
let { headers, rows } = $
rows | map (
  let row = $
  { ...headers  } | zip-index | map (
    let ((k, _), i) = ?
    (k, row[i])
  )
): { [str]: str? }[] > some-seperated-values
```

## Usage
The parser, named some-seperated-values, takes an argument (the seperator), so we can create a new one, csv, like this:
```
some-seperated-values { sep => (';' | ',') } > csv
```

It could then be used like this:
```
curl https://download.com/csv | csv
valid { name: str, age: int, email: email }[] # validating types
filter ?.name == 'fredrik'
map (
  mailgun/send { email: ?.email, subject: 'Hello', text: "Dear {?.name}, you are: {?.age}" }
)
```

# Bootstrapping TAS
Create ohm parser for tas 0.0.1 and use llvm to create tas binary 0.0.1
tas binary has parser and evaluation support

```
# tas/parser <
grammar
# ./result because result is used for let, could have used result/.. directly if that was not the case 
let result = $: ({ error: { stack: ./result/error/stack } } | { success: ./result/val })
either result.error (
  result.expressions | reduce (
    let (result, expression) = ?
    either result.error (
      /tas/eval expression
    )
  ) ./result/success
)

# either <
if ?[0] (
  ?[0]
)
else ?[1]: ?[0] | ?[1]

# tas/eval <
let expr = $: expression

```