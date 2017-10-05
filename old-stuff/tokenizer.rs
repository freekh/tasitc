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
  pub file: usize,
  pub line: usize,
  pub column: usize,
}

#[derive(Clone, Debug)]
pub struct TokenContent {
  pub text: String,
  pub end: Pos,
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
  pub token_type: TokenType,
  pub pos: Pos,
  pub content: Option<TokenContent>,
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
    '~' => TokenType::Sig,
    // valid sue chars:
    '.' => TokenType::Dot,
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

  let mut look_ahead: Option<TokenType> = None; // TODO: feels unecessary

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
    match (&token_type, &look_ahead, &last_token.token_type) {
      // Slurp Soq
      (&TokenType::Soq, &Some(TokenType::Bas), &TokenType::Soq) => { // ignore escape
        last_token.push_content(c, pos, line, column);
      }
      (&TokenType::Soq, &None, _) => {
        tokens.push(last_token.clone());
        last_token = token!(TokenType::Soq);
        look_ahead = Some(TokenType::Soq);
      }
      (&TokenType::Soq, &Some(TokenType::Soq), &TokenType::Soq) => {
        look_ahead = None;
      }      
      (_, &Some(TokenType::Soq), &TokenType::Soq) => {
        last_token.push_content(c, pos, line, column);
      }
      // TODO: Slurp Doq
      // Slurp Doc
      (&TokenType::New, &None, &TokenType::Doc) => { // doc slurp pushed
        tokens.push(last_token.clone());
        last_token = token!(TokenType::New);
        look_ahead = None;
      }
      (&TokenType::Hax, &Some(TokenType::Tar), &TokenType::Doc) => { // doc slurp after
        last_token.push_content(c, pos, line, column);
        look_ahead = None;
      }
      (_, _, &TokenType::Doc) => {
        last_token.push_content(c, pos, line, column);
        look_ahead = Some(token_type);
      }
      (&TokenType::Tar, _, &TokenType::Hax) => { // doc slurp starts
        last_token = Token {
          pos: last_token.pos,
          content: last_token.content,
          token_type: TokenType::Doc,
        };
        last_token.push_content(c, pos, line, column);
        look_ahead = Some(token_type);
      }
      // Slurp Hax (comment)
      (&TokenType::New, _, &TokenType::Hax) => { // hax slurp ends
        tokens.push(last_token);
        last_token = token!(TokenType::New);
        look_ahead = None;
      }
      (&TokenType::Hax, _, _) => {
        tokens.push(last_token);
        last_token = token!(TokenType::Hax);
        last_token.push_content(c, pos, line, column);
        look_ahead = Some(token_type); // TODO: not needed?
      }
      (_, _, &TokenType::Hax) => {
        last_token.push_content(c, pos, line, column);
        look_ahead = Some(token_type); // TODO: not needed?
      }
      // Escapes
      (&TokenType::Bas, &Some(TokenType::Bas), _) => { // escape escape
        last_token.push_content(c, pos, line, column);
        look_ahead = None;
      }
      (&TokenType::Bas, _, _) => { // escape
        look_ahead = Some(TokenType::Bas); // TODO: check Bas outside Doq/Soq
      }
      // Slurps Int into Num
      (&TokenType::Dot, _, &TokenType::Int) => {
        last_token = Token {
          pos: last_token.pos,
          content: last_token.content,
          token_type: TokenType::Num
        };
        last_token.push_content(c, pos, line, column);
        look_ahead = None;
      }
      (&TokenType::Int, _, &TokenType::Num) => {
        last_token.push_content(c, pos, line, column);
        look_ahead = None;
      }
      // Slurps Int
      (&TokenType::Int, _, &TokenType::Int) => {
        last_token.push_content(c, pos, line, column);
        look_ahead = None;
      }
      (&TokenType::Int, _, _) => {
        tokens.push(last_token.clone());
        last_token = token!(token_type);
        last_token.push_content(c, pos, line, column);
        look_ahead = None;
      }
      // Slurps Ace
      (&TokenType::Ace, _, &TokenType::Ace) => {
        last_token.push_content(c, pos, line, column);
        look_ahead = None;
      }
      (&TokenType::Ace, _, _) => {
        tokens.push(last_token.clone());
        last_token = token!(TokenType::Ace);
        last_token.push_content(c, pos, line, column);
        look_ahead = None;
      }
      // Slurps Sue
      (_, _, &TokenType::Sue) => {
        if slurp_into_sue(token_type.clone()) {
          last_token.push_content(c, pos, line, column);
        } else {
          tokens.push(last_token.clone());
          last_token = token!(token_type);
        }
        look_ahead = None;
      }
      (&TokenType::Sue, _, _) => {
        tokens.push(last_token.clone());
        last_token = token!(token_type);
        last_token.push_content(c, pos, line, column);
        look_ahead = None;
      }
      //
      _ => {
        tokens.push(last_token);
        last_token = token!(token_type);
        look_ahead = None;
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