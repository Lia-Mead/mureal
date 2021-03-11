DROP TABLE IF EXISTS likes CASCADE;

CREATE TABLE likes(
    id SERIAL PRIMARY KEY,  
    image_id INTEGER NOT NULL REFERENCES images(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);