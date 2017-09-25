

const simple2 = () => {
  // {foo:{bar:'zoo'}}
  const tokens = [
    { token_type: "New", content: "" },
    { token_type: "Kel", content: "" },
    { token_type: "Sue", content: "foo" },
    { token_type: "Col", content: "" },
    { token_type: "Kel", content: "" },
    { token_type: "Sue", content: "bar" },
    { token_type: "Col", content: "" },
    { token_type: "Soq", content: "zoo" },
    { token_type: "Ker", content: "" },
    { token_type: "Ker", content: "" },
  ];

  const expected = [
    {
      kind: "obj",
      requires: [],      
      contains: [
        { key: "name", kind: "obj",  },
      ],
      provides: [
        { key: "name", kind: "obj",  }
      ],
    }
  ];

  return { tokens, expected };
};


const { tokens, expected } = simple1();
const result = tokens.reduce((prev, curr) => {
  const head = prev[0];
  if (curr.token_type === "New") {
    return prev;
  } else if (curr.token_type === "Kel") {
    return prev.concat({
      ast_type: "obj",
    });
  } else if (curr.token_type === "Sue" && head.ast_type === "obj") {
    head.contains = head.contains || [];
    head.contains.push({
      key: curr.content,
    });
    return prev;
  } else if (curr.token_type === "Soq") {
    head.contains = head.contains || [];
    head.contains.push({
      str: curr.content,
    });
    return prev;
  }
  return prev;
}, []);

console.log(JSON.stringify(result, null, 2));