const express = require("express");
const app = express();
exports.app = app;
const db = require("./db");
const { uploader } = require("./upload");
const s3 = require("./s3");
const config = require("./config");

const basicAuth = require("basic-auth");

let basicUser;
let basicPass;
if (process.env.NODE_ENV == "production") {
    basicUser = process.env.basicUser;
    basicPass = process.env.basicPass;
} else {
    const secrets = require("./secrets");
    basicUser = secrets.basicUser;
    basicPass = secrets.basicPass;
}

const auth = function (req, res, next) {
    const creds = basicAuth(req);
    if (!creds || creds.name != basicUser || creds.pass != basicPass) {
        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="Enter your credentials to see this stuff."'
        );
        res.sendStatus(401);
    } else {
        next();
    }
};

app.use(auth);

app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.json());

app.get("/images", (req, res) => {
    db.getImages().then(({ rows }) => {
        res.json(rows);
    });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const { username, title, description } = req.body;
    const { filename } = req.file;
    const fullUrl = config.s3Url + filename;

    // console.log("req.body: ", req.body);
    // console.log("req.file: ", req.file);
    console.log("inside /upload!!!");
    if (req.file) {
        db.uploadImage(fullUrl, username, title, description)
            .then(({ rows }) => {
                // console.log("rows", rows);
                // console.log("rows", rows[0]);
                res.json({ success: true, data: rows[0] });
            })
            .catch((err) => {
                console.log("error in uploadImage: ", err);
                res.json({ success: false });
            });
    } else {
        res.json({ success: false });
    }
});

app.get("/popup/:id", (req, res) => {
    const { id } = req.params;
    // console.log("id in popup", id);
    db.getPopup(id)
        .then(({ rows }) => {
            // console.log("rows: ", rows);
            // console.log("rows: ", rows[0]);
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in getPopup", err);
            res.json({ success: false });
        });
});

app.get("/loadmore/:smallestId", (req, res) => {
    // console.log("clicked button");
    let { smallestId } = req.params;
    // console.log("smallestId", smallestId);
    db.fetchNextResults(smallestId)
        .then(({ rows }) => {
            // console.log("rows: ", rows[0].lowestId);
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in loadmore", err);
        });
});

app.get("/comments/:imageId", (req, res) => {
    // console.log("GET request comments");
    let { imageId } = req.params;
    // console.log("id: ", imageId);
    db.getAllComments(imageId)
        .then(({ rows }) => {
            // console.log("get all comments");
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in getAllComments"), err;
        });
});

app.post("/comments", (req, res) => {
    // console.log("POST insert new comment");
    // const { id } = req.params;
    const { username, comment, id } = req.body;
    db.addComment(username, comment, id)
        .then(({ rows }) => {
            // console.log("add a comment");
            res.json(rows);
        })
        .catch((err) => {
            console.log("error in addComment", err);
        });
});

app.get("/likes/:imageId", (req, res) => {
    // console.log("post like route");
    const { imageId } = req.params;
    db.countLikes(imageId)
        .then(({ rows }) => {
            // console.log("rows in get likes: ", rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("there was an error in get likes: ", err);
        });
});

app.post("/likes/:imageId", (req, res) => {
    const { imageId } = req.params;
    console.log(imageId);
    db.addLike(imageId)
        .then(({ rows }) => {
            // console.log("rows= ", rows);
            console.log("a like was added to DB");
            res.json(rows);
        })
        .catch((err) => {
            console.log("err in adding likes in DB: ", err);
            res.json({ success: false });
        });
});

// app.listen(8080, () => console.log("IB server is listening.."));

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => {
        console.log("Mureal server is listening...");
    });
}
