// c99
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// static deps
#include <editline/readline.h>

//
#include "parser.h"
#include "stringify.h"

//
#define HISTORY ".tasitc.history"

int main(int argc, char** argv) {
  if (argc == 2) {
    tasitc_repr_t repr;
    const char* path = argv[1];
    FILE* file = fopen(path, "r");

    int ret = tasitc_parse_file(path, file, &repr);
    printf("%s\n", tasitc_stringify(&repr, 2));
    tasitc_repr_delete(&repr);
    return ret;
  } else {
    puts("tasitc(0.0.3)");

    char *prompt = "_> ";
    char *input;

    read_history(HISTORY);
    while ((input = readline(prompt)) != NULL) {
      add_history(input);
      tasitc_repr_t repr;
      tasitc_parse("<stdin>", input, &repr);
      printf("%s", tasitc_stringify(&repr, 2));
      tasitc_repr_delete(&repr);
      free(input);
    }
    write_history(HISTORY);
    return 0;
  }
}
