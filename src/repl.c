#include <stdio.h>
#include <stdlib.h>

#include <editline/readline.h>
#include <string.h>

#include "../mpc/mpc.h"

#define HISTORY ".tasitc.repl.history"

int main(int argc, char** argv) {
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
  mpc_parser_t* Composition = mpc_new("composition");
  mpc_parser_t* Vector = mpc_new("vector");
  mpc_parser_t* Obj = mpc_new("obj");
  mpc_parser_t* Type = mpc_new("type");
  mpc_parser_t* Tasitc = mpc_new("tasitc");

  // grammar:
  mpca_lang(
            MPCA_LANG_DEFAULT, 
            "                                                                 \
    path        : /[\\/~a-z]+/ ;                                              \
    string      : /'(\\\\.|[^'])*'/ ;                                         \
    number      : /[0-9]+(\\.[0-9]+)?/ ;                                      \
    int         : /[0-9]+/ ;                                                  \
    symctx      : '$' ;                                                       \
    symarg      : '?' ;                                                       \
    symcompose  : '|' ;                                                       \
    symtype     : ':' ;                                                       \
    objpath     : /[a-z0-9A-Z]+/;                                             \
    ctx         : <symctx>(('.'<objpath>) | ('['<int>']'))* ;                 \
    expr        : (<path> <expr> | <path> | <ctx> | <symarg> | <vector> |     \
                   <obj> | <string> | <number>) (<symtype> <type>)? ;         \
    composition : <expr> (<symcompose> <expr>)* ;                             \
    vector      : '[' <composition> (',' <composition>)* ']';                 \
    obj         : '{' (<objpath>) ':' (<composition>) '}';                    \
    type        : /[A-Z][a-zA-Z]*/( '(' <type> ')' )*;                        \
    tasitc      : /^/ <composition> /$/ ;                                     \
   ",  Path, String, Number, Int, 
       SymCtx, SymArg, SymCompose, SymType, 
       ObjPath, Ctx, Expr, Composition, Vector, Obj, Type, Tasitc);
  
  if (argc == 2) {
    const char* path = argv[1];
    FILE* file = fopen(path, "r");
    mpc_result_t r;

    if (mpc_parse_file(path, file, Tasitc, &r)) {

      mpc_ast_print(r.output);
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
