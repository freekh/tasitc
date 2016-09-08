#include "parser.h"
#include "stringify.h"

// private deps
#include "../mpc/mpc.h"
#include <assert.h>

static char* grammar = "                                                      \
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
    dicpath     : /[a-z0-9A-Z]+/;                                             \
                                                                              \
    ctx         : <symctx>(('.' <dicpath>) | ('[' <int> ']'))* ;              \
                                                                              \
    expr        : ( <form> <ws> <expr> | <form> | <path> <ws> <expr> |        \
                    <path> |  <ctx> | <symarg> | <vector> |  <dic> |          \
                    <string> | <number>) (<symtype> <ws> <type>)? ;           \
                                                                              \
    form        : '(' <wsopt> <expr> <wsopt> ')' ;                            \
                                                                              \
    composition : <expr> (<ws> <symcompose> <ws> <expr>)* ;                   \
                                                                              \
    vector      : '[' <wsopt> ']' | '[' <wsopt> <composition> <wsopt>         \
                  (',' <wsopt> <composition> <wsopt>)* ']';                   \
                                                                              \
    dickeyval   : <dicpath> <wsopt> ':' <wsopt> <composition>;                \
                                                                              \
    dic         : '{' <wsopt> <dickeyval>                                     \
                  (',' <wsopt> <dickeyval> <wsopt>)* <wsopt>'}';              \
                                                                              \
    type        : /[A-Z][a-zA-Z]*/( '(' <type> ')' )*;                        \
                                                                              \
    tasitc      : /^/ <composition> <wsopt> /$/ ;                             \
";

bool tasitc_mpc_skip_tag(mpc_ast_t* ast) {
  return strcmp("char", ast->tag) == 0 ||  strcmp("regex", ast->tag) == 0 || 
      strstr(ast->tag, "wsopt") || strstr(ast->tag, "ws");
}

void tasitc_repr_err(tasitc_repr_t* repr, char* msg, tasitc_error_type_e type) {
  tasitc_err_t *err = malloc(sizeof(tasitc_err_t));
  err->type = type;
  err->msg = malloc(strlen(msg) + 1);
  strcpy(err->msg, msg);

  repr->type = TASITC_ERROR;
  repr->val = malloc(sizeof(tasitc_repr_val_t));
  repr->val->err = err;
}

/*
** MPC AST converters
*/
void tasitc_mpc_convert(mpc_ast_t* ast, tasitc_repr_t* repr);

void tasitc_mpc_convert_dic_keyval(mpc_ast_t* ast, tasitc_dic_keyval_t* keyval) {
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t* child = ast->children[i];
    if (tasitc_mpc_skip_tag(child)) {
      continue;
    }
    if (strstr(child->tag, "dicpath")) {
      keyval->key = malloc(strlen(child->contents) + 1);
      strcpy(keyval->key, child->contents);
    } else {
      keyval->val = malloc(sizeof(tasitc_repr_t));
      tasitc_mpc_convert(child, keyval->val);
    }
  }
}

void tasitc_mpc_convert_dic(mpc_ast_t* ast, tasitc_repr_t* repr) {
  repr->type = TASITC_DICTIONARY;
  repr->val = malloc(sizeof(tasitc_repr_val_t));
  
  uint32_t size = 0;
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (!tasitc_mpc_skip_tag(child)) {
      size++;
    }
  }   
  
  tasitc_dic_t *dic = malloc(sizeof(tasitc_dic_t));
  repr->val->dic = dic;
  tasitc_dic_keyval_t** elems = malloc(sizeof(tasitc_dic_keyval_t) * size);
  dic->size = size;
  dic->elems = elems;

  uint32_t dic_idx = 0;
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (strstr(child->tag, "dickeyval")) {
      assert(dic_idx < size);
      elems[dic_idx] = malloc(sizeof(tasitc_dic_keyval_t));
      tasitc_mpc_convert_dic_keyval(child, elems[dic_idx]);
      dic_idx++;
    }
  }
}

void tasitc_mpc_convert_vec(mpc_ast_t* ast, tasitc_repr_t* repr) {
  repr->type = TASITC_VECTOR;
  repr->val = malloc(sizeof(tasitc_repr_val_t));

  uint32_t size = 0;
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (!tasitc_mpc_skip_tag(child)) {
      size++;
    }
  }   
  
  tasitc_vec_t *vec = malloc(sizeof(tasitc_vec_t));
  repr->val->vec = vec;
  tasitc_repr_t** elems = malloc(sizeof(tasitc_repr_t) * size);
  vec->size = size;
  vec->elems = elems;

  uint32_t vec_idx = 0;
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (!tasitc_mpc_skip_tag(child)) {
      assert(vec_idx < size);
      elems[vec_idx] = malloc(sizeof(tasitc_repr_t));
      tasitc_mpc_convert(child, elems[vec_idx]);
      vec_idx++;
    }
  }
}

void tasitc_mpc_convert_string(mpc_ast_t* ast, tasitc_repr_t* repr) {
  repr->type = TASITC_STRING;
  repr->val = malloc(sizeof(tasitc_repr_val_t));
  size_t len = strlen(ast->contents) - 2; //trim
  // TODO: mpc unescape
  repr->val->string = malloc(len + 1);
  strncpy(repr->val->string, ast->contents + 1, len);
  repr->val->string[len] = '\0';
}

void tasitc_mpc_convert(mpc_ast_t* ast, tasitc_repr_t* repr) {
  if (tasitc_mpc_skip_tag(ast)) {
    return;
  }
  
  if (strstr(ast->tag, "string")) {
    return tasitc_mpc_convert_string(ast, repr);
  } else if (strstr(ast->tag, "dic")) {
    return tasitc_mpc_convert_dic(ast, repr);
  } else if (strstr(ast->tag, "vector")) {
    return tasitc_mpc_convert_vec(ast, repr);
  }

  return tasitc_repr_err(repr, "Unexpected tag for parser", TASITC_PARSER_ERROR);
}

void tasitc_mpc_convert_root(mpc_ast_t* ast, tasitc_repr_t* repr) {
  assert(ast->children_num != 1 && strcmp(">", ast->tag) == 0);
  // TODO: iterate and find composition
  mpc_ast_t *root = ast->children[1];
  tasitc_mpc_convert(root, repr);
}

/*
** Parsers
*/
int tasitc_parse(const char *filename, const char *string, tasitc_repr_t *repr) {
  assert(false); //FIXME: NOT IMPLEMENTED
}

int tasitc_parse_file(const char *filename, FILE *file, tasitc_repr_t *repr) {
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

  mpc_parser_t* DicPath = mpc_new("dicpath");
  mpc_parser_t* Ctx = mpc_new("ctx");
  mpc_parser_t* Expr = mpc_new("expr");
  mpc_parser_t* Form = mpc_new("form");
  mpc_parser_t* Composition = mpc_new("composition");
  mpc_parser_t* Vector = mpc_new("vector");
  mpc_parser_t* DicKeyval = mpc_new("dickeyval") ;
  mpc_parser_t* Dic = mpc_new("dic");
  mpc_parser_t* Type = mpc_new("type");

  mpc_parser_t* Tasitc = mpc_new("tasitc");

  mpca_lang(MPCA_LANG_WHITESPACE_SENSITIVE, grammar,  
            Ws, WsOpt, Path, String, Number, Int, 
            SymCtx, SymArg, SymCompose, SymType, 
            DicPath, Ctx, Expr, Form, Composition, Vector,
            DicKeyval, Dic, Type, Tasitc);
  
  mpc_result_t ast_res;
  int res_val = -1;
  if (mpc_parse_contents(filename, Tasitc, &ast_res)) {
    mpc_ast_print(ast_res.output);
    tasitc_mpc_convert_root(ast_res.output, repr);
    mpc_ast_delete(ast_res.output);

    res_val = 0;
  } else {
    tasitc_repr_err(repr, "Parse error!", TASITC_PARSER_ERROR);
    mpc_err_print(ast_res.error);
    mpc_err_delete(ast_res.error);
    res_val = -1;
  }
  mpc_cleanup(20, 
              Ws, WsOpt, Path, String, Number, Int, 
              SymCtx, SymArg, SymCompose, SymType, 
              DicPath, Ctx, Expr, Form, Composition, Vector,
              DicKeyval, Dic, Type, Tasitc);
  return res_val;
}
