#include "eval.h"
#include <string.h>

static tasitc_val_t* eval_objpair(mpc_ast_t *ast) {
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (strstr(child->tag, "objpath")) {
      printf("objpath: %s; ", child->contents);
    } else if (strstr(child->tag, "composition")) {
      printf("composition: %s; ", child->contents);
    }
  }
  printf("\n");
}

static tasitc_val_t* eval_obj(mpc_ast_t *ast) {
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (strstr(child->tag, "objpair")) {
      eval_objpair(child);
    }
  }
}



tasitc_val_t* tasitc_err(char* msg, int code) {
  tasitc_val_t *val = malloc(sizeof(tasitc_val_t));

  tasitc_err_t *err = malloc(sizeof(tasitc_err_t));
  err->code = code;
  err->msg = malloc(strlen(msg) + 1);
  strcpy(err->msg, msg);

  val->error = err;
  return val;
}

tasitc_val_t* tasitc_str(mpc_ast_t* ast) {
  tasitc_val_t *val = malloc(sizeof(tasitc_val_t));
  
  val->str = malloc(strlen(ast->contents + 1));
  strcpy(val->str, ast->contents + 1);
  val->str[strlen(ast->contents + 1) - 1] = '\0';
  return val;
}

static char* tasitc_str_concat(char* fst, char* snd) {
  // FIXME: add a max size?
  char *template = "%s%s";
  char *res = malloc(snprintf(NULL, 0, template, fst, snd) + 1);
  sprintf(res, template, fst, snd);

  return res;
}

int tasitc_ast_skip_tag(mpc_ast_t* ast) {
  if (strstr(ast->tag, "wsopt") ||
      strstr(ast->tag, "ws") ||
      strcmp(ast->tag, "char") == 0) {
    return 1;
  }
  return 0;
}

tasitc_val_t* tasitc_vector(mpc_ast_t* ast) {
  tasitc_val_t *val = malloc(sizeof(tasitc_val_t)); // TODO: hmm.. how does unions really work?

  tasitc_vec_t *vec = malloc(sizeof(tasitc_vec_t));

  int capacity = ast->children_num;
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (tasitc_ast_skip_tag(child) > 0) {
      capacity--;
    }
  }
  vec->capacity = capacity;

  vec->vals = malloc(sizeof(tasitc_val_t) * capacity);
  int val_index = 0;
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (tasitc_ast_skip_tag(child) == 0) {
      tasitc_val_t* val  = tasitc_str(child);
      vec->vals[val_index] = val;
      val_index++;
    }
  }

  val->vec = vec;
  return val;
}

void tasitc_vector_print(struct tasitc_vec_t *vec) {
  printf("!!!%i!!!", vec->capacity);
  printf("[");
  for (int i = 0; i < vec->capacity; i++) {
    printf("'%s'", vec->vals[i]->str);
    if (i < vec->capacity - 1) {
      printf(",");
    }
  }
  printf("]");
};

tasitc_res_t* eval(mpc_ast_t *ast) {
  tasitc_res_t *res = malloc(sizeof(tasitc_res_t));
  if (strcmp(ast->tag, ">") == 0) {
    return eval(ast->children[1]);
  } else if (strstr(ast->tag, "string")) {
    res->type = TASITC_STRING;
    res->val = tasitc_str(ast);
  } else if (strstr(ast->tag, "vector")) {
    res->type = TASITC_VECTOR;
    res->val = tasitc_vector(ast);
  } else {
    res->type = TASITC_ERROR;
    res->val = tasitc_err(tasitc_str_concat("UNKNOWN tag: ", ast->tag), 
                          TASITC_ERROR_NOT_IMPLEMENTED);
  }
  return res;
  //printf("TODO: %s\n", ast->tag);

  /* if (ast->children_num == 0) { */
  /*   return; */
  /* } */
  
  /* for (int i = 0; i < ast->children_num; i++) { */
  /*   eval(ast->children[i]); */
  /* } */
  
}
