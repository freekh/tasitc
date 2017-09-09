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
  Ace, // <1 space>
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

macro_rules! reset {
  ( $tokens: expr, $peek_prev_type: expr, $last_token: expr, $pos: expr, $line: expr, $column: expr) => {
    $peek_prev_type = None;
    $last_token = Token {
      token_type: TokenType::New,
      pos: Pos {
        file: $pos,
        line: $line,
        column: $column,
      },
      content: None,
    };
  }
}

macro_rules! bump {
  ( $c: expr, $peek_prev_type: expr, $last_token: expr, $pos: expr, $line: expr, $column: expr) => {
    $last_token.push_content($c, $pos, $line, $column);
    $peek_prev_type = Some(token_type($c));
  }
}

fn valid_sue_token(token_type: TokenType) -> bool {
  token_type == TokenType::Sue || 
  token_type == TokenType::Dot || 
  token_type == TokenType::Sig || 
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

  let mut peek_prev_type: Option<TokenType> = None;

  for (pos, c) in input.chars().enumerate() {
    let token_type = token_type(c);
    match (token_type.clone(), peek_prev_type.clone(), last_token.token_type.clone()) {
      // Slurp Doc
      (_,  Some(TokenType::Tar), TokenType::Doc) => { // doc slurp ends
        if token_type == TokenType::Hax {
          tokens.push(last_token);
          reset!(tokens, peek_prev_type, last_token, pos, line, column);
        } else {
          bump!(c, peek_prev_type, last_token, pos, line, column);
        }
      }
      (_, _, TokenType::Doc) => {
        bump!(c, peek_prev_type, last_token, pos, line, column);
      }
      (TokenType::Tar, _, TokenType::Hax) => { // doc slurp starts
        last_token = Token {
          pos: last_token.pos,
          content: None,
          token_type: TokenType::Doc,
        };
      }
      // Slurp Hax (comment)
      (TokenType::New, _, TokenType::Hax) => { // hax slurp ends
        tokens.push(last_token);
        reset!(tokens, peek_prev_type, last_token, pos, line, column);
      }
      (_, _, TokenType::Hax) => {
        bump!(c, peek_prev_type, last_token, pos, line, column);
      }
      // Escapes
      (TokenType::Bas, Some(TokenType::Bas), _) => { // escape escape
        last_token.push_content(c, pos, line, column);
        peek_prev_type = None;
      }
      (TokenType::Bas, _, _) => { // escape
        peek_prev_type = Some(TokenType::Bas);
      }
      // Slurp Soq
      (TokenType::Soq, Some(TokenType::Bas), TokenType::Soq) => { // ignore escape
        last_token.push_content(c, pos, line, column);
        peek_prev_type = None
      }
      (TokenType::Soq, _, TokenType::Soq) => {
        tokens.push(last_token.clone());
        last_token = Token {
          pos: Pos {
            file: pos, 
            line, column
          },
          content: None,
          token_type: TokenType::New,
        };
      }      
      (_, _, TokenType::Soq) => {
        last_token.push_content(c, pos, line, column);
      }
      // Slurp Doq
      (TokenType::Doq, Some(TokenType::Bas), TokenType::Doq) => { // ignore escape
        last_token.push_content(c, pos, line, column);
        peek_prev_type = None
      }
      (TokenType::Doq, _, TokenType::Doq) => {
        tokens.push(last_token.clone());
        last_token = Token {
          pos: Pos {
            file: pos, 
            line, column
          },
          content: None,
          token_type: TokenType::New,
        };
      }      
      (_, _, TokenType::Doq) => {
        last_token.push_content(c, pos, line, column);
      }
      // Slurps Num
      (TokenType::Dot, _, TokenType::Int) => {
        last_token.push_content(c, pos, line, column);
        last_token = Token {
          pos: last_token.pos,
          content: last_token.content,
          token_type: TokenType::Num
        };
      }
      (TokenType::Int, _, TokenType::Num) => {
        last_token.push_content(c, pos, line, column);
      }
      // Slurps Int
      (TokenType::Int, _, TokenType::Int) => {
        last_token.push_content(c, pos, line, column);
      }
      (TokenType::Int, _, _) => {
        tokens.push(last_token.clone());
        last_token = Token {
          pos: Pos {
            file: pos, 
            line, column
          },
          content: None,
          token_type: token_type,
        };
        last_token.push_content(c, pos, line, column);
      }
      // Slurps Sue
      (_, _, TokenType::Sue) => {
        if valid_sue_token(token_type.clone()) {
          last_token.push_content(c, pos, line, column);
        } else {
          tokens.push(last_token.clone());
          last_token = Token {
            pos: Pos {
              file: pos, 
              line, column
            },
            content: None,
            token_type: token_type,
          };
        }
      }
      (TokenType::Sue, _, _) => {
        tokens.push(last_token.clone());
        last_token = Token {
          pos: Pos {
            file: pos, 
            line, column
          },
          content: None,
          token_type: token_type,
        };
        last_token.push_content(c, pos, line, column);
      }
      //
      _ => {
        tokens.push(last_token);
        last_token = Token {
          pos: Pos {
            file: pos, 
            line, column
          },
          content: None,
          token_type: token_type,
        };
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
  tokens.remove(0);
  tokens
}