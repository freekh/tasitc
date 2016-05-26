CREATE TYPE file_node_type AS ENUM ('dir', 'file');

CREATE TABLE file_nodes (
  path TEXT NOT NULL,
  node_type file_node_type NOT NULL,
  content TEXT NOT NULL --this might very well change
);
