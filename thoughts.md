
case class Dog(val age: int)
Vector[Dog]

: vec { age: int }



| parse/vec (parse {
  age: int
}) | map $.age

vec == parse "[" ? "]"


: vec({ age:  int })


Language design:

Built of two parts: the parser and a way to reduce the parse results to other results


compile (
  parse {
     ...haskell
  }
  reduce (
    ?.
  `)
)

psql/exec (?: psql/sql-grammar) | psql/parse

{
  select: "select " expr " from " table
} & psql/generate-grammar -c psql://localhost > ./my-table

psql ?: ./mytable  > ./psql

./psql "select * from users" # tabbing is supported here...



a <|> b <|> c