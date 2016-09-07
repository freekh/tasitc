#include "eval.h"
#include <string.h>

static tasitc_obj_pair_t* tasitc_obj_pair(mpc_ast_t *ast) {
  tasitc_obj_pair_t *obj_pair = malloc(sizeof(tasitc_obj_pair_t));

  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    // TODO: guard against errors (multiple objpahts...)
    if (strstr(child->tag, "objpath")) {
      obj_pair->key = malloc(sizeof(child->contents) + 1);
      strcpy(obj_pair->key, child->contents);
    } else if (strstr(child->tag, "composition")) {
      obj_pair->val = malloc(sizeof(child->contents) + 1);
      strcpy(obj_pair->val, child->contents);
    }
  }

  return obj_pair;
}

static tasitc_val_t* tasitc_obj(mpc_ast_t *ast) {
  int capacity = 0;
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (strstr(child->tag, "objpair")) {
      capacity++;
    }
  }
  tasitc_val_t *val = malloc(sizeof(tasitc_val_t));
  tasitc_obj_t *obj = malloc(sizeof(tasitc_obj_t));

  obj->capacity = capacity;
  obj->pairs = malloc(sizeof(tasitc_obj_pair_t) * capacity);
  int obj_index = 0;
  for (int i = 0; i < ast->children_num; i++) {
    mpc_ast_t *child = ast->children[i];
    if (strstr(child->tag, "objpair")) {
      obj->pairs[obj_index] = tasitc_obj_pair(child);
      obj_index++;
    }
  }
  val->obj = obj;
  return val;
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
  // TODO: rewrite this!
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
  printf("[");
  for (int i = 0; i < vec->capacity; i++) {
    printf("'%s'", vec->vals[i]->str);
    if (i < vec->capacity - 1) {
      printf(",");
    }
  }
  printf("]");
};

void tasitc_obj_print(struct tasitc_obj_t *obj) {
  printf("{");
  for (int i = 0; i < obj->capacity; i++) {
    printf("'%s':", obj->pairs[i]->key);
    printf("'%s'", obj->pairs[i]->val);
    if (i < obj->capacity - 1) {
      printf(",");
    }
  }
  printf("}");
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
  } else if (strstr(ast->tag, "obj")) {
    res->type = TASITC_OBJECT;
    res->val = tasitc_obj(ast);
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
