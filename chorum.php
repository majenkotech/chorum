<?php

require_once("chorum.inc");

$user = db_select("users", $_SESSION['uid']);
if (!$user) {
    $user = new stdClass;
    $user->id = -1;
}

if ($user->id <= 0) {
    header("HTTP/1.0 400 Bad Request");
    exit(0);
}

$func = $_POST['action'];

if ($func == "edittopic") {
    $topic = db_select("topics", $_POST['topic']);
    if (!$topic) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $owner = db_select("users", $topic->user);
    if ($owner->id != $user->id) {
        header("HTTP/1.0 403 Forbidden");
        exit(0);
    }

    db_update("topics", $topic->id, array(
        "message" => $_POST['message']
    ));
}

if ($func == "rename") {
    $topic = db_select("topics", $_POST['topic']);
    if (!$topic) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $owner = db_select("users", $topic->user);
    if ($owner->id != $user->id) {
        header("HTTP/1.0 403 Forbidden");
        exit(0);
    }

    db_update("topics", $topic->id, array(
        "title" => $_POST['title']
    ));
}

if (($func == "init") || ($func == "rename") || ($func == "edittopic")) {
    $topic = db_select("topics", $_POST['topic']);
    if (!$topic) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $owner = db_select("users", $topic->user);
    $resp = array(
        "content" => "init",
        "notifications" => ($user->notifications == 'Y'),
        "topic" => $topic->id,
        "data" => array(
            "locked" => $topic->locked == 'Y',
            "own" => ($owner->id == $user->id),
            "title" => $topic->title,
            "text" => $topic->message,
            "meta" => "Posted by $owner->name at " . date("H:i", $topic->ts) . " on " . date("d M Y", $topic->ts)
        )
    );
    header("Content-type: application/json");
    print json_encode($resp);
    exit(0);
}

if ($func == "load") {
    $q = db_query("SELECT * FROM topics WHERE id=:id", array("id" => $_POST['topic']));
    $topic = db_next($q);

    if (!$topic) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    } 

    $resp = array(
        "content" => "load",
        "topic" => $topic->id,
        "notifications" => ($user->notifications == 'Y'),
        "data" => array()
    );

    $q = db_query("SELECT max(id) AS mid FROM actions");
    $r = db_next($q);
    $resp['maxid'] = $r->mid;
     

    $q = db_query("SELECT * FROM messages WHERE topic=:topic ORDER BY id", array("topic" => $topic->id));
   
    while ($message = db_next($q)) {
        $msg = getMessageData($message->id);
//        if ($msg['action'] == 'E') $msg['action'] = 'P';
        $resp['data'][] = $msg;
    }

    header("Content-type: application/json");
    print json_encode($resp);
    exit(0);
}





$resp = array(
    "notifications" => ($user->notifications == 'Y'),
    "content" => "update",
    "topic" => $topic->id,
    "data" => array()
);

if ($func == "edit") {
    if ($user->id <= 0) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $topic = db_select("topics", $_POST['topic']);
    if (!$topic) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }

    $message = db_select("messages", $_POST['message']);
    $owner = db_select("users", $message->user);
    if ($user->id != $owner->id) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }

    db_insert("actions", array(
        "message" => $message->id,
        "action" => "E",
        "body" => $_POST['body'],
        "ts" => time()
    ));
}

if ($func == "delete") {
    if ($user->id <= 0) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $topic = db_select("topics", $_POST['topic']);
    if (!$topic) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }

    $message = db_select("messages", $_POST['message']);
    $owner = db_select("users", $message->user);
    if ($user->id != $owner->id) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }

    db_insert("actions", array(
        "message" => $message->id,
        "action" => "D",
        "ts" => time()
    ));
}

if ($func == "post") {
    if ($user->id <= 0) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $topic = db_select("topics", $_POST['topic']);
    if (!$topic) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }

    if ($topic->locked != 'Y') {
        $text = $_POST['message'];
        $text = trim($text);
        if ($text != "") {
            $mid = db_insert("messages", array(
                "topic" => $topic->id,
                "user" => $user->id,
                "ts" => time()));

            db_insert("actions", array(
                "message" => $mid,
                "action" => "P",
                "ts" => time(),
                "body" => $text
            ));
        }
    }
}

if ($func == "upvote") {
    if ($user->id <= 0) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $q = db_query("SELECT * FROM likes WHERE message=:msg AND user=:usr", array("msg"=>$_POST['message'], "usr"=>$user->id));
    if ($r = db_next($q)) {
        $v = min(1, $r->value + 1);
        db_update("likes", $r->id, array(
            "value" => $v,
            "ts" => time()
        ));
    } else {
        db_insert("likes", array(
            "user" => $user->id,
            "value" => 1,
            "message" => $_POST['message'],
            "ts" => time()
        ));
    }
    $msg = getMessageData($_POST['message']);
    if ($msg['action'] == 'P') $msg['action'] = 'E';
    $resp['data'][] = $msg;
}

if ($func == "downvote") {
    if ($user->id <= 0) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $q = db_query("SELECT * FROM likes WHERE message=:msg AND user=:usr", array("msg"=>$_POST['message'], "usr"=>$user->id));
    if ($r = db_next($q)) {
        $v = max(-1, $r->value - 1);
        db_update("likes", $r->id, array(
            "value" => $v,
            "ts" => time()
        ));
    } else {
        db_insert("likes", array(
            "user" => $user->id,
            "value" => 1,
            "message" => $_POST['message'],
            "ts" => time()
        ));
    }
    $msg = getMessageData($_POST['message']);
    if ($msg['action'] == 'P') $msg['action'] = 'E';
    $resp['data'][] = $msg;
}

$topic = db_select("topics", $_POST['topic']);

if (!$topic) {
    header("HTTP/1.0 400 Bad Request");
    exit(0);
} 



$q = db_query("SELECT * FROM messages WHERE topic=:topic ORDER BY id", array("topic" => $topic->id));

while ($message = db_next($q)) {

    $owner = db_select("users", $message->user);
    $actionq = db_query("SELECT * FROM actions WHERE message=:message AND id>:id ORDER BY id DESC", array("message" => $message->id, "id" => $_POST['lastid']));

    if ($action = db_next($actionq)) {
        $msg = getMessageData($message->id);
        $resp['data'][] = $msg;
    }
}

$q = db_query("SELECT max(id) AS mid FROM actions");
$r = db_next($q);
$resp['maxid'] = $r->mid;

if (count($resp['data']) == 0) {
    header("HTTP/1.1 204 No Content");
    exit(0);
}

header("Content-type: application/json");
print json_encode($resp);



