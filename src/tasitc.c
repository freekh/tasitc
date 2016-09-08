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
    tasitc_token_t token;
    const char* path = argv[1];
    FILE* file = fopen(path, "r");

    int ret = tasitc_parse_file(path, file, &token);
    printf("%s\n", tasitc_stringify(&token, 2));
    tasitc_token_delete(&token);
    return ret;
  } else {
    puts("tasitc(0.0.3)");

    char *prompt = "_> ";
    char *input;

    read_history(HISTORY);
    while ((input = readline(prompt)) != NULL) {
      add_history(input);
      tasitc_token_t token;
      tasitc_parse("<stdin>", input, &token);
      printf("%s", tasitc_stringify(&token, 2));
      tasitc_token_delete(&token);
      free(input);
    }
    write_history(HISTORY);
    return 0;
  }
}
