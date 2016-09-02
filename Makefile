CC = cc
SRCDIR = src
CFLAGS = -I$(SRCDIR) -g -Wall -std=c99 
SRC = $(wildcard $(SRCDIR)/*.c)
OBJS = $(patsubst %.c,%.o,$(SRC))

ODIR = bin
EXEC = $(ODIR)/tasitc
###

LDFLAGS = -ledit -lm
DEPS = mpc/mpc.c

###
$(EXEC): $(OBJS)
	$(CC) $(DEPS) -o $@ $^ $(CFLAGS) $(LDFLAGS)

$(ODIR)/%.o: $(SRC)
	$(CC) -c -o $@ $< $(CFLAGS)

$(OBJS): | $(ODIR)

$(ODIR):
	@mkdir -p $(ODIR)

.PHONY: clean

clean:
	rm -rf $(ODIR)
	find . -name "*~" -exec rm {} \;
	find . -name "*.o" -exec rm {} \;
