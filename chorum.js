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

        this.userVotes = document.createElement("div");
        this.userVotes.addClassName("messageMetaVotes");
        this.userVotes.innerHTML = "Rating: " + this.data.userrating;
        this.metaBox.appendChild(this.userVotes);

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

        this.updateLinks(this.messageText);

    },

    updateLinks: function(ob) {
        for (var i = 0; i < ob.children.length; i++) {
            if (ob.children[i].tagName == "A") {
                ob.children[i].setAttribute("target", "_blank");
            } else {
                this.updateLinks(ob.children[i]);
            }
        }
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
        submit.setAttribute("value", "Save");
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
        emojify.run(this.messageText);

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
        } else {
            this.upIcon = document.createElement("img");
            this.upIcon.src = "assets/thumbup.png";
            if (this.data.voted == 1) {
                this.upIcon.addClassName("voteUsed");
            } 
            this.upIcon.observe("click", this.upvote.bind(this));
            this.upIcon.setAttribute("title", "Up-vote this post");
            this.icons.appendChild(this.upIcon);

            this.downIcon = document.createElement("img");
            this.downIcon.src = "assets/thumbdown.png";
            if (this.data.voted == -1) {
                this.downIcon.addClassName("voteUsed");
            } 
            this.downIcon.observe("click", this.downvote.bind(this));
            this.downIcon.setAttribute("title", "Down-vote this post");
            this.icons.appendChild(this.downIcon);
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

    upvote: function(e) {
        if (this.data.voted == -1) {
            this.chorum.upvote(this.data.id);
            this.downIcon.removeClassName("voteUsed");
            this.data.voted = 0;
        } else if (this.data.voted == 0) {
            this.chorum.upvote(this.data.id);
            this.upIcon.addClassName("voteUsed");
            this.data.voted = 1;
        }
    },

    downvote: function(e) {
        if (this.data.voted == 1) {
            this.chorum.downvote(this.data.id);
            this.upIcon.removeClassName("voteUsed");
            this.data.voted = 0;
        } else if (this.data.voted == 0) {
            this.chorum.downvote(this.data.id);
            this.downIcon.addClassName("voteUsed");
            this.data.voted = -1;
        }
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
//                a.setAttribute("target", "_new");
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
        showdown.setFlavor('github');
        this.converter = new showdown.Converter({
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            strikethrough: true,
            tables: true,
            tasklists: true,
            encodeEmails: true
        });

        this.id = id;
        this.topic = topic;
        this.lastid = 0;
        this.timerPeriod = 1000;
        this.container = document.getElementById(id);
        this.container.innerHTML = "Loading...";
        this.isLive = true;
        this.newCount = 0;
        this.baseTitle = document.title;

        window.onfocus = this.setIsLive.bind(this);
        window.onblur = this.clrIsLive.bind(this);

        this.notifications = true;

        if ("Notification" in window) {
            Notification.requestPermission();
        }

        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "init",
                topic: this.topic
            },
            onSuccess: this.init.bind(this)
        });

    },

    setIsLive: function(e) {
        this.isLive = true;
        document.title = this.baseTitle;
    },

    clrIsLive: function(e) {
        this.isLive = false;
        this.newCount = 0;
    },

    init: function(r) {
        this.topicdata = r.responseJSON.data;

        this.container.innerHTML = "";
        this.messages = new Array();

        this.questionTitle = document.createElement("h1");
        this.questionTitle.addClassName("questiontitle");
        this.questionTitle.innerHTML = this.topicdata.title;
        this.container.appendChild(this.questionTitle);
        if (this.topicdata.own) {
            this.renameIcon = document.createElement("img");
            this.renameIcon.addClassName("messageTitleIcon");
            this.renameIcon.src='assets/edit.png';
            this.questionTitle.appendChild(this.renameIcon);
            this.renameIcon.observe('click', this.startRename.bind(this));
        }

        this.questionBody = document.createElement("div");
        this.questionBody.addClassName("questionbox");
        this.questionBody.innerHTML = this.converter.makeHtml(this.topicdata.text);
        this.container.appendChild(this.questionBody);

        this.questionStrap = document.createElement("div");
        this.questionStrap.addClassName("messageStrap");
        this.questionStrap.innerHTML = this.topicdata.meta;
        this.questionBody.appendChild(this.questionStrap);

        this.questionStrapIcons = document.createElement("div");
        this.questionStrapIcons.addClassName("messageStrapIcons");
        this.questionStrap.appendChild(this.questionStrapIcons);

        if (this.topicdata.own) {
            this.delIcon = document.createElement("img");
            this.delIcon.src='assets/delete.png';
            this.questionStrapIcons.appendChild(this.delIcon);

            this.editIcon = document.createElement("img");
            this.editIcon.src='assets/edit.png';
            this.questionStrapIcons.appendChild(this.editIcon);
            this.editIcon.observe("click", this.startEdit.bind(this));
        }

        this.reportIcon = document.createElement("img");
        this.reportIcon.src='assets/report.png';
        this.questionStrapIcons.appendChild(this.reportIcon);

        this.quoteIcon = document.createElement("img");
        this.quoteIcon.src = 'assets/quote.png';
        this.questionStrapIcons.appendChild(this.quoteIcon);
        this.quoteIcon.observe('click', this.quoteMessage.bind(this));

        this.messageList = document.createElement("div");
        this.messageList.addClassName("messageList");
        this.container.appendChild(this.messageList);
        this.postBox = document.createElement("div");
        this.postBox.addClassName("messagePostBox");
        this.container.appendChild(this.postBox);

        if (this.topicdata.locked) {
            this.postHint = document.createElement("div");
            this.postHint.addClassName("messagePostHint");
            this.postHint.innerHTML = "This topic is locked. No more posts may be added.";
            this.postBox.appendChild(this.postHint);
        } else {
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
            this.postButton.setAttribute("value", "Post");
            this.postButton.addClassName("messagePostButton");
            this.postForm.appendChild(this.postButton);

            this.postHint = document.createElement("div");
            this.postHint.addClassName("messagePostHint");
            this.postHint.innerHTML = "This forum system supports the Github flavour of Markdown. <a href='https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet' target='_blank'>Click here for instructions on using Markdown</a><br/>The full range of emoticons are supported. The complete list of codes can be found <a href='http://www.webpagefx.com/tools/emoji-cheat-sheet/' target='_blank'>here.</a>";
            this.postForm.appendChild(this.postHint);

            this.postForm.observe("submit", this.postMessage.bind(this));
        }

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
            if (!this.topicdata.locked) {
                this.updateTimer = setTimeout(this.update.bind(this), this.timerPeriod);
            }
            return;
        }
        this.notifications = r.responseJSON.notifications;
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
                if (v.action != 'D') {
                    this.addPost(v);
                }
            }.bind(this));
        } else if (type == "update") {
            r.responseJSON.data.each(function(v, i) {
                var id = parseInt(v.id);
                if (v.action == 'P') {
                    this.addPost(v);
                    window.scrollTo(0,document.body.scrollHeight);
                    if (!this.isLive) {
                        this.newCount++;
                        document.title = "(" + this.newCount + ") " + this.baseTitle;
                        if ("Notification" in window) {
                            if (Notification.permission === "granted") {
                                if (this.notifications) {
                                    var notification = new Notification("Chorum message from " + v.user + "\n" + v.text.substring(0, 200));
                                }
                            }
                        }
                    }
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
        if (!this.topicdata.locked) {
            this.updateTimer = setTimeout(this.update.bind(this), this.timerPeriod);
        }
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

    quoteMessage: function(e) {
        this.insertQuote(this.topicdata.text);
    },

    insertQuote: function(text) {
        var exist = this.postEntry.getValue();
        exist += "\n\n";
        lines = text.split("\n");
        for (var i = 0; i < lines.length; i++) {
            exist += "> " + lines[i] + "\n";
        }
        this.postEntry.setValue(exist);
    },

    startRename: function(e) {
        this.questionTitle.innerHTML="";
        this.titleEditForm = document.createElement("form");
        this.titleEditForm.setAttribute("action", "#");
        this.titleEditForm.setAttribute("method", "POST");
        this.questionTitle.appendChild(this.titleEditForm);
        this.titleEditBox = document.createElement("input");
        this.titleEditBox.setAttribute("name", "title");
        this.titleEditBox.setValue(this.topicdata.title);
        this.titleEditForm.appendChild(this.titleEditBox);
        this.titleEditSave = document.createElement("input");
        this.titleEditSave.setAttribute("type", "submit");
        this.titleEditSave.setAttribute("value", "Save");
        this.titleEditForm.appendChild(this.titleEditSave);
        this.titleEditCancel = document.createElement("input");
        this.titleEditCancel.setAttribute("type", "button");
        this.titleEditCancel.setAttribute("value", "Cancel");
        this.titleEditForm.appendChild(this.titleEditCancel);

        this.titleEditForm.observe("submit", this.doRename.bind(this));
        this.titleEditCancel.observe("click", this.undoRename.bind(this));
    },
    doRename: function(e) {
        e.stop();
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "rename",
                topic: this.topic,
                lastid: this.lastid,
                title: this.titleEditBox.getValue()
            },
            onSuccess: this.init.bind(this)
        });
    },
    undoRename: function(e) {
        this.questionTitle.innerHTML = this.topicdata.title;
        if (this.topicdata.own) {
            this.renameIcon = document.createElement("img");
            this.renameIcon.addClassName("messageTitleIcon");
            this.renameIcon.src='assets/edit.png';
            this.questionTitle.appendChild(this.renameIcon);
            this.renameIcon.observe('click', this.startRename.bind(this));
        }
    },
    startEdit: function(e) {
        this.questionBody.innerHTML = "";
        this.editForm = document.createElement("form");
        this.editForm.setAttribute("action", "#");
        this.editForm.setAttribute("method", "POST");
        this.questionBody.appendChild(this.editForm);
        this.editBox = document.createElement("textarea");
        this.editBox.innerHTML = this.topicdata.text;
        this.editForm.appendChild(this.editBox);
        this.editForm.appendChild(document.createElement("br"));
        this.editSave = document.createElement("input");
        this.editSave.setAttribute("type", "submit");
        this.editSave.setAttribute("value", "Save");
        this.editForm.appendChild(this.editSave);
        this.editCancel = document.createElement("input");
        this.editCancel.setAttribute("type", "button");
        this.editCancel.setAttribute("value", "Cancel");
        this.editForm.appendChild(this.editCancel);

        this.editForm.observe("submit", this.doEdit.bind(this));
        this.editCancel.observe("click", this.undoEdit.bind(this));
        
    },
    doEdit: function(e) {
        e.stop();
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "edittopic",
                topic: this.topic,
                lastid: this.lastid,
                message: this.editBox.getValue()
            },
            onSuccess: this.init.bind(this)
        });
    },
    undoEdit: function(e) {
        this.questionBody.innerHTML = this.converter.makeHtml(this.topicdata.text);
        this.questionStrap = document.createElement("div");
        this.questionStrap.addClassName("messageStrap");
        this.questionStrap.innerHTML = this.topicdata.meta;
        this.questionBody.appendChild(this.questionStrap);

        this.questionStrapIcons = document.createElement("div");
        this.questionStrapIcons.addClassName("messageStrapIcons");
        this.questionStrap.appendChild(this.questionStrapIcons);

        if (this.topicdata.own) {
            this.delIcon = document.createElement("img");
            this.delIcon.src='assets/delete.png';
            this.questionStrapIcons.appendChild(this.delIcon);

            this.editIcon = document.createElement("img");
            this.editIcon.src='assets/edit.png';
            this.questionStrapIcons.appendChild(this.editIcon);
            this.editIcon.observe("click", this.startEdit.bind(this));
        }

        this.reportIcon = document.createElement("img");
        this.reportIcon.src='assets/report.png';
        this.questionStrapIcons.appendChild(this.reportIcon);

        this.quoteIcon = document.createElement("img");
        this.quoteIcon.src = 'assets/quote.png';
        this.questionStrapIcons.appendChild(this.quoteIcon);
        this.quoteIcon.observe('click', this.quoteMessage.bind(this));

    },
    upvote: function(id) {
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "upvote",
                topic: this.topic,
                lastid: this.lastid,
                message: id
            },
            onSuccess: this.populate.bind(this)
        });
    },
    downvote: function(id) {
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "downvote",
                topic: this.topic,
                lastid: this.lastid,
                message: id
            },
            onSuccess: this.populate.bind(this)
        });
    }
});

function startChorum(id, topic) {
    new Chorum(id, topic);
}

function closeCookiePopup(name,value,days) {
    $('cookiePopup').style.display='none';
    var expires = "";
    var date = new Date();
    date.setTime(date.getTime() + (365*24*60*60*1000));
    expires = date.toUTCString();
    document.cookie = "CookiePopup=1; expires=" + expires + "; path=/";
}
