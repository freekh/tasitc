use tokenizer::{ tokenize, TokenContent, Token, TokenType, Pos };
use std::collections::{ VecDeque };

#[derive(Debug, Clone)]
struct AstPair {
  key: String,
  value: Option<AstNode>,
}

#[derive(Debug, Clone)]
struct AstExp {
  body: String,
  arg: Option<AstNode>,
}

#[derive(Debug, Clone)]
struct AstCtx {
  
}

#[derive(Debug, Clone)]
enum AstNode {
  Str(String),
  Obj(Vec<AstPair>),
  Exp(Box<AstExp>),
  Ctx(Box<AstCtx>),
}

pub fn parse(input: &str) {
  let mut stack: VecDeque<AstNode> = VecDeque::new();
  let mut curr_node: Option<AstNode> = None;

  let mut curr_obj_pair: Option<AstPair> = None;

  for token in tokenize(input) {
    let debug = token.content.unwrap_or(TokenContent {
      end: Pos {
        column: 0,
        line: 0,
        file: 0,
      },
      text: "".to_owned(),
    }).text;
    println!("{{ token_type: \"{:?}\", content: \"{}\" }},", token.token_type, debug);
    // match (&token.token_type, curr_node.clone()) {
    //   (&TokenType::New, _)=> {}
    //   (&TokenType::Sue, Some(AstNode::Obj(_))) => {
    //     match token.content {
    //       Some(content) => {
    //         curr_obj_pair = Some(AstPair {
    //           key: content.text.clone(),
    //           value: None, 
    //         });
    //       }
    //       _ => {}
    //     }
    //   }
    //   (&TokenType::Soq, Some(AstNode::Obj(_))) => {
    //     match curr_obj_pair {
    //       Some(pair) => {
    //         curr_obj_pair = Some(AstPair {
    //           key: pair.key.clone(),
    //           value: Some(AstNode::Str(token.content.unwrap().text)), 
    //         });
    //       }
    //       _ => {}
    //     }
    //   }
    //   (&TokenType::Kel, _) => {
    //     curr_node = Some(AstNode::Obj(vec![]));
    //     curr_obj_pair = None;
    //   }
    //   (&TokenType::Ker, Some(AstNode::Obj(pairs))) => {
    //     let mut up = pairs.clone();
    //     up.push(curr_obj_pair.clone().unwrap());
    //     stack.push_back(AstNode::Obj(up));
    //   }
    //   _ => {}
    // }
  }
  println!("{:?}", stack);
}