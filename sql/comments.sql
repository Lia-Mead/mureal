DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    comment VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_id INT REFERENCES images(id) NOT NULL
);
