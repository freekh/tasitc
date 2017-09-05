#[derive(Clone, Debug)]
pub enum TokenType {
  TASExpr,
  TASDocs,
  TASLineEnd,
  TASDot, // .
  TASCom, // ,
  TASCtx, // $
  TASBar, // |
  TASCol, // :
  TASSel, // [
  TASSer, // ]
  TASKel, // {
  TASKer, // }
  TASPal, // (
  TASPar, // )
  TASSpace,
  TASGap,
  TASComment
}

#[derive(Clone, Debug)]
pub struct Token {
  pub token_type: TokenType,
  pub text: String,
  pub start: usize,
  pub end: usize
}

fn token_type(content: &String, start: usize, end: usize) -> Option<Token> {
  let string = content.to_owned(); // TODO: no idea if this is OK for perf
  if string.starts_with("{{") && string.ends_with("}}") {
    Some(Token {
      token_type: TokenType::TASDocs,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string.starts_with("##") && string.len() > 3 {
    Some(Token {
      token_type: TokenType::TASComment,
      text: string[2 .. string.len()].to_string(),
      start: start,
      end: end
    })
  } else if string == "\n" {
    Some(Token {
      token_type: TokenType::TASLineEnd,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == "|" {
    Some(Token {
      token_type: TokenType::TASBar,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == "$" {
    Some(Token {
      token_type: TokenType::TASCtx,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == "." {
    Some(Token {
      token_type: TokenType::TASDot,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == "," {
    Some(Token {
      token_type: TokenType::TASCom,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == ":" {
    Some(Token {
      token_type: TokenType::TASCol,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == "{" {
    Some(Token {
      token_type: TokenType::TASKel,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == "}" {
    Some(Token {
      token_type: TokenType::TASKer,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == "(" {
    Some(Token {
      token_type: TokenType::TASPar,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == ")" {
    Some(Token {
      token_type: TokenType::TASPal,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == "[" {
    Some(Token {
      token_type: TokenType::TASSel,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == "]" {
    Some(Token {
      token_type: TokenType::TASSer,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if string == " " {
    Some(Token {
      token_type: TokenType::TASSpace,
      text: content.clone(),
      start: start,
      end: end
    })
  } else if content.len() > 2 && content.trim().len() == 0 {
    Some(Token {
      token_type: TokenType::TASGap,
      text: content.clone(),
      start: start,
      end: end
    })
  } else {
    None
  }
}

pub struct TokenError {
  pub pos: usize
}

// TODO: replace String with str for perf
pub fn tokenize(string: &String) -> Result<Vec<Token>, TokenError> {
  let mut tokens: Vec<Token> = vec!();
  let mut curr_content = String::new();
  let mut curr_expr = String::new();
  let mut curr_start = 0;
  for (pos, char) in string.chars().enumerate() { // TODO: return iter instead
    curr_content.push(char);
    match token_type(&curr_content, curr_start, pos) {
      Some(token) => {
        if !curr_expr.is_empty() {
          tokens.push(Token {
            token_type: TokenType::TASExpr,
            start: curr_start,
            end: pos,
            text: curr_expr.clone()
          });
          curr_expr = String::new();
        }
        tokens.push(token);
        curr_content = String::new();
        curr_start = pos;
      }
      None => {
        curr_content = String::new();
        curr_expr.push(char);
      }
    }
  }
  
  let maybe_last_token = tokens.clone().pop();
  match maybe_last_token {
    Some(last_token) => {
      if last_token.end + 1 == string.len() {
        Ok(tokens.clone())
      } else {
        Err(TokenError {
          pos: last_token.end
        })
      }
    }
    None => {
      Ok(vec![])
    }
  }
}