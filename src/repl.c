// c99
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// static deps
#include <editline/readline.h>

// source deps
#include "../mpc/mpc.h"

// tasitc deps 
#include "eval.h"

//
#define HISTORY ".tasitc.repl.history"

int main(int argc, char** argv) {
  mpc_parser_t* Ws = mpc_new("ws");
  mpc_parser_t* WsOpt = mpc_new("wsopt");

  mpc_parser_t* Path = mpc_new("path");
  mpc_parser_t* String = mpc_new("string");
  mpc_parser_t* Number = mpc_new("number");
  mpc_parser_t* Int = mpc_new("int");
  mpc_parser_t* SymCtx = mpc_new("symctx");
  mpc_parser_t* SymArg = mpc_new("symarg");
  mpc_parser_t* SymCompose = mpc_new("symcompose");
  mpc_parser_t* SymType = mpc_new("symtype");
  mpc_parser_t* ObjPath = mpc_new("objpath");
  mpc_parser_t* Ctx = mpc_new("ctx");
  mpc_parser_t* Expr = mpc_new("expr");
  mpc_parser_t* Form = mpc_new("form");
  mpc_parser_t* Composition = mpc_new("composition");
  mpc_parser_t* Vector = mpc_new("vector");
  mpc_parser_t* ObjPair = mpc_new("objpair") ;
  mpc_parser_t* Obj = mpc_new("obj");
  mpc_parser_t* Type = mpc_new("type");
  mpc_parser_t* Tasitc = mpc_new("tasitc");

  // grammar:
  mpca_lang(
            MPCA_LANG_WHITESPACE_SENSITIVE,
            "                                                                 \
    ws          : /[ \n\r\t]+/ ;                                              \
    wsopt       : /[ \n\r\t]*/ ;                                              \
                                                                              \
    path        : /[\\/~a-z]+/ ;                                              \
    string      : /'(\\\\.|[^'])*'/ ;                                         \
                                                                              \
    number      : /[0-9]+(\\.[0-9]+)?/ ;                                      \
    int         : /[0-9]+/ ;                                                  \
                                                                              \
    symctx      : '$' ;                                                       \
    symarg      : '?' ;                                                       \
    symcompose  : '|' ;                                                       \
    symtype     : ':' ;                                                       \
                                                                              \
    objpath     : /[a-z0-9A-Z]+/;                                             \
                                                                              \
    ctx         : <symctx>(('.' <objpath>) | ('[' <int> ']'))* ;              \
                                                                              \
    expr        : ( <form> <ws> <expr> | <form> | <path> <ws> <expr> |        \
                    <path> |  <ctx> | <symarg> | <vector> |  <obj> |          \
                    <string> | <number>) (<symtype> <ws> <type>)? ;           \
                                                                              \
    form        : '(' <wsopt> <expr> <wsopt> ')' ;                            \
                                                                              \
    composition : <expr> (<ws> <symcompose> <ws> <expr>)* ;                   \
                                                                              \
    vector      : '[' <wsopt> ']' | '[' <wsopt> <composition> <wsopt>         \
                  (',' <wsopt> <composition> <wsopt>)* ']';                   \
                                                                              \
    objpair     : <objpath> <wsopt> ':' <wsopt> <composition>;                \
                                                                              \
    obj         : '{' <wsopt> <objpair>                                       \
                  (',' <wsopt> <objpair> <wsopt>)* <wsopt>'}';                \
                                                                              \
    type        : /[A-Z][a-zA-Z]*/( '(' <type> ')' )*;                        \
                                                                              \
    tasitc      : /^/ <composition> <wsopt> /$/ ;                             \
   ",  Ws, WsOpt, Path, String, Number, Int, 
       SymCtx, SymArg, SymCompose, SymType, 
       ObjPath, Ctx, Expr, Form, Composition, Vector,
       ObjPair, Obj, Type, Tasitc);
  
  if (argc == 2) {
    const char* path = argv[1];
    FILE* file = fopen(path, "r");
    mpc_result_t r;

    if (mpc_parse_file(path, file, Tasitc, &r)) {
      mpc_ast_print(r.output);
      tasitc_res_t *res = eval(r.output);
      if (res->type == TASITC_ERROR) {
        printf("ERROR! %s\n", res->val->error->msg);
      } else if (res->type == TASITC_STRING) {
        printf("STRING: %s\n", res->val->str);
      } else if (res->type == TASITC_VECTOR) {
        printf("VECTOR:");
        tasitc_vector_print(res->val->vec);
      } else if (res->type == TASITC_OBJECT) {
        printf("OBJECT:");
        tasitc_obj_print(res->val->obj);
      }

      mpc_ast_delete(r.output);
    } else {
      mpc_err_print(r.error);
      mpc_err_delete(r.error);
    }
  } else {
    puts("The Amazing Shell In The Cloud (tasitc) - Mark 2 - Version 0.1");

    char *prompt = "_> ";
    char *input;

    read_history(HISTORY);
    while ((input = readline(prompt)) != NULL) {
      add_history(input);
    
      //
      mpc_result_t r;
      if (mpc_parse("<stdin>", input, Tasitc, &r)) {
        mpc_ast_print(r.output);
        mpc_ast_delete(r.output);
      } else {
        mpc_err_print(r.error);
        mpc_err_delete(r.error);
      }
      //
      free(input);
    }
    write_history(HISTORY);

    // cleanup mpc:
    // TODO: mpc_cleanup(4, Path, Ctx, Expr, Tasitc);
  }

  return 0;
}
