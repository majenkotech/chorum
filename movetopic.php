<?php
    include_once("chorum.inc");
    if (!isAdmin($user->id)) {
        header("HTTP/1.1 403 Forbidden");
        exit(0);
    }

    $tid = $_GET['topic'];
    $dest = $_GET['dest'];

    $topic = getTopic($tid);
    if (!$tid) {
        header("HTTP/1.0 400 Bad Request");
        print "Bad topic";
        return 0;
    }

    $forum = getForum($dest);
    if (!$forum) {
        header("HTTP/1.0 400 Bad Request");
        print "Bad forum";
        return 0;
    }

    db_update("topics", $topic->id, array(
        "forum" => $forum->id
    ));

    header("Location: topic.php?topic=" . $topic->id);

