function mimeIsPicture(m) {
    if (m == "image-png") return true;
    if (m == "image-jpeg") return true;
    if (m == "image-gif") return true;
    return false;
}

function insertAtCursor(myField, myValue) {
    //IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }
}

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
        return this.messageWrapper;

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

        this.messageAttachments = document.createElement("div");
        this.messageAttachments.addClassName("messageAttachments");
        var ul = document.createElement("ul");
        this.messageAttachments.appendChild(ul);
        for (var i = 0; i < this.data.attachments.length; i++) {
            var att = this.data.attachments[i];

            var li = document.createElement("li");
            var img = document.createElement("img");
            img.setAttribute("src", "assets/mime/" + att.mime.replace("/", "-") + ".png");
            li.appendChild(img);

            var a = document.createElement("a");
            a.innerHTML = att.filename;
            a.setAttribute("href", "att.php?id=" + att.id);
            li.appendChild(a);

            var span = document.createElement("span");
            span.innerHTML = " (" + att.len + " bytes)";
            li.appendChild(span);

            ul.appendChild(li);
        }

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
        this.messageBox.appendChild(this.messageAttachments);
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
    },

    isInView: function() {
        var pageTop = window.pageYOffset || document.documentElement.scrollTop;
        var pageBottom = pageTop + window.innerHeight;
        var elementTop = this.messageWrapper.offsetTop;
        var elementBottom = elementTop + this.messageWrapper.getHeight();

//        console.log("Page Top: " + pageTop + ", Page Bottom: " + pageBottom + ", Element Top: " + elementTop + ", Element Bottom: " + elementBottom);

//        if (fullyInView === true) {
//            return ((pageTop < elementTop) && (pageBottom > elementBottom));
//        } else {
            return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
//        }
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
        this.messages = new Array();

        window.onfocus = this.setIsLive.bind(this);
        window.onblur = this.clrIsLive.bind(this);
        window.onscroll = this.checkInView.bind(this);

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

    checkInView: function(e) {
        if (!this.messages) return;
        this.messages.each(function(v) {
            if (v.isInView() && Number(v.data.id) > this.seenid) {
console.log(v.data.id + " came into view");
                this.seenid = Number(v.data.id);
            }
        }.bind(this));
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
            this.postTable = document.createElement("table");
            this.postTable.addClassName("messagePostTable");
            this.postRow = document.createElement("tr");
            this.postRow.addClassName("messagePostRow");
            this.postEntryCell = document.createElement("td");
            this.postEntryCell.addClassName("messagePostCell");
            this.attBoxCell = document.createElement("td");
            this.attBoxCell.addClassName("messageAttachmentCell");

            this.postTable.appendChild(this.postRow);
            this.postRow.appendChild(this.postEntryCell);
            this.postRow.appendChild(this.attBoxCell);



            this.postEntry = document.createElement("textarea");
            this.postEntry.addClassName("messagePostEntry");
            this.postEntry.setAttribute("placeholder", "Enter your message here.");

            this.postEntryCell.appendChild(this.postEntry);

            this.attBox = document.createElement("div");
            this.attBox.addClassName("attachmentBox");

            this.attBox.header = document.createElement("div");
            this.attBox.header.addClassName("messageAttachmentHeader");
            this.attBox.header.innerHTML = "Pending Attachments";
            this.attBox.appendChild(this.attBox.header);


            this.attBox.list = document.createElement("div");
            this.attBox.list.addClassName("messageAttachmentList");
            this.attBox.appendChild(this.attBox.list);

            this.attBox.icons = document.createElement("div");
            this.attBox.icons.addClassName("messageAttachmentIcons");
            this.attBox.appendChild(this.attBox.icons);

            this.attBoxCell.appendChild(this.attBox);

            this.attBox.icons.upload = document.createElement("img");
            this.attBox.icons.upload.setAttribute("title", "Upload File");
            this.attBox.icons.upload.setAttribute("src", "assets/upload.png");
            this.attBox.icons.appendChild(this.attBox.icons.upload);

            this.attBox.icons.upload.observe("click", this.openUploadWindow.bind(this));

            
            this.postForm.appendChild(this.postTable);
//            this.postForm.appendChild(document.createElement("br"));

            this.postButton = document.createElement("input");
            this.postButton.setAttribute("type", "submit");
            this.postButton.setAttribute("value", "Post");
            this.postButton.addClassName("messagePostButton");
            this.postForm.appendChild(this.postButton);

            this.previewButton = document.createElement("input");
            this.previewButton.setAttribute("type", "button");
            this.previewButton.setAttribute("value", "Preview");
            this.previewButton.addClassName("messagePostButton");
            this.previewButton.observe("click", this.previewPost.bind(this));
            this.postForm.appendChild(this.previewButton);

            this.postHint = document.createElement("div");
            this.postHint.addClassName("messagePostHint");
            this.postHint.innerHTML = "This forum system supports the Github flavour of Markdown. <a href='https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet' target='_blank'>Click here for instructions on using Markdown</a><br/>The full range of emoticons are supported. The complete list of codes can be found <a href='http://www.webpagefx.com/tools/emoji-cheat-sheet/' target='_blank'>here.</a>";
            this.postForm.appendChild(this.postHint);

            this.postForm.observe("submit", this.postMessage.bind(this));

            new Jif("chorum.php", {
                method: "post",
                parameters: {
                    action: "pending",
                    topic: this.topic
                },
                onSuccess: this.pending.bind(this)
            });

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

    previewPost: function(e) {
        this.bodyLocker = document.createElement("div");
        this.bodyLocker.addClassName("bodyLocker");
        document.body.appendChild(this.bodyLocker);
        this.previewPanel = document.createElement("div");
        this.previewPanel.addClassName("previewPanel");
        document.body.appendChild(this.previewPanel);
        this.previewBody = document.createElement("div");
        this.previewBody.addClassName("previewBody");
        this.previewBody.innerHTML = this.converter.makeHtml(this.postEntry.getValue());
        document.body.appendChild(this.previewBody);

        this.previewBody.observe("click", this.closePreview.bind(this));
        this.previewPanel.observe("click", this.closePreview.bind(this));
        this.bodyLocker.observe("click", this.closePreview.bind(this));

    },

    closePreview: function(e) {
        document.body.removeChild(this.previewBody);
        document.body.removeChild(this.previewPanel);
        document.body.removeChild(this.bodyLocker);
    },

    openUploadWindow: function(e) {
try {
        this.uploadWindow = document.createElement("div");
        this.uploadWindow.addClassName("uploadWindow");

        this.attBox.list.innerHTML="";
        this.attBox.list.appendChild(this.uploadWindow);

        this.uploadWindow.appendChild(document.createElement("br"));
        this.uploadWindow.appendChild(document.createElement("br"));
        this.uploadWindow.frm = document.createElement("form");
        this.uploadWindow.uf = document.createElement("input");
        this.uploadWindow.uf.setAttribute("type", "file");
        this.uploadWindow.uf.setAttribute("name", "file");
        this.uploadWindow.frm.appendChild(this.uploadWindow.uf);
        this.uploadWindow.appendChild(this.uploadWindow.frm);

        var h = document.createElement("input");
        h.setAttribute("name", "action");
        h.setAttribute("value", "upload");
        h.setAttribute("type", "hidden");
        this.uploadWindow.frm.appendChild(h);

        this.uploadWindow.appendChild(document.createElement("br"));
        this.uploadWindow.appendChild(document.createElement("br"));

        var can = document.createElement("button");
        can.innerHTML = "Cancel";
        can.observe("click", this.cancelUpload.bind(this));
        this.uploadWindow.appendChild(can);

        var upl = document.createElement("button");
        upl.innerHTML = "Upload";
        upl.observe("click", this.doUpload.bind(this));
        this.uploadWindow.appendChild(upl);


} catch (E) { alert(E); }
    },

    doUpload: function(e) {
        e.stop();
        var f = new FormData(this.uploadWindow.frm);
        var oReq = new XMLHttpRequest();
        oReq.open("POST", "chorum.php", true);
        oReq.onload = this.cancelUpload.bind(this);
        oReq.send(f);
        this.attBox.list.innerHTML="";
        var i = document.createElement("img");
        i.src="assets/spinner.gif";
        i.addClassName("uploadSpinner");
        this.attBox.list.appendChild(i);
        return false;
    },

    cancelUpload: function(e) {
        e.stop();
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "pending",
                topic: this.topic
            },
            onSuccess: this.pending.bind(this)
        });
    },

    pending: function(r) {
        this.attBox.list.innerHTML="";
        this.attBox.list.ul = document.createElement("ul");
        this.attBox.list.ul.addClassName("attachmentList");
        this.attBox.list.appendChild(this.attBox.list.ul);
        var attBox = this.attBox;
        var me = this;
        r.responseJSON.each(function(v, i) {
            var li = document.createElement("li");
            li.addClassName("attachmentFile");

            var tbl = document.createElement("table");
            var row = document.createElement("tr");
            var ib = document.createElement("td");
            ib.addClassName("attachmentListFileIcon");
            var fn = document.createElement("td");
            fn.addClassName("attachmentListFilename");
            var op = document.createElement("td");
            op.addClassName("attachmentListOperationIcons");
            tbl.appendChild(row);
            row.appendChild(ib);
            row.appendChild(fn);
            row.appendChild(op);

            var ic = document.createElement("img");
            var m = v.mime;
            m = m.replace("/","-");
            ic.src="assets/mime/" + m + ".png";
            ib.appendChild(ic);

            if (mimeIsPicture(m)) {
                var ins = document.createElement("img");
                ins.setAttribute("src","assets/insert.png");
                ins.setAttribute("title", "Insert inline");
                ins.fileid=v.id;
                ins.filename=v.filename;
                op.appendChild(ins);
                ins.observe("click", me.insertPicture.bind(me));
            }

            var lnk = document.createElement("img");
            lnk.setAttribute("src","assets/link.png");
            lnk.setAttribute("title", "Insert link");
            lnk.filename=v.filename;
            lnk.fileid=v.id;
            op.appendChild(lnk);
            lnk.observe("click", me.insertLink.bind(me));
            

            var del = document.createElement("img");
            del.setAttribute("src","assets/delete.png");
            del.setAttribute("title", "Delete");
            del.fileid=v.id;
            op.appendChild(del);
            del.observe("click", me.deleteAttach.bind(me));

            fn.innerHTML = v.filename;

            li.appendChild(tbl);

            attBox.list.ul.appendChild(li);
        }).bind(this);

    },

    deleteAttach: function(e) {
        e.stop();
        var el = e.srcElement;
        var id = el.fileid;
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "deletePending",
                file: id,
                topic: this.topic
            },
            onSuccess: this.pending.bind(this)
        });
        return false;
    },

    insertPicture: function(e) {
        var el = e.srcElement;
        insertAtCursor(this.postEntry, "![" + el.filename + "](att.php?id=" + el.fileid + ")");
    },

    insertLink: function(e) {
        var el = e.srcElement;
        insertAtCursor(this.postEntry, "[" + el.filename + "](att.php?id=" + el.fileid + ")");
    },

    populate: function(r) {
        if (r.status == 204) {
            if (this.timerPeriod < 10000) this.timerPeriod *= 1.1;
            clearTimeout(this.updateTimer);
            if (this.topicdata.locked) {
                this.updateTimer = setTimeout(this.update.bind(this), this.timerPeriod * 10);
            } else {
                this.updateTimer = setTimeout(this.update.bind(this), this.timerPeriod);
            }
            return;
        }
        this.notifications = r.responseJSON.notifications;
        var aid = Number(r.responseJSON.maxid);
        if (aid > this.lastid) {
            this.lastid = aid;
        }
        this.seenid = Number(r.responseJSON.lastid);
        this.timerPeriod = 1000;
        var type = r.responseJSON.content;
        if (type == "noauth") {
            this.messageList.innerHTML = "<div class='error'>Not Authorized</div>";
        } else if (type == "load") {
            this.messageList.innerHTML = "";
            r.responseJSON.data.each(function(v, i) {
                if (v.action != 'D') {
                    box = this.addPost(v);
                    if (parseInt(v.id) <= this.seenid) {
                        if (this.seenid > 0) {
                            box.scrollIntoView(true);
                        }
                    }
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
        if (this.topicdata.locked) {
            this.updateTimer = setTimeout(this.update.bind(this), this.timerPeriod * 10);
        } else {
            this.updateTimer = setTimeout(this.update.bind(this), this.timerPeriod);
        }
        setTimeout(this.checkInView.bind(this), 100);
    },

    update: function() {
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "update",
                topic: this.topic,
                lastid: this.lastid,
                seenid: this.seenid
            },
            onSuccess: this.populate.bind(this)
        });
    },

    addPost: function(post) {
        var msg = new Message(this, post);
        this.messages[parseInt(post.id)] = msg;
        return msg.render(this.messageList);
    },

    saveEdit: function(msg) {
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "edit",
                topic: this.topic,
                lastid: this.lastid,
                seenid: this.seenid,
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
                seenid: this.seenid,
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
                seenid: this.seenid,
                message: this.postEntry.getValue()
            },
            onSuccess: this.repopulate.bind(this)
        });
        this.postEntry.setValue("");
    },

    repopulate: function(e) {
        this.populate(e);
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "pending",
                topic: this.topic
            },
            onSuccess: this.pending.bind(this)
        });
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
                seenid: this.seenid,
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
                seenid: this.seenid,
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
                seenid: this.seenid,
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
                seenid: this.seenid,
                message: id
            },
            onSuccess: this.populate.bind(this)
        });
    }
});

var chorum;

function startChorum(id, topic) {
    chorum = new Chorum(id, topic);
}

function closeCookiePopup(name,value,days) {
    $('cookiePopup').style.display='none';
    var expires = "";
    var date = new Date();
    date.setTime(date.getTime() + (365*24*60*60*1000));
    expires = date.toUTCString();
    document.cookie = "CookiePopup=1; expires=" + expires + "; path=/";
}

function displayCookies(div) {
    var el = $(div);

    var theCookies = document.cookie.split(';');
    var aString = '';
    for (var i = 0 ; i < theCookies.length; i++) {
        aString += theCookies[i].trim() + "\n";
    }

    el.innerHTML = aString;
}

function triggerUnreadTopicUpdateTask() {
    new Jif("chorum.php", {
        method: "post",
        parameters: {
            action: "unread",
        },
        onSuccess: doUnreadTopicUpdateTask
    });
}

function doUnreadTopicUpdateTask(data) {
    var rows = $("unreadList").select('[class="unreadRowPlaceholder"]');
    rows.each(function (v) {
        v.parentNode.removeChild(v);
    });
    var count = 0;
    data.responseJSON.topics.each(function(v) { 

        count++;

        var tr = document.createElement("tr");
        tr.addClassName("unreadRowPlaceholder");

        var tdTitle = document.createElement("td");
        var tdTitleLink = document.createElement("a");
        tdTitleLink.innerHTML = v.title;
        tdTitleLink.href="topic.php?topic=" + v.id;
        tdTitle.appendChild(tdTitleLink);
        tdTitle.addClassName("unreadTitle");

        if (v.locked == "Y") {
            tdTitleLock = document.createElement("img");
            tdTitleLock.src = "assets/locked.png";
            tdTitle.appendChild(tdTitleLock);
        }
        tr.appendChild(tdTitle);

        var tdUser = document.createElement("td");
        tdUser.innerHTML = v.username;
        tdUser.addClassName("unreadUser");
        tr.appendChild(tdUser);
        
        var tdReplies = document.createElement("td");
        tdReplies.innerHTML = v.posts;
        tdReplies.addClassName("unreadReplies");
        tr.appendChild(tdReplies);
        
        var tdUpdated = document.createElement("td");
        tdUpdated.innerHTML = v.date;
        tdUpdated.addClassName("unreadUpdated");
        tr.appendChild(tdUpdated);
        

        $("unreadList").appendChild(tr);
    });

    var ts = document.title.split(" :: ");

    var sitename = ts[0];
    if (sitename.startsWith("(")) {
        sitename = sitename.split(" ")[1];
    }

    if (count == 0) {
        document.title = sitename + " :: Unread Topics";
    } else {
        document.title = "(" + count + ") " + sitename + " :: Unread Topics";
    }
    setTimeout(triggerUnreadTopicUpdateTask, 30000);

    
}


var Topic = Class.create({
    initialize: function(id, data) {
        this.data = data;
        this.id = id;
    },
    // Return a Table Row (TR) node with four columns within it:
    // | Topic         | User | Replies | Updated |
    teaser: function() {
        var tr = document.createElement("tr");

        var tdTitle = document.createElement("td");
        var tdTitleLink = document.createElement("a");
        tdTitleLink.innerHTML = this.data.title;
        tdTitleLink.href="topic.php?topic=" + this.id;
        tdTitle.appendChild(tdTitleLink);
        tdTitle.addClassName("teaserTitle");

        if (this.data.locked == "Y") {
            tdTitleLock = document.createElement("img");
            tdTitleLock.src = "assets/locked.png";
            tdTitle.appendChild(tdTitleLock);
        }
        tr.appendChild(tdTitle);

        var tdUser = document.createElement("td");
        tdUser.innerHTML = this.data.username;
        tdUser.addClassName("teaserUser");
        tr.appendChild(tdUser);

        var tdReplies = document.createElement("td");
        tdReplies.innerHTML = this.data.posts;
        tdReplies.addClassName("teaserReplies");
        tr.appendChild(tdReplies);

        var tdUpdated = document.createElement("td");
        tdUpdated.innerHTML = this.data.date;
        tdUpdated.addClassName("teaserUpdated");
        tr.appendChild(tdUpdated);

        return tr;
    }
});

var UnreadList = Class.create({
    initialize: function(div) {
        this.pageTitle = document.title;
        this.latestUpdate = 0;
        this.div = div;
        this.messages = new Array();
        setTimeout(this.startUpdate.bind(this), 100);
        this.render();
    },
    startUpdate: function() {
        new Jif("chorum.php", {
            method: "post",
            parameters: {
                action: "unread",
                latestUpdate: this.latestUpdate
            },
            onSuccess: this.parseUpdate.bind(this),
            onFailure: this.noUpdate.bind(this),
            onComplete: this.doneUpdate.bind(this)
        });
    },
    noUpdate: function(r) {
    },
    doneUpdate: function(r) {
    },
    parseUpdate: function(r) {
try {
        if (r.status == 204) { // Nothing new
            setTimeout(this.startUpdate.bind(this), 100);
            return;
        }
        var ob = r.responseJSON;
        if (ob == null) {
            setTimeout(this.startUpdate.bind(this), 100);
            return;
        }
        for (var i = 0; i < ob.topics.length; i++) {
            for (var j = 0; j < this.messages.length; j++) {
                if (this.messages[j].id == ob.topics[i].id) {
                    delete this.messages[j];
                }
            }
        }
        this.messages = this.messages.compact();

        for (var i = 0; i < ob.topics.length; i++) {
            this.messages.unshift(new Topic(ob.topics[i].id, ob.topics[i]));
            if (ob.topics[i].maxts > this.latestUpdate) {
                this.latestUpdate = ob.topics[i].maxts;
            }
        }
                    
        this.render();
        if (this.messages.length > 0) {
            document.title = "(" + this.messages.length + ") " + this.pageTitle;
        } else {
            document.title = this.pageTitle;
        }
} catch (E) { alert(E); }
        setTimeout(this.startUpdate.bind(this), 1000);
    },
    header: function() {
        var header = document.createElement("tr");
        var topic = document.createElement("th");
        var user = document.createElement("th");
        var replies = document.createElement("th");
        var updated = document.createElement("th");
        topic.innerHTML = "Topic";
        user.innerHTML = "User";
        replies.innerHTML = "Replies";
        updated.innerHTML = "Updated";
        header.appendChild(topic);
        header.appendChild(user);
        header.appendChild(replies);
        header.appendChild(updated);
        topic.addClassName("width100");
        return header;
    },
    render: function() {
try {
        var table = document.createElement("table");
        table.appendChild(this.header());

        this.messages.each(function(msg) {
            table.appendChild(msg.teaser());
        });

        while(this.div.children.length > 0) {
            this.div.removeChild(this.div.children[0]);
        }

        this.div.appendChild(table);
} catch (E) { alert(E); }
    },
});

function startUnreadTopicUpdateTask() {
    var unread = new UnreadList($("unreadlist"));
}
