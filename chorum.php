<?php

require_once("chorum.inc");

$user = db_select("users", $_SESSION['uid']);
if (!$user) {
    $user = new stdClass;
    $user->id = -1;
}

$func = $_POST['action'];

if ($func == "init") {
    $topic = db_select("topics", $_POST['topic']);
    if (!$topic) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $owner = db_select("users", $topic->user);
    $resp = array(
        "content" => "init",
        "topic" => $topic->id,
        "data" => array(
            "title" => $topic->title,
            "text" => $topic->message,
            "meta" => "Asked by $owner->name at " . date("H:i", $topic->ts) . " on " . date("d M Y", $topic->ts)
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
//        "title" => $topic->title,
//        "text" => $topic->message,
        "data" => array()
    );

    $q = db_query("SELECT max(id) AS mid FROM actions");
    $r = db_next($q);
    $resp['maxid'] = $r->mid;
     

    $q = db_query("SELECT * FROM messages WHERE topic=:topic ORDER BY id", array("topic" => $topic->id));
   
    while ($message = db_next($q)) {

        $actionq = db_query("SELECT * FROM actions WHERE message=:message ORDER BY id DESC", array("message" => $message->id));
        $action = db_next($actionq);
        if ($action->action == "D") {
            continue;
        }
        $owner = db_select("users", $message->user);
        $text = $action->body;
        $strap = "Posted " . date("d M Y, H:i", $action->ts) . "";
        if ($action->action == 'E') {
            $strap = "Edited " . date("d M Y, H:i", $action->ts) . "";
        }
        $msg = array(
            "user" => $owner->name,
            "ts" => $message->ts,
            "action" => 'P',
            "aid" => $action->id,
            "text" => $text,
            "strap" => $strap,
            "avatar" => md5(strtolower(trim($owner->email))),
            "color" => $owner->color,
            "side" => $owner->side,
            "id" => $message->id,
            "date" => date("d M Y", $message->ts),
            "time" => date("H:i", $message->ts),
            "own" => ($owner->id == $user->id),
            "uid" => $user->id
        );
        $resp['data'][] = $msg;
    }

    header("Content-type: application/json");
    print json_encode($resp);
    exit(0);
}

if ($func == "edit") {
    if ($user->id == -1) {
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
    if ($user->id == -1) {
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
    if ($user->id == -1) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }
    $topic = db_select("topics", $_POST['topic']);
    if (!$topic) {
        header("HTTP/1.0 400 Bad Request");
        exit(0);
    }

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


$topic = db_select("topics", $_POST['topic']);

if (!$topic) {
    header("HTTP/1.0 400 Bad Request");
    exit(0);
} 

$resp = array(
    "content" => "update",
    "topic" => $topic->id,
    "data" => array()
);



$q = db_query("SELECT * FROM messages WHERE topic=:topic ORDER BY id", array("topic" => $topic->id));

$maxid = 0;
while ($message = db_next($q)) {

    $owner = db_select("users", $message->user);
    $actionq = db_query("SELECT * FROM actions WHERE message=:message AND id > :id ORDER BY id", array("message" => $message->id, "id" => $_POST['lastid']));

    while ($action = db_next($actionq)) {
        $text = $action->body;
        $strap = "Posted " . date("d M Y, H:i", $action->ts) . "";
        if ($action->action == 'E') {
            $strap = "Edited " . date("d M Y, H:i") . "";
        }
        $msg = array(
            "user" => $owner->name,
            "ts" => $message->ts,
            "action" => $action->action,
            "aid" => $action->id,
            "text" => $text,
            "strap" => $strap,
            "avatar" => md5(strtolower(trim($owner->email))),
            "color" => $owner->color,
            "side" => $owner->side,
            "id" => $message->id,   
            "date" => date("d M Y", $message->ts),
            "time" => date("H:i", $message->ts),
            "own" => ($owner->id == $user->id),
        );
        $resp['data'][] = $msg;
        $maxid = max($maxid, $action->id);
    }
}
$resp['maxid'] = $maxid;

if (count($resp['data']) == 0) {
    header("HTTP/1.1 204 No Content");
    exit(0);
}

header("Content-type: application/json");
print json_encode($resp);



