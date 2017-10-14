use std::collections::{ HashMap };

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

macro_rules! grammar {
  ( $cont:expr, $tpe:expr, ( $($pat:tt)* )+ ) => {
    // $cont.push('(');
    grammar!($cont, $tpe, $($pat)*);
    // $cont.push(')');
    // $cont.push('+');
  };
  ( $cont:expr, $tpe:expr, ( $($pat:tt)* )* ) => {
    // $cont.push('(');
    grammar!($cont, $tpe, $($pat)*);
    // $cont.push(')');
    // $cont.push('+');
  };
  ( $cont:expr, $tpe:expr, [$y:ident] ) => {
    // $cont.push_str(stringify!($y));
  };
  ( $cont:expr, $tpe:expr, [$y:expr] ) => {
    // $cont.push_str($y);
  };
  //
  ( $cont:expr, $tpe:expr, [$x:ident] || $($y:tt)* ) => {
    // $cont.push_str(stringify!($x));
    // $cont.push_str(" || ");
    grammar!($cont, $tpe, $($y)*);
  };
  ( $cont:expr, $tpe:expr, [$x:expr] || $($y:tt)* ) => {
    // $cont.push_str($x);
    // $cont.push_str(" || ");
    grammar!($cont, $tpe, $($y)*);
  };
  //
  ( $cont:expr, $tpe:expr, slurp($start:expr, $end:expr) ) => {
    // $cont.push_str(" slrup ");
  };
  ( $cont:expr, $tpe:expr, [$x:ident] && $($y:tt)* ) => {
    // $cont.push_str(stringify!($x));
    // $cont.push_str(" && ");
    grammar!($cont, $tpe, $($y)*);
  };
  ( $cont:expr, $tpe:expr, [$x:expr] && $($y:tt)* ) => {
    // $cont.push_str($x);
    // $cont.push_str(" && ");
    grammar!($cont, $tpe, $($y)*);
  };
  ( $( $tpe:ident => ( $($pat:tt)* ), transient=$transient:expr; )* )=> {{
    let mut cont: HashMap<&str, &str> = HashMap::new();
    $(
      cont.insert(stringify!($tpe), "");
      // cont.push_str("->");
      grammar!(cont, stringify!($tpe), $($pat)*);
      // cont.push_str("<-");
    )*
    cont
  }};
}


pub fn parse_string(input: &str) {
  
  // let g = grammar! [
  //   tas_num => ([tas_int] && ["."] && [tas_int]), transient=false;
  //   tas_int => ((["1"] || ["2"])+), transient=false;
  // ];
  println!("{:?}", g);
}

  // let g = grammar! [
  //   tas_num => (tas_int then "." then tas_int), transient=false;
  // ];

