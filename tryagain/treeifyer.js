const treeify = (tokens) => {
  return tokens.reduce((prev, curr) => {
    let kesepa = undefined;
    if (curr.token_type === 'Kel') {
      prev.ke.push({
        ...curr,
        content: [],
      });
    } else if (curr.token_type === 'Ker') {
      const last = prev.ke.pop();
      if (prev.ke.length === 0) {
        prev.tree.push({
          ...last,
          content: last.content.concat(curr),
        });
      } else {
        const newLast = prev.ke.pop();
        prev.ke.push({
          ...newLast,
          content: newLast.content.concat(
            {
              ...last,
              content: last.content.concat(curr),
            },
          ),
        });
      }
    } else if (prev.ke.length > 0) {
      const last = prev.ke.pop();
      prev.ke.push({
        ...last,
        content: last.content.concat(curr),
      });
    } else {
      prev.tree.push(curr);
    }

    return prev;
  }, { ke: [], tree: [], kesepa: undefined }).tree;
};

module.exports = {
  treeify,
};