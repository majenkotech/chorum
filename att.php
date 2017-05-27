<?php
require_once("chorum.inc");

$id = $_GET['id'] - 0;

$q = db_query("select * from attachments where id=:id", array("id" => $id));
if ($r = db_next($q)) {
    header("Content-type: " . $r->mime);
    print $r->data;
    db_update("attachments", $r->id, array("downloads" => $r->downloads + 1));
} else {
    header("HTTP/1.0 400 Bad Request");
}
