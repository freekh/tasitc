#include <stdio.h>
#include "token.h"

int tasitc_parse(const char *filename, const char *string, tasitc_token_t *token);
int tasitc_parse_file(const char *filename, FILE *file, tasitc_token_t *token);
