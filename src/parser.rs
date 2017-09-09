use tokenizer;

pub fn parse(input: &str) {
  for token in tokenizer::tokenize(input) {
    println!("{:?}", token);
  }
}