#[derive(Clone, Debug)]
pub enum TokenType {
  Start,
  Dot, // .
  Com, // ,
  Ctx, // $
  Bar, // |
  Col, // :
  Sel, // [
  Ser, // ]
  Kel, // {
  Ker, // }
  Pal, // (
  Par, // )
  Space,
  Gap,
  Docs,
  Comment,
  Expr,
  End
}

#[derive(Clone, Debug)]
pub struct TokenContent {
  text: String,
  pos_end: usize
}

#[derive(Clone, Debug)]
pub struct Token {
  token_type: TokenType,
  pos: usize,
  content: Option<TokenContent>,
}

enum TokenResult {
  Token(Token),
  Peek,
  Slurp(bool, TokenType)
}

fn eval(c: char, pos: usize, peek_chars: Vec<char>) -> TokenResult {
  match c {
    _ => TokenResult::Peek
  }
}

pub fn tokenize(input: &str) -> Vec<Token> { // TODO: Vec => Iterator
  let mut tokens: Vec<Token> = vec!();
  tokens.push(Token {
    token_type: TokenType::Start,
    pos: 0,
    content: None,
  });
  let mut slurp_token: Option<Token> = None;
  let mut peek_chars: Vec<char> = vec!();
  for (pos, c) in input.chars().enumerate() {
    // for each char: 
    //   - this is a token on it's own; or
    //   - we must peek; and either
    //      - convert chars and push as tokens; or
    //      - create a new token
    //   - we must start slurping until end slurp
    //     

    match (eval(c, pos, peek_chars.clone()), slurp_token) {
      (TokenResult::Token(token), None) =>
        tokens.push(token.clone()),
      (TokenResult::Peek, None) => {
        peek_chars.push(c);
      }
      (TokenResult::Slurp(stop, _), Some(token)) => {
        let slurp_content = match token.content {
          Some(curr) => {
            let mut text = curr.text;
            text.push(c);
            TokenContent {
              text: text,
              pos_end: pos,
            }
          }
          None => TokenContent {
            text: c.to_string(),
            pos_end: pos,
          }
        };
        let curr_token = Token {
          pos: token.pos,
          content: Some(slurp_content),
          token_type: token.token_type
        };
        if stop {
          tokens.push(curr_token);
        } else {
          slurp_token = Some(curr_token);
        }
      }
      (TokenResult::Slurp(stop, token_type, ), None) => {
        let content = Some(TokenContent {
          pos_end: pos,
          text: c.to_string(),
        });
        if stop {
          tokens.push();
        } else {
          slurp_token = Some(Token {
            pos: pos,
            content: content,
            token_type: token_type
          });
        }
      }
    }
    
  }
  tokens
}