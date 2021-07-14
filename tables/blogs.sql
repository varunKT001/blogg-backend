CREATE TABLE blogs(
    blogid BIGSERIAL NOT NULL PRIMARY KEY,
    tittle TEXT NOT NULL,
    author VARCHAR(50) NOT NULL,
    date VARCHAR(10) NOT NULL,
    edited VARCHAR(10),
    content TEXT NOT NULL
);