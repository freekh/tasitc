#include "../mpc/mpc.h"

//
enum { TASITC_ERROR_NOT_IMPLEMENTED };

enum { 
  TASITC_ERROR, 
  TASITC_OBJECT, TASITC_VECTOR, TASITC_STRING,
};

union tasitc_val_t;

typedef struct tasitc_err_t {
  int code;
  char *msg;
} tasitc_err_t;

// FIXME: this is not a vector
typedef struct tasitc_vec_t {
  int capacity;
  union tasitc_val_t **vals;
} tasitc_vec_t;

typedef struct tasitc_obj_pair_t {
  char *key;
  char *val;
} tasitc_obj_pair_t;

typedef struct tasitc_obj_t {
  int capacity;
  tasitc_obj_pair_t **pairs;
} tasitc_obj_t;

typedef union tasitc_val_t {
  char *str;

  struct tasitc_err_t *error;
  struct tasitc_vec_t *vec;
  struct tasitc_obj_t *obj;
} tasitc_val_t;

typedef struct tasitc_res_t {
  int type;
  tasitc_val_t *val;
} tasitc_res_t;


tasitc_res_t* eval(mpc_ast_t *ast);

// TODO: move
void tasitc_vector_print(struct tasitc_vec_t *vec);
void tasitc_obj_print(struct tasitc_obj_t *obj);
