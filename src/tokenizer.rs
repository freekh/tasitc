#[derive(Clone, Debug, PartialEq)]
pub enum TokenType {
  Sue, // some unknown expression
  Int, // 0-9
  Num, // 1.0, ...
  Doc, // #* *#
  New, // \n
  Hax, // #
  Bar, // |
  Dot, // .
  Com, // ,
  Ctx, // $
  Col, // :
  Sel, // [
  Ser, // ]
  Kel, // {
  Ker, // }
  Pal, // (
  Par, // )
  Gal, // <
  Gar, // >
  Tar, // *
  Doq, // "
  Soq, // '
  Sig, // ~
  Tis, // =
  Wut, // ?
  Bas, // \
  Fas, // /
  Hep, // -
  Lus, // +
  Ace, // <1+ space>
}

#[derive(Clone, Debug)]
pub struct Pos {
  file: usize,
  line: usize,
  column: usize,
}

#[derive(Clone, Debug)]
pub struct TokenContent {
  text: String,
  end: Pos,
}

impl Token {
  pub fn push_content(&mut self, c: char, pos: usize, line: usize, column: usize) {
    let content = match self.content.clone() {
      Some(content) => TokenContent {
        text: {
          let mut text = content.text;
          text.push(c);
          text
        },
        end: Pos {
          file: pos,
          line: line,
          column: column
        }
      },
      None => TokenContent {
        text: c.to_string(),
        end: Pos {
          file: pos,
          line: line,
          column: column
        }
      }
    };
    self.content = Some(content);
  }
}

#[derive(Clone, Debug)]
pub struct Token {
  token_type: TokenType,
  pos: Pos,
  content: Option<TokenContent>,
}

fn token_type(c: char) -> TokenType  {
  match c {
    '\n' => TokenType::New,
    '0' => TokenType::Int,
    '1' => TokenType::Int,
    '2' => TokenType::Int,
    '3' => TokenType::Int,
    '4' => TokenType::Int,
    '5' => TokenType::Int,
    '6' => TokenType::Int,
    '7' => TokenType::Int,
    '8' => TokenType::Int,
    '9' => TokenType::Int,
    '|' => TokenType::Bar,
    ',' => TokenType::Com,
    '$' => TokenType::Ctx,
    ':' => TokenType::Col,
    '[' => TokenType::Sel,
    ']' => TokenType::Ser,
    '{' => TokenType::Kel,
    '}' => TokenType::Ker,
    '(' => TokenType::Pal,
    ')' => TokenType::Par,
    '<' => TokenType::Gal,
    '>' => TokenType::Gar,
    '=' => TokenType::Tis,
    '+' => TokenType::Lus,
    '?' => TokenType::Wut,
    // valid sue chars:
    '.' => TokenType::Dot,
    '~' => TokenType::Sig,
    '/' => TokenType::Fas,
    '-' => TokenType::Hep,
    // slurps:
    '\\' => TokenType::Bas,
    '\'' => TokenType::Soq,
    '#' => TokenType::Hax,
    '*' => TokenType::Tar,
    '"' => TokenType::Doq,
    ' ' => TokenType::Ace,
    _ => TokenType::Sue,
  }
}

fn slurp_into_sue(token_type: TokenType) -> bool {
  token_type == TokenType::Sue || 
  token_type == TokenType::Dot || 
  token_type == TokenType::Fas || 
  token_type == TokenType::Hep 
}

pub fn tokenize(input: &str) -> Vec<Token> { // TODO: Vec => Iterator
  let mut tokens: Vec<Token> = vec!();

  let mut column = 0;
  let mut line = 0;

  let mut last_token = Token {
    token_type: TokenType::New,
    pos: Pos {
      file: 0,
      column, line
    },
    content: None,
  };

  let mut look_ahead_type: Option<TokenType> = None;

  for (pos, c) in input.chars().enumerate() {
    macro_rules! token {
      ( $token_type: expr) => {
        Token {
          pos: Pos {
            file: pos, 
            line, column
          },
          content: None,
          token_type: $token_type,
        };
      }
    }
    let token_type = token_type(c);
    match (token_type.clone(), look_ahead_type.clone(), last_token.token_type.clone()) {
      // Slurp Soq
      (TokenType::Soq, Some(TokenType::Bas), TokenType::Soq) => { // ignore escape
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None
      }
      (TokenType::Soq, _, TokenType::Soq) => {
        tokens.push(last_token.clone());
        last_token = token!(TokenType::New);
        look_ahead_type = None;
      }      
      (_, _, TokenType::Soq) => {
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      // Slurp Doq
      (TokenType::Doq, Some(TokenType::Bas), TokenType::Doq) => { // ignore escape
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None
      }
      (TokenType::Doq, _, TokenType::Doq) => {
        tokens.push(last_token.clone());
        last_token = token!(TokenType::New);
        look_ahead_type = None;
      }      
      (_, _, TokenType::Doq) => {
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      // Slurp Doc
      (TokenType::New, None, TokenType::Doc) => { // doc slurp pushed
        tokens.push(last_token.clone());
        last_token = token!(TokenType::New);
        look_ahead_type = None;
      }
      (TokenType::Hax, Some(TokenType::Tar), TokenType::Doc) => { // doc slurp after
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      (_, _, TokenType::Doc) => {
        last_token.push_content(c, pos, line, column);
        look_ahead_type = Some(token_type);
      }
      (TokenType::Tar, _, TokenType::Hax) => { // doc slurp starts
        last_token = Token {
          pos: last_token.pos,
          content: last_token.content,
          token_type: TokenType::Doc,
        };
        last_token.push_content(c, pos, line, column);
        look_ahead_type = Some(token_type);
      }
      // Slurp Hax (comment)
      (TokenType::New, _, TokenType::Hax) => { // hax slurp ends
        tokens.push(last_token);
        last_token = token!(TokenType::New);
        look_ahead_type = None;
      }
      (TokenType::Hax, _, _) => {
        tokens.push(last_token);
        last_token = token!(TokenType::Hax);
        last_token.push_content(c, pos, line, column);
        look_ahead_type = Some(token_type);
      }
      (_, _, TokenType::Hax) => {
        last_token.push_content(c, pos, line, column);
        look_ahead_type = Some(token_type);
      }
      // Escapes
      (TokenType::Bas, Some(TokenType::Bas), _) => { // escape escape
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      (TokenType::Bas, _, _) => { // escape
        look_ahead_type = Some(TokenType::Bas);
      }
      // Slurps Int into Num
      (TokenType::Dot, _, TokenType::Int) => {
        last_token = Token {
          pos: last_token.pos,
          content: last_token.content,
          token_type: TokenType::Num
        };
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      (TokenType::Int, _, TokenType::Num) => {
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      // Slurps Int
      (TokenType::Int, _, TokenType::Int) => {
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      (TokenType::Int, _, _) => {
        tokens.push(last_token.clone());
        last_token = token!(token_type);
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      // Slurps Ace
      (TokenType::Ace, _, TokenType::Ace) => {
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      (TokenType::Ace, _, _) => {
        tokens.push(last_token.clone());
        last_token = token!(TokenType::Ace);
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      // Slurps Sue
      (_, _, TokenType::Sue) => {
        if slurp_into_sue(token_type.clone()) {
          last_token.push_content(c, pos, line, column);
        } else {
          tokens.push(last_token.clone());
          last_token = token!(token_type);
        }
        look_ahead_type = None;
      }
      (TokenType::Sue, _, _) => {
        tokens.push(last_token.clone());
        last_token = token!(token_type);
        last_token.push_content(c, pos, line, column);
        look_ahead_type = None;
      }
      //
      _ => {
        tokens.push(last_token);
        last_token = token!(token_type);
        look_ahead_type = None;
      }
    }
    if c == '\n' {
      line += 1;
      column = 0;
    } else {
      column += 1;
    }
  }
  tokens.push(last_token);
  tokens
}