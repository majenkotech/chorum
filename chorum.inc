<?php

session_start();

require_once 'parsedown/Parsedown.php';

// Configure this line for your DB.
$db = new PDO("mysql:dbname=chatterbox;host=localhost","chatterbox", "chatterbox");
db_query("SET NAMES 'utf8' COLLATE 'utf8_general_ci'");



function db_query($query,$params = array())
{
    global $db;
    $q = $db->prepare($query);
    $q->execute($params);
    $e = $q->errorInfo();
    if($e[0]!='00000')
    {
        print "<span class='error'>";
        print $e[2];
        print "</span>";
        exit;
    }
    return $q;
}

function db_next($query)
{
    global $db;
    $next = $query->fetchObject();
    return $next;
}

function db_select($table,$record)
{
    $query = sprintf("SELECT * FROM `%s` WHERE id=:id",$table);
    $q = db_query($query,array("id" => $record));
    $r = db_next($q);
    return $r;
}

function db_insert($table,$data)
{
    $fields = array();
    $values = array();
    foreach($data as $k=>$v)
    {
        $fields[] = $k;
        $values[] = ":" . $k;
    }
    $query = sprintf("INSERT INTO `%s` (" . implode(",",$fields) . ") VALUES (" . implode(",",$values) . ")",$table);
    $q = db_query($query,$data);
    $id = db_id();
    return $id;
}

function db_id()
{
    global $db;
    return $db->lastInsertId();
}

function populateStaticMessages($id) {

    if ($_SESSION['uid'] > 0) {
        return;
    }
    $topic = db_select("topics", $id);
    $owner = db_select("users", $topic->user);
    $pd = new Parsedown();
?>
    <h1 class='questiontitle'><?php print htmlspecialchars($topic->title); ?></h1>
    <div class='questionuser'>Asked by <?php print $owner->name; ?> at <?php print date("H:i", $topic->ts); ?> on <?php print date("d M Y", $topic->ts); ?>.</div>
    <div class='questionbox'><?php print $pd->text($topic->message); ?></div>
    <div class='signup'><a href='signup.php'>Sign up</a> or <a href='signin.php'>log in</a> for live updates and to post messages.</div>
<?php
    $q = db_query("SELECT * FROM messages WHERE topic=:topic ORDER BY id", array("topic" => $topic->id));

    while ($message = db_next($q)) {

        $actionq = db_query("SELECT * FROM actions WHERE message=:message ORDER BY id DESC", array("message" => $message->id));
        $action = db_next($actionq);
        if ($action->action == "D") {
            continue;
        }
        $owner = db_select("users", $message->user);

        $text = $pd->text($action->body);
        $strap = "Posted " . date("d M Y, H:i", $action->ts) . "";
        if ($action->action == 'E') {
            $strap = "Edited " . date("d M Y, H:i", $action->ts) . "";
        }
        if ($owner->side == "left") {
?>
<div class='message mb-left'>
    <div class='messageMeta-left'>
        <img src='https://www.gravatar.com/avatar/<?php print md5(strtolower(trim($owner->email))); ?>.png?s=80'/>
        <div class='messageMetaUser'><?php print $owner->name; ?></div>
    </div>
    <div class='messageBody triangle-right left <?php print $owner->color; ?>'>
        <div class='messageText'><?php print $text; ?></div>
        <div class='messageStrap'><?php print $strap; ?></div>
    </div>
</div>
<br clear='all' />
<?php } else { ?>
<div class='message mb-right'>
    <div class='messageBody triangle-right right <?php print $owner->color; ?>'>
        <div class='messageText'><?php print $text; ?></div>
        <div class='messageStrap'><?php print $strap; ?></div>
    </div>
    <div class='messageMeta-right'>
        <img src='https://www.gravatar.com/avatar/<?php print md5(strtolower(trim($owner->email))); ?>.png?s=80'/>
        <div class='messageMetaUser'><?php print $owner->name; ?></div>
    </div>
</div>
<br clear='all' />
<?php
        }
    }
}
