#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <assert.h>
#include "stringify.h"

char* str_concat(char* fst, char* snd) {
  // FIXME: add a max size?
  char *template = "%s%s";
  char *res = malloc(snprintf(NULL, 0, template, fst, snd) + 1);
  sprintf(res, template, fst, snd);
  return res;
}

char* tasitc_stringify_str(tasitc_str_t str) {
  char* res = str_concat("'", str);
  res =  str_concat(res, "'");
  return res;
}

char* tasitc_stringify_dic(tasitc_dic_t* dic, uint8_t indent) {
  char* res = "{";
  for (size_t i = 0; i < dic->size; i++) {
    char* key_str = dic->elems[i]->key;
    res = str_concat(res, "'");
    res = str_concat(res, key_str);
    res = str_concat(res, "'");
    res = str_concat(res, ":");
    char* val_str = tasitc_stringify(dic->elems[i]->val, indent);
    if (val_str != NULL) {
      res = str_concat(res, val_str);
      if (i < dic->size - 1) {
        res = str_concat(res, ",");
      }
    }
  }
  res = str_concat(res, "}");
  return res;
}

char* tasitc_stringify_vec(tasitc_vec_t* vec, uint8_t indent) {
  char* res = "[";
  for (size_t i = 0; i < vec->size; i++) {
    char* val_str = tasitc_stringify(vec->elems[i], indent);
    if (val_str != NULL) {
      res = str_concat(res, val_str);
      if (i < vec->size - 1) {
        res = str_concat(res, ",");
      }
    }
  }
  res = str_concat(res, "]");
  return res;
}

char* tasitc_stringify_comp(tasitc_comp_t* comp, uint8_t indent) {
  char* res = "";
  for (size_t i = 0; i < comp->size; i++) {
    char* val_str = tasitc_stringify(comp->elems[i], indent);
    if (val_str != NULL) {
      res = str_concat(res, val_str);
      if (i < comp->size - 1) {
        res = str_concat(res, "o");
      }
    }
  }
  res = str_concat(res, "");
  return res;
}

char* tasitc_stringify_ctx(tasitc_ctx_t* ctx, uint8_t indent) {
  char* res = "$";
  for (size_t i = 0; i < ctx->size; i++) {
    if (ctx->attrs[i]->path != NULL) {
      res = str_concat(res, "['");
      res = str_concat(res, ctx->attrs[i]->path);
      res = str_concat(res, "']");
    } else {
      assert(false && "Unknown attr in ctx during stringify");
    }
  }
  return res;
}

char* tasitc_stringify(tasitc_token_t *token, uint8_t indent) {
  if (token->val == NULL) {
    return NULL;
  }
  if (token->type == TASITC_ERROR) {
    return token->val->err->msg;
  } else if (token->type == TASITC_STRING) {
    return tasitc_stringify_str(token->val->string);
  } else if (token->type == TASITC_VECTOR) {
    return tasitc_stringify_vec(token->val->vec, indent);
  } else if (token->type == TASITC_DICTIONARY) {
    return tasitc_stringify_dic(token->val->dic, indent);
  } else if (token->type == TASITC_COMPOSITION) {
    return tasitc_stringify_comp(token->val->comp, indent);
  } else if (token->type == TASITC_CTX) {
    return tasitc_stringify_ctx(token->val->ctx, indent);
  } 

  assert(false && "FATAL: cannot stringify token with a non-null val of unknown type");
  return ""; // never reached
}
