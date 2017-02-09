<?php

session_start();

require_once 'config.php';
require_once 'parsedown/Parsedown.php';
require_once 'PHPMailer/PHPMailerAutoload.php';

// Configure this line for your DB.
$db = new PDO("mysql:dbname=$dbName;host=$dbHost", $dbUsername, $dbPassword);
db_query("SET NAMES 'utf8' COLLATE 'utf8_general_ci'");

if (array_key_exists("ChorumAuthKey", $_COOKIE)) {
    if (array_key_exists("ChorumAuthUser", $_COOKIE)) {
        $q = db_query("SELECT * FROM users WHERE persist=:key AND name=:username AND persist!=''", array(
            "key" => $_COOKIE['ChorumAuthKey'],
            "username" => $_COOKIE['ChorumAuthUser']
        ));
        if ($r = db_next($q)) {
            $_SESSION['uid'] = $r->id;
        }
    }
}


$user = db_select("users", $_SESSION['uid']);


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

function db_update($table,$id,$data)
{
    $values = array();
    foreach($data as $k=>$v)
    {
        $values[] = "`" . $k . "`" . "=:" . $k;
    }
    $query = sprintf("UPDATE `%s` set " . implode(",",$values) . " WHERE id=:id",$table);
    $data['id'] = $id;

    $q = db_query($query,$data);
    $id = db_id();
    return $id;
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

        $vq = db_query("SELECT SUM(value) AS rating FROM likes WHERE message=:id", array("id" => $message->id));
        $vr = db_next($vq);
        $votes = $vr->rating - 0;

        $text = $pd->text($action->body);
        $strap = "Posted " . date("d M Y, H:i", $action->ts) . ", " . $votes . " votes";
        if ($action->action == 'E') {
            $strap = "Edited " . date("d M Y, H:i", $action->ts) . ", " . $votes . " votes";
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

function menu() {
?>
<ul class='menu'>
<li><a href='index.php'>Forum List</a></li>
<?php
    if ($_SESSION['uid'] > 0) {
?>
<li><a href='newtopic.php'>New Topic</a></li>
<li><a href='ucp.php'>Control Panel</a></li>
<li><a href='logout.php'>Log Out</a></li>
<?php
    } else {
?>
<li><a href='signup.php'>Sign Up</a></li>
<li><a href='signin.php'>Log In</a></li>
<?php
    }
?>
</ul>
<?php
}

function footer() {
?>
<div class="footer"><img src='assets/Chorum-small.png'/><br/>Powered by Chorum v0.0.1<br/>&copy;2017 Majenko Technologies</div>
<?php
    cookiePopup();
}

function sendEmailAuth($username) {
    global $authSubject;
    global $authBody;
    global $siteRoot;

    $q = db_query("SELECT * FROM users WHERE name=:u AND auth='N'", array("u" => $username));
    if ($r = db_next($q)) {
        $ak = "";
        $num = rand(30, 50);
        for ($i = 0; $i < $num; $i++) {
            $ak .= chr(rand(ord('A'), ord('Z')));
        }
        db_update("users", $r->id, array(
            "authkey" => $ak
        ));
        $body = str_replace("%AUTH_URL%", $siteRoot . "/auth.php?auth=" . $ak, $authBody);
        sendEmail($r->email, $authSubject, $body);
    }
}

function sendEmail($to, $subject, $body, $attachments = array()) {
    global $mailSender;
    global $mailName;
    global $mailSMTPHost;
    global $mailSMTPPort;
    global $mailSMTPAuth;
    global $mailSMTPTLS;
    global $mailSMTPUser;
    global $mailSMTPPassword;

    $email = new PHPMailer(true);
    try {
        $email->setFrom($mailSender, $mailName);
        $email->Subject = $subject;
        $email->Body = $body;
        $email->isHTML(true);
        $email->addAddress($to);
        foreach ($attachments as $filename => $data) {
            $email->addStringAttachment($data, $filename);
        }
        $email->Host = $mailSMTPHost;
        $email->Port = $mailSMTPPort;
        $email->SMTPAuth = $mailSMTPAuth;
        $email->SMTPSecure = $mailSMTPTLS ? "tls" : "";
        if ($mailSMTPAuth) {
            $email->Username = $mailSMTPUser;
            $email->Password = $mailSMTPPassword;
        }
        $email->isSMTP();
        $email->send();
    } catch (phpmailerException $e) {
        echo $e->errorMessage(); //Pretty error messages from PHPMailer
        exit(0);
    } catch (Exception $e) {
        echo $e->getMessage(); //Boring error messages from anything else!
        exit(0);
    }
}

function getTopicsForForum($forum) {
    $topics = array();

    $tq = db_query("select * from topics where forum = :forum and sticky='N'", array("forum" => $forum));
    while ($tr = db_next($tq)) {
        $u = db_select("users", $tr->user);
        $tr->user = $u;
        $mq = db_query("select count(messages.id) as posts, max(latest_actions.ts) as maxts, max(latest_actions.id) as maxid from messages, latest_actions where messages.topic = :topic and latest_actions.message = messages.id and (latest_actions.action = 'P' or latest_actions.action = 'E')", array("topic" => $tr->id));
        $mr = db_next($mq);
        $tr->sticky = false;
        $tr->posts = $mr->posts;
        $tr->maxts = $mr->maxts;
        $tr->maxid = $mr->maxid;
        if ($tr->maxid == "") {
            $tr->maxid = 0;
        }
        if ($tr->maxts == "") {
            $tr->maxts = $tr->ts;
        }
        $topics[] = $tr;
    }

    usort($topics, "topsort");
    $tq = db_query("select * from topics where forum = :forum and sticky='Y' order by ts", array("forum" => $forum));
    $sticky = array();
    while ($tr = db_next($tq)) {
        $u = db_select("users", $tr->user);
        $tr->user = $u;
        $mq = db_query("select count(messages.id) as posts, max(latest_actions.ts) as maxts, max(latest_actions.id) as maxid from messages, latest_actions where messages.topic = :topic and latest_actions.message = messages.id and (latest_actions.action = 'P' or latest_actions.action = 'E')", array("topic" => $tr->id));
        $mr = db_next($mq);
        $tr->sticky = true;
        $tr->posts = $mr->posts;
        $tr->maxts = $mr->maxts;
        $tr->maxid = $mr->maxid;
        if ($tr->maxid == "") {
            $tr->maxid = 0;
        }
        if ($tr->maxts == "") {
            $tr->maxts = $tr->ts;
        }
        $sticky[] = $tr;
    }
    
    return array_merge($sticky, $topics);
}

function topsort($a, $b) {
    if ($a->maxts == $b->maxts) {
        return 0;
    }
    if ($a->maxts > $b->maxts) {
        return -1;
    }
    return 1;
}


function getAvailableForums() {
    $isAdmin = false;
    $isModerator = false;
    if ($_SESSION['uid'] > 0) {
        $user = db_select("users", $_SESSION['uid']);
        if ($user->admin == 'Y') $isAdmin = true;
        if ($user->moderator == 'Y') $isModerator = true;
    }

    $forums = array();
    $q = db_query("SELECT * FROM forums ORDER BY name");
    while ($r = db_next($q)) {
        $allowed = true;
        if ($r->locked == 'Y' && !$isAdmin) {
            $allowed = false;
        }
        if ($allowed) {
            $forums[$r->id] = $r;
        }
    }
    return $forums;
}

function canPostInForum($forum) {
    if ($_SESSION['uid'] > 0) {
        $user = db_select("users", $_SESSION['uid']);
        if ($user->admin == 'Y') return true;
    }

    $forum = db_select("forums", $forum);
    if (!$forum) return false;
    if ($forum->locked == 'Y') return false;

    return true;
}

function topicTools($tid) {
    if ($_SESSION['uid'] <= 0) {
        return;
    }
    $topic = db_select("topics", $tid);
    $user = db_select("users", $_SESSION['uid']);
?>
<div class='topicTools'>
<ul>
<?php 
    if ($user->admin == 'Y') {
?>
<?php
        if ($topic->locked == 'N') {
?>
<li><img src='assets/locked.png'/>
<a href='lockTopic.php?topic=<?php print $tid; ?>'>Lock topic</a></li>
<?php   } else { ?>
<li><img src='assets/locked.png'/>
<a href='unlockTopic.php?topic=<?php print $tid; ?>'>Unock topic</a></li>
<?php   }
    }
?>
</div>
<?php
}

function isAdmin($uid) {
    if ($uid <= 0) return false;
    $user = db_select("users", $uid);
    if (!$user) return false;
    if ($user->admin != 'Y') return false;
    return true;
}

function audit($msg) {
    db_insert("audit", array(
        "user" => $_SESSION['uid'],
        "log" => $msg,
        "ts" => time()
    ));
}

function getMessageData($msgid) {
    global $user;

    $message = db_select("messages", $msgid);

    $actionq = db_query("SELECT * FROM actions WHERE message=:message ORDER BY id DESC", array("message" => $message->id));
    $action = db_next($actionq);

    $owner = db_select("users", $message->user);
    $text = $action->body;

    $q = db_query("SELECT SUM(value) AS rating FROM likes WHERE message=:id", array("id" => $message->id));
    if ($likes = db_next($q)) {
        $rating = $likes->rating - 0;
    } else {
        $rating = 0;
    }

    $q = db_query("SELECT SUM(value) AS rating FROM likes,messages WHERE messages.user=:id and likes.message=messages.id", array("id" => $owner->id));
    if ($likes = db_next($q)) {
        $userrating = $likes->rating - 0;
    } else {
        $userrating = 0;
    }

    $q = db_query("SELECT value FROM likes WHERE message=:msg AND user=:usr", array("msg" => $message->id, "usr" => $_SESSION['uid']));
    if ($r = db_next($q)) {
        $voted = $r->value - 0;
    } else {
        $voted = 0;
    }

    $strap = "Posted " . date("d M Y, H:i", $action->ts) . ", " . $rating . " votes";
    if ($action->action == 'E') {
        $strap = "Edited " . date("d M Y, H:i", $action->ts) . ", " . $rating . " votes";
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
        "uid" => $user->id,
        "rating" => $rating,
        "userrating" => $userrating,
        "voted" => $voted
    );
    return $msg;
}

function cookiePopup() {
    if (array_key_exists("CookiePopup", $_COOKIE)) {
        return;
    }
?>
<div class='cookiePopup' id='cookiePopup'>
<p>This site uses cookies to maintain your current login session and improve your browsing experience. By continuing to use this site you agree to the placing of these
cookies on your computer or device.</p>
<a href='#' onClick='closeCookiePopup();'>Close this popup</a>
</div>
<?php
}
