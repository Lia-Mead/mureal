const spicedPg = require("spiced-pg");

// const { dbUsername, dbPass } = require("./secrets");

// const db = spicedPg(`postgres:${dbUsername}:${dbPass}@localhost:5432/gallery`);

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbUsername, dbPass } = require("./secrets.json");
    db = spicedPg(`postgres:${dbUsername}:${dbPass}@localhost:5432/gallery`);
}

module.exports.getImages = () => {
    let q = `SELECT * FROM images ORDER BY id DESC LIMIT 6`;
    return db.query(q);
};

module.exports.uploadImage = (url, username, title, description) => {
    let q = `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4)
    RETURNING *`;
    const params = [url, username, title, description];
    return db.query(q, params);
};

module.exports.getPopup = (id) => {
    let q = `SELECT * FROM images WHERE id=$1`;
    const params = [id];
    return db.query(q, params);
};

module.exports.fetchNextResults = (lastId) => {
    let q = `SELECT url, title, id, (
    SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1) AS "lowestId" FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 6`;
    const params = [lastId];
    return db.query(q, params);
};

module.exports.addComment = (username, comment, imageId) => {
    let q = `INSERT INTO comments (username, comment, image_id) VALUES ($1, $2, $3)
    RETURNING *`;
    const params = [username, comment, imageId];
    return db.query(q, params);
};

module.exports.getAllComments = (imageId) => {
    let q = `SELECT * FROM comments
    WHERE image_id=$1`;
    const params = [imageId];
    return db.query(q, params);
};

module.exports.addLike = (imageId) => {
    const q = `INSERT INTO likes (image_id) VALUES ($1) RETURNING *`;
    const params = [imageId];
    return db.query(q, params);
};
module.exports.countLikes = (imageId) => {
    const q = `SELECT COUNT (*) FROM likes WHERE image_id = $1`;
    const params = [imageId];
    return db.query(q, params);
};

module.exports.deletePost = (postId) => {
    const q = `DELETE FROM images WHERE id = $1`;
    const params = [postId];
    return db.query(q, params);
};
module.exports.deleteComments = (postId) => {
    const q = `DELETE FROM comments WHERE image_id = $1`;
    const params = [postId];
    return db.query(q, params);
};
module.exports.deleteLikes = (postId) => {
    const q = `DELETE FROM likes WHERE image_id = $1`;
    const params = [postId];
    return db.query(q, params);
};
module.exports.selectPost = (postId) => {
    const q = `SELECT * FROM images WHERE id = $1`;
    const params = [postId];
    return db.query(q, params);
};
