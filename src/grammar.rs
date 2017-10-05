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

struct int_ {

}

struct str_ {

}

macro_rules! grammar {
  ( $cont:expr, ( $($pat:tt)* )+ ) => {
    $cont.push('(');
    grammar!($cont, $($pat)*);
    $cont.push(')');
    $cont.push('+');
  };
  ( $cont:expr, ( $($pat:tt)* )* ) => {
    $cont.push('(');
    grammar!($cont, $($pat)*);
    $cont.push(')');
    $cont.push('+');
  };
  ( $cont:expr, [$y:ident] ) => {
    $cont.push_str(stringify!($y));
  };
  ( $cont:expr, [$y:expr] ) => {
    $cont.push_str($y);
  };
  //
  ( $cont:expr, [$x:ident] || $($y:tt)* ) => {
    $cont.push_str(stringify!($x));
    $cont.push_str(" || ");
    grammar!($cont, $($y)*);
  };
  ( $cont:expr, [$x:expr] || $($y:tt)* ) => {
    $cont.push_str($x);
    $cont.push_str(" || ");
    grammar!($cont, $($y)*);
  };
  //
  ( $cont:expr, slurp($start:expr, $end:expr) ) => {
    $cont.push_str(" slrup ");
  };
  ( $cont:expr, [$x:ident] && $($y:tt)* ) => {
    $cont.push_str(stringify!($x));
    $cont.push_str(" && ");
    grammar!($cont, $($y)*);
  };
  ( $cont:expr, [$x:expr] && $($y:tt)* ) => {
    $cont.push_str($x);
    $cont.push_str(" && ");
    grammar!($cont, $($y)*);
  };
  ( $( $tpe:ident => ( $($pat:tt)* ), transient=$transient:expr; )* )=> {{
    let mut cont = String::new();
    $(
      cont.push_str(stringify!($tpe));
      cont.push_str("->");
      grammar!(cont, $($pat)*);
      cont.push_str("<-");
    )*
    cont
  }};
}

pub fn parse_string(input: &str) {
  let g = grammar! [
    tas_docs => (slurp("#*", "*#")), transient=false;
    tas_str => ([tas_int] || ["1"]), transient=false;
    tas_int => ((["1"] || [tas_str])+), transient=false;
  ];
  println!("{:?}", g);
  // grammar_rules!(('1') || ('2'));
}


