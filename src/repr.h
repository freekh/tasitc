/*
  Internal tasitc representation
*/
#ifndef REPR_H
#define REPR_H
#include <stdint.h>
#include <stdbool.h>

typedef enum { 
  TASITC_INTEGER, TASITC_NUMBER, TASITC_BOOLEAN,
  TASITC_STRING,
  TASITC_ERROR, 
  TASITC_DICTIONARY, TASITC_VECTOR, 
} tasitc_repr_type_e;

/*
  Internal errors
*/
typedef enum { 
  TASITC_SYNTAX_ERROR,
  TASITC_PARSER_ERROR,
  TASITC_RUNTIME_ERROR,
  TASITC_REQUEST_ERROR,
} tasitc_error_type_e;

typedef enum {
  TASITC_HTTP,
  TASITC_HTTPS,
  // TODO: should we add TASITC_FILE?
} tasitc_req_protocol_e;

typedef enum {
  TASITC_POST,
  TASITC_GET,
  TASITC_PUT,
  TASITC_PATCH,
  TASITC_DELETE,
} tasitc_req_verb_e;
//

typedef struct tasitc_req_t {
  char* path;
  tasitc_req_verb_e verb;
  tasitc_req_protocol_e protocol;
} tasitc_req_t;

typedef struct tasitc_file_t {
  char* path;
} tasitc_file_t;

typedef struct tasitc_sink_t {
  char* expr;
  char* path;
} tasitc_sink_t;

typedef struct tasitc_err_t {
  tasitc_error_type_e type;
  char *msg;
} tasitc_err_t;

typedef struct tasitc_dic_keyval_t {
  char *key;
  struct tasitc_repr_t *val;
} tasitc_dic_keyval_t;

typedef struct tasitc_dic_t {
  uint32_t size;
  struct tasitc_dic_keyval_t **elems;
} tasitc_dic_t;

// FIXME: this 'vector' is not a vector
typedef struct tasitc_vec_t {
  uint32_t size;
  struct tasitc_repr_t **elems;
} tasitc_vec_t;

/*
  Primitive literals
*/
typedef char* tasitc_str_t;
typedef uint64_t tasitc_int_t;
typedef double tasitc_num_t;
typedef bool tasitc_bool_t;

typedef union tasitc_repr_val_t {
  tasitc_int_t integer;
  tasitc_num_t number;
  tasitc_bool_t boolean;
  tasitc_str_t string;

  struct tasitc_err_t *err;
  struct tasitc_vec_t *vec;
  struct tasitc_dic_t *dic;

  struct tasitc_req_t *req;
  struct tasitc_file_t *file;
  struct tasitc_sink_t *sink;

} tasitc_repr_val_t;

typedef struct tasitc_repr_t {
  tasitc_repr_type_e type;
  tasitc_repr_val_t *val;
} tasitc_repr_t;

/* 
   Functions
*/
void tasitc_repr_delete(tasitc_repr_t *repr);

#endif
