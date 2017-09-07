mod parser;
mod tokenizer;

use std::io::{self, Read};

fn main() {
	let mut buf = String::new();
  // TODO: clean up?
  match io::stdin().read_to_string(&mut buf) {
    Ok(_) => {
    	parser::parse(&buf.to_owned());
    }
    Err(why) => {
      panic!("Could not read from stdin: {}", why);
    }
  }
}