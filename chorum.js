var Jif = Class.create({
    initialize: function(path,config)
    {
        this.path = path;
        this.config = config;

        this.passthru = new Object;
        this.passthru.onSuccess = config.onSuccess;
        this.passthru.onFailure = config.onFailure;
        this.passthru.onComplete = config.onComplete;

        config.onSuccess = this.onSuccess.bind(this);
        config.onFailure = this.onFailure.bind(this);
        config.onComplete = this.onComplete.bind(this);

        this.request = new Ajax.Request(this.path,this.config);
    },
    onSuccess: function(r)
    {
        this.passthru.onSuccess(r);
    },
    onFailure: function(r)
    {
        this.passthru.onFailure(r);
    },
    onComplete: function(r)
    {
        this.passthru.onComplete(r);
    }
});

var Message = Class.create({
    initialize: function(chorum, data) {
        this.chorum = chorum;
        this.data = data;
        showdown.setFlavor('github');
        this.converter = new showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            tasklists: true,
            encodeEmails: true
        });

    },

    render: function(container) {
        this.messageWrapper = document.createElement("div");
        this.messageWrapper.addClassName("message");
        this.messageWrapper.addClassName("mb-" + this.data.side);

        this.metaBox = document.createElement("div");
        this.metaBox.addClassName("messageMeta-" + this.data.side);

        this.avatar = document.createElement("img");
        this.avatar.addClassName("avatar");
        this.avatar.src = "https://www.gravatar.com/avatar/" + this.data.avatar + ".png?s=80";
        this.metaBox.appendChild(this.avatar);

        this.username = document.createElement("div");
        this.username.addClassName("messageMetaUser");
        this.username.innerHTML = this.data.user;
        this.metaBox.appendChild(this.username);

        this.messageBox = document.createElement("div");
        this.messageBox.addClassName("messageBody");
        this.messageBox.addClassName("triangle-right");
        this.messageBox.addClassName("slim");
        this.messageBox.addClassName(this.data.side);
        this.messageBox.addClassName(this.data.color);


        this.installMessage();

        container.appendChild(this.messageWrapper);

        this.br = document.createElement("br");
        this.br.setAttribute("clear", "all");
        container.appendChild(this.br);
        this.container = container;

    },

    deletePost: function(e) {
        if (confirm("Are you sure you want to delete this post?")) {
            this.chorum.removePost(this);
        }
    }, 

    editPost: function(e) {
        this.editForm = document.createElement("form");
        this.editForm.setAttribute("action", "#");
        this.editForm.setAttribute("method", "POST");
        this.editBox = document.createElement("textarea");
        this.editBox.addClassName("messageEditBox");
        this.editBox.setValue(this.data.text);
        this.messageBox.removeChild(this.messageText);
        this.messageBox.removeChild(this.messageStrap);
        this.editForm.appendChild(this.editBox);
        var br = document.createElement("br");
        this.editForm.appendChild(br);
        var submit = document.createElement("input");
        submit.setAttribute("type", "submit");
        submit.setValue("Save");
        var cancel = document.createElement("input");
        cancel.setAttribute("type", "button");
        cancel.setValue("Cancel");
        this.editForm.appendChild(submit);
        this.editForm.appendChild(cancel);

        cancel.observe("click", this.cancelEdit.bind(this));
        this.editForm.observe("submit", this.saveEdit.bind(this));

        this.messageBox.appendChild(this.editForm);
    },

    saveEdit: function(e) {
        e.stop();
        this.chorum.saveEdit(this);
    },
   
    cancelEdit: function(e) {
        while (this.messageBox.children.length > 0) {
            this.messageBox.removeChild(this.messageBox.children[0]);
        }
        this.installMessage();
    },

    installMessage: function() {
        this.messageText = document.createElement("div");
        this.messageText.addClassName("messageText");
        this.messageText.innerHTML = this.converter.makeHtml(this.data.text);

        this.messageStrap = document.createElement("div");
        this.messageStrap.addClassName("messageStrap");
        this.messageStrap.innerHTML = this.data.strap;

        this.icons = document.createElement("div");
        this.icons.addClassName("messageStrapIcons");
        this.messageStrap.appendChild(this.icons);

        if (this.data.own) {
            this.delIcon = document.createElement("img");
            this.delIcon.src = "assets/delete.png";
            this.delIcon.observe("click", this.deletePost.bind(this));
            this.icons.append(this.delIcon);
            this.delIcon.setAttribute("title", "Delete Post");

            this.editIcon = document.createElement("img");
            this.editIcon.src = "assets/edit.png";
            this.editIcon.observe("click", this.editPost.bind(this));
            this.icons.append(this.editIcon);
            this.editIcon.setAttribute("title", "Edit Post");
        }

        this.reportIcon = document.createElement("img");
        this.reportIcon.src = "assets/report.png";
        this.reportIcon.observe("click", this.reportPost.bind(this));
        this.icons.append(this.reportIcon);
        this.reportIcon.setAttribute("title", "Report Post");

        this.quoteIcon = document.createElement("img");
        this.quoteIcon.src = "assets/quote.png";
        this.quoteIcon.observe("click", this.insertQuote.bind(this));
        this.icons.append(this.quoteIcon);
        this.quoteIcon.setAttribute("title", "Insert Quote");

        if (this.data.side == 'left') {
            this.messageWrapper.appendChild(this.metaBox);
            this.messageWrapper.appendChild(this.messageBox);
        } else {
            this.messageWrapper.appendChild(this.messageBox);
            this.messageWrapper.appendChild(this.metaBox);
        }

        this.messageBox.appendChild(this.messageText);
        this.messageBox.appendChild(this.messageStrap);
        this.tagImages(this.messageText);
    },

    reportPost: function(e) {
    },

    update: function(newdata) {
        this.data = newdata;
        while (this.messageBox.children.length > 0) {
            this.messageBox.removeChild(this.messageBox.children[0]);
        }
        this.installMessage();
    },

    insertQuote: function(e) {
        this.chorum.insertQuote(this.data.text);
    },

    tagImages: function(ob) {
        for (var i = 0; i < ob.children.length; i++) {
            if (ob.children[i].tagName == "IMG") {
                var img = ob.children[i].cloneNode(true);
                var a = document.createElement("a");
                a.setAttribute("target", "_new");
                a.href = ob.children[i].src;
                a.appendChild(img);
                ob.replaceChild(a, ob.children[i]);
            } else {
                this.tagImages(ob.children[i]);
            }
        }
    }
});

var Chorum = Class.create({

    initialize: function(id, topic) {
        this.id = id;
        this.topic = topic;
        this.lastid = 0;
        this.timerPeriod = 1000;
        this.container = document.getElementById(id);
        this.container.innerHTML = "Loading...";
        this.messages = new Array();

        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "init",
                topic: this.topic
            },
            onSuccess: this.init.bind(this)
        });

    },

    init: function(r) {
        showdown.setFlavor('github');
        this.converter = new showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            tasklists: true,
            encodeEmails: true
        });
        this.topicdata = r.responseJSON.data;

        this.container.innerHTML = "";

        this.questionTitle = document.createElement("h1");
        this.questionTitle.addClassName("questiontitle");
        this.questionTitle.innerHTML = this.topicdata.title;
        this.container.appendChild(this.questionTitle);

        this.questionUser = document.createElement("div");
        this.questionUser.addClassName("questionuser");
        this.questionUser.innerHTML = this.topicdata.meta;
        this.container.appendChild(this.questionUser);

        this.questionBody = document.createElement("div");
        this.questionBody.addClassName("questionbox");
        this.questionBody.innerHTML = this.converter.makeHtml(this.topicdata.text);
        this.container.appendChild(this.questionBody);

        this.messageList = document.createElement("div");
        this.messageList.addClassName("messageList");
        this.container.appendChild(this.messageList);
        this.postBox = document.createElement("div");
        this.postBox.addClassName("messagePostBox");
        this.container.appendChild(this.postBox);

        this.postForm = document.createElement("form");
        this.postForm.setAttribute("action", "#");
        this.postForm.setAttribute("method", "POST");

        this.postBox.appendChild(this.postForm);

        this.postEntry = document.createElement("textarea");
        this.postEntry.addClassName("messagePostEntry");
        this.postForm.appendChild(this.postEntry);
        this.postForm.appendChild(document.createElement("br"));

        this.postButton = document.createElement("input");
        this.postButton.setAttribute("type", "submit");
        this.postButton.setValue("Post");
        this.postButton.addClassName("messagePostButton");
        this.postForm.appendChild(this.postButton);

        this.postForm.observe("submit", this.postMessage.bind(this));

        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "load",
                topic: this.topic
            },
            onSuccess: this.populate.bind(this)
        });

    },

    populate: function(r) {
        if (r.status == 204) {
            if (this.timerPeriod < 10000) this.timerPeriod *= 1.1;
            clearTimeout(this.updateTimer);
            this.updateTimer = setTimeout(this.update.bind(this), this.timerPeriod);
            return;
        }
        var aid = Number(r.responseJSON.maxid);
        if (aid > this.lastid) {
            this.lastid = aid;
        }
        this.timerPeriod = 1000;
        var type = r.responseJSON.content;
        if (type == "noauth") {
            this.messageList.innerHTML = "<div class='error'>Not Authorized</div>";
        } else if (type == "load") {
            this.messageList.innerHTML = "";
            r.responseJSON.data.each(function(v, i) {
                this.addPost(v);
            }.bind(this));
        } else if (type == "update") {
            r.responseJSON.data.each(function(v, i) {
                var id = parseInt(v.id);
                if (v.action == 'P') {
                    this.addPost(v);
                    window.scrollTo(0,document.body.scrollHeight);
                } else if (v.action == 'D') {
                    this.removePostById(parseInt(v.id));
                } else if (v.action == 'E') {
                    this.messages[id].update(v);
                }
            }.bind(this));
        } else {
            this.messageList.innerHTML = "<div class='error'>Bad Response</div>";
        }

        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(this.update.bind(this), this.timerPeriod);
    },

    update: function() {
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "update",
                topic: this.topic,
                lastid: this.lastid
            },
            onSuccess: this.populate.bind(this)
        });
    },

    replacePost: function(post) {
        var kid = this.getPostById(post.id);
        if (kid) {
            showdown.setFlavor('github');

            var converter = new showdown.Converter({
                simplifiedAutoLink: true,
                excludeTrailingPunctuationFromURLs: true,
                strikethrough: true,
                tables: true,
                tasklists: true,
                encodeEmails: true
            });
            var p = kid.children[1].children[0];
            if (kid.dataset.side == 'right') {
                p = kid.children[0].children[0];
            }
            p.innerHTML = "<p class='messageBody'>" + converter.makeHtml(post.text) + "</p>";
            kid.dataset.originaltext = post.text;
            if (post.strap != "") {
                p.innerHTML += "<div class='strap'>" + post.strap + "</div>";
            }
        }
    }, 

    addPost: function(post) {
        var msg = new Message(this, post);
        this.messages[parseInt(post.id)] = msg;
        msg.render(this.messageList);
    },

    saveEdit: function(msg) {
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "edit",
                topic: this.topic,
                lastid: this.lastid,
                message: msg.data.id,
                body: msg.editBox.getValue()
            },
            onSuccess: this.populate.bind(this)
        });
        return false;
    },

    removePost: function(post) {
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "delete",
                topic: this.topic,
                lastid: this.lastid,
                message: post.data.id
            },
            onSuccess: this.populate.bind(this)
        });
    },

    getPostById: function(id) {
        for (var i = 0; i < this.messageList.children.length; i++) {
            var v = this.messageList.children[i];
            if (v.dataset.id == id) {
                return v;
            }
        }
        return false;
    },

    removePostById: function(id) {
        var post = this.messages[id];
        if (post) {
            this.messageList.removeChild(post.messageWrapper);
            this.messageList.removeChild(post.br);
            this.messages[id] = null;
        }
    },

    postMessage: function(e) {
        e.stop();
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "post",
                topic: this.topic,
                lastid: this.lastid,
                message: this.postEntry.getValue()
            },
            onSuccess: this.populate.bind(this)
        });
        this.postEntry.setValue("");
    },

    insertQuote: function(text) {
        var exist = this.postEntry.getValue();
        exist += "\n\n";
        lines = text.split("\n");
        for (var i = 0; i < lines.length; i++) {
            exist += "> " + lines[i] + "\n";
        }
        this.postEntry.setValue(exist);
    }
});

function startChorum(id, topic) {
    new Chorum(id, topic);
}
