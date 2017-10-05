/*
doc: slurp...,
soq: slurp...
doq: slurp...
exp_pa: ((ws('(') && ws(exp) && ws(')')) || exp),
spread: ' '* && "..." && sue,
obj_val: spread || sue || (sue && ws(':') && exp),
obj: ws('{') && (obj_val || (obj_val && ws(","))* && ws('}'),
exp: (exp_pa && ' '+ && "+" && ' '+ && exp_pa) || ((sue || int || num || soq || doq || obj || ite) && exp_pa*),
int: ('1' || ...) && ('0' || '1' || ..)*,
num: int && '.' && int+,
sue: 
bar:
wut:

test:
grammar![
  int => ("1" || "2")+,
].parse_string("12");

*/

struct int {

}

macro_rules! grammar {
  ( $cont:expr, ($y:expr) ) => {
    $cont.push($y);
  };
  ( $cont:expr, ($x:expr) || $($y:tt)* ) => {
    $cont.push($x);
    $cont.push_str(" || ");
    grammar!($cont, $($y)*);
  };
  ( $cont:expr, ($x:expr) && $($y:tt)* ) => {
    $cont.push($x);
    $cont.push_str(" && ");
    grammar!($cont, $($y)*);
  };
  ( $tpe:ty => ( $($pat:tt)* ); ) => {{
    let mut cont = String::new();
    grammar!(cont, $($pat)*);
    cont
  }};
}



pub fn parse_string(input: &str) {
  let g = grammar! {
    Int => (('1') || ('2') && ('4') || ('3'));
  };
  println!("{:?}", g);
  // grammar_rules!(('1') || ('2'));
}


