
const simple2 = () => {
  // [{foo:'bar1',foo:'bar2'}] | map ?.foo
  const tokens = [
    { token_type: "New", content: "" },
    { token_type: "Sel", content: "" },
    { token_type: "Kel", content: "" },
    { token_type: "Sue", content: "foo" },
    { token_type: "Col", content: "" },
    { token_type: "Soq", content: "bar1" },
    { token_type: "Com", content: "" },
    { token_type: "Sue", content: "foo" },
    { token_type: "Col", content: "" },
    { token_type: "Soq", content: "bar2" },
    { token_type: "Ker", content: "" },
    { token_type: "Ser", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Bar", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Sue", content: "map" },
    { token_type: "Ace", content: " " },
    { token_type: "Wut", content: "" },
    { token_type: "Dot", content: "" },
    { token_type: "Sue", content: "foo" },
  ];

  const expected = [
    {
      kind: "ite",
      requires: [],
      contains: [
        {
          kind: "obj",
          contains: [
            { key: "foo", kind: "str", contains: "bar1" },
            { key: "foo", kind: "str", contains: "bar2" },
          ],
        },
      ],
      provides: [
        {
          kind: "ite", of: [
            { key: "foo", kind: "str" }
          ]
        }
      ],
    },
    {
      kind: "exp",
      value: "map",
      args: [
        { kind: "wut", of: { key: "foo" } }
      ],
      requires: [
        {
          kind: "ite", of: [
            { key: "foo" }
          ],
        },
      ],
      provides: [
        {
          kind: "ite"
        },
      ]
    },
  ];
};


const simple1 = () => {
  // {name:'test'}
  const tokens = [
    { token_type: "New", content: "" },
    { token_type: "Kel", content: "" },
    { token_type: "Sue", content: "name" },
    { token_type: "Col", content: "" },
    { token_type: "Soq", content: "test" },
    { token_type: "Ker", content: "" },
  ];

  const expected = [
    {
      kind: "obj",
      requires: [],      
      contains: [
        { key: "name", kind: "str", value: "test" },
      ],
      provides: [
        { key: "name", kind: "str" }
      ],
    }
  ];

  return { tokens, expected };
};