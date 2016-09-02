#include "eval.h"

void eval(mpc_ast_t *ast) {
  
  printf("Tag: %s\n", ast->tag);
  printf("Contents: %s\n", ast->contents);
  printf("Number of children: %i\n", ast->children_num);

  if (strstr(ast->tag, "")) {
    return;
  }
  
  

  return;
}
