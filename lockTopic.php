<?php
require_once("chorum.inc");

if (!isAdmin($_SESSION['uid'])) {
    header("HTTP/1.1 403 Forbidden");
    exit(0);
}

$topic = db_select("topics", $_GET['topic']);
if (!$topic) {
    header("HTTP/1.1 404 Not Found");
    exit(0);
}

db_update("topics", $topic->id, array("locked" => "Y"));
header("Location: topic.php?topic=$topic->id");