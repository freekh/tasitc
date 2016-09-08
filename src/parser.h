#include <stdio.h>
#include "repr.h"

int tasitc_parse(const char *filename, const char *string, tasitc_repr_t *repr);
int tasitc_parse_file(const char *filename, FILE *file, tasitc_repr_t *repr);
