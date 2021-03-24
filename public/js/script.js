(function () {
    Vue.component("popupModal", {
        template: "#modal",
        data: function () {
            return {
                image: [],
                // count: 0,
                date: "",
                likes: 0,
            };
        },
        props: ["title", "description", "id"],
        mounted: function () {
            // console.log("this id", this.id);
            this.getTotalLikes();
            var self = this;
            axios
                .get(`/popup/${this.id}`)
                .then(function (response) {
                    // console.log("this inside axios: ", self);
                    // console.log("response from images: ", response.data);
                    self.date = response.data[0].created_at.slice(0, 10);
                    self.image = response.data[0];
                })
                .catch(function (err) {
                    console.log("error in AXIOS/ get popup:", err);
                });
        },
        watch: {
            // watchers allow us to watch value changes in properties
            id: function () {
                // console.log("modal should show a new image");
                var self = this;

                axios
                    .get(`/popup/${this.id}`)
                    .then(function (response) {
                        // console.log("this inside axios: ", self);
                        // console.log("response from POPUP: ", response);

                        if (response.data.length === 0) {
                            self.$emit("close");
                        } else {
                            self.date = response.data[0].created_at.slice(
                                0,
                                10
                            );
                            self.image = response.data[0];
                        }
                    })
                    .catch(function (err) {
                        console.log("error in AXIOS/ get popup:", err);
                    });
            },
        },
        methods: {
            // increaseCount: function () {
            //     this.count++;
            // },

            closeMe: function () {
                this.$emit("close");
            },

            increaseLikes: function () {
                var self = this;
                axios
                    .post(`/likes/${self.id}`)
                    .then(function () {
                        self.likes++;
                    })
                    .catch(function (err) {
                        console.log("error", err);
                    });
            },
            getTotalLikes: function () {
                var self = this;
                axios
                    .get(`/likes/${this.id}`)
                    .then(function (response) {
                        console.log(response.data);
                        self.likes = response.data[0].count;
                    })
                    .catch(function (err) {
                        console.log("error", err);
                    });
            },
            deletePost: function (id) {
                let self = this;
                axios
                    .post(`/delete/${self.id}`)
                    .then(function (response) {
                        self.$emit("delete", id);
                        self.$emit("close");
                    })
                    .catch(function (err) {
                        console.log("err in post delete: ", err);
                    });
            },
        },
    });

    Vue.component("commentsBox", {
        template: "#comments",
        data: function () {
            return {
                comments: [],
                username: "",
                comment: "",
            };
        },
        props: ["id"],
        mounted: function () {
            var self = this;

            axios
                .get(`/comments/${this.id}`)
                .then(function (response) {
                    // self.comments = response.data;

                    for (var i = 0; i < response.data.length; i++) {
                        self.comments.unshift({
                            comment: response.data[i].comment,
                            created_at: response.data[i].created_at.slice(
                                0,
                                10
                            ),
                            id: response.data[i].id,
                            image_id: response.data[i].image_id,
                            username: response.data[i].username,
                        });
                    }
                })
                .catch(function (err) {
                    console.log("error in AXIOS/ get comment", err);
                });
        },
        watch: {
            id: function () {
                // console.log("modal should show a new image");
                // self.selectedImage = location.hash.slice(1);
                var self = this;

                axios
                    .get(`/comments/${this.id}`)
                    .then(function (response) {
                        // self.comments = response.data;
                        for (var i = 0; i < response.data.length; i++) {
                            self.comments.unshift({
                                comment: response.data[i].comment,
                                created_at: response.data[i].created_at.slice(
                                    0,
                                    10
                                ),
                                id: response.data[i].id,
                                image_id: response.data[i].image_id,
                                username: response.data[i].username,
                            });
                        }
                    })
                    .catch(function (err) {
                        console.log("error in AXIOS/ get popup:", err);
                    });
            },
        },
        methods: {
            addComment: function (e) {
                e.preventDefault();
                var self = this;
                var commentObject = {
                    username: this.username,
                    comment: this.comment,
                    created_at: this.created_at,
                    id: this.id,
                };

                // comments.append("username", this.username);
                // comments.append("comment", this.comment);
                axios
                    .post("/comments", commentObject)
                    .then(function (response) {
                        // console.log("response.data", response.data);
                        // console.log("response.comments", self.comments);
                        for (var i = 0; i < response.data.length; i++) {
                            self.comments.unshift({
                                comment: response.data[i].comment,
                                created_at: response.data[i].created_at.slice(
                                    0,
                                    10
                                ),
                                id: response.data[i].id,
                                image_id: response.data[i].image_id,
                                username: response.data[i].username,
                            });
                        }
                        self.username = "";
                        self.comment = "";
                    })
                    .catch(function (err) {
                        console.log("error in AXIOS/ POST COMMENT:", err);
                    });
            },
            // added an emit
            closeMe: function () {
                this.$emit("close");
            },
        },
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            // selectedImage: null,
            selectedImage: location.hash.slice(1),
            errorMessage: null,
            smallestId: "",
            seen: true,
            scrollPos: 0,
        }, // data ends

        mounted: function () {
            // console.log("this: ", this);
            var self = this;

            addEventListener("hashchange", () => {
                console.log("hash got updated: ", location.hash);
                this.selectedImage = location.hash.slice(1);
                this.scrollPos = window.pageYOffset;
            });

            axios
                .get("/images")
                .then(function (response) {
                    // console.log("this inside axios: ", self);
                    // console.log("response from images: ", response.data);
                    self.images = response.data;
                })
                .catch(function (err) {
                    console.log("error in AXIOS/ get images:", err);
                });
        },

        methods: {
            closePopup: function () {
                var self = this;
                location.hash = "";
                self.selectedImage = null;
                window.history.replaceState({}, "", "/");
                window.scrollTo(0, self.scrollPos);
            },
            more: function () {
                // console.log("i want more results");
                // this.moreResults = true;
                var self = this;
                var smallestId = this.images[this.images.length - 1].id;
                console.log("smallest id", smallestId);
                axios
                    .get(`/loadmore/${smallestId}`)
                    .then(function (response) {
                        for (var i = 0; i < response.data.length; i++) {
                            // console.log("response.data[i]"), response.data[i];
                            self.images.push(response.data[i]);
                            if (
                                response.data[i].id ===
                                response.data[0].lowestId
                            ) {
                                self.seen = false;
                            }
                        }
                    })
                    .catch(function (err) {
                        console.log("error in AXIOS/ get popup:", err);
                    });
            },
            clickHandler: function () {
                var self = this;
                var fd = new FormData();
                fd.append("title", this.title);
                fd.append("description", this.description);
                fd.append("username", this.username);
                fd.append("file", this.file);
                axios
                    .post("/upload", fd)
                    .then(function (response) {
                        // console.log("response.data: ", response.data);
                        if (response.data.success) {
                            self.errorMessage = null;

                            self.images.unshift(response.data.data);

                            self.title = "";
                            self.description = "";
                            self.username = "";
                            self.$refs.fileInput.value = null;
                        } else {
                            console.log("file is too big");
                            self.errorMessage = true;
                        }
                    })
                    .catch(function (err) {
                        console.log("error in post upload: ", err);
                        self.errorMessage = true;
                    });
            },
            fileSelectHandler: function (e) {
                // console.log("e: ", e);
                this.file = e.target.files[0];
            },
            deletePost: function (id) {
                var self = this;
                console.log("this.id: ", id);
                const found = self.images.find((element) => element.id == id);
                self.images.splice(self.images.indexOf(found), 1);
            },
        }, // methods end
    });
})();
