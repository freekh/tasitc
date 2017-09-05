use tokenizer;

pub fn parse(string: &String) {
  match tokenizer::tokenize(string) {
    Ok(tokens) => {
      for token in tokens {
        println!("{:?}", token);
      }
    }
    Err(token_err) => {
      println!("FAILED: unknown token: {}", token_err.pos);
    }
  }
}