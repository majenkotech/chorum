<?php
    include "chorum.inc";

    if ($_SESSION['uid'] <= 0) {
        header("Location: signin.php");
        exit(0);
    }


?>
<html>
<head>
<script src="prototype.js"></script>
<script src="showdown/dist/showdown.js"></script>
<script src="chorum.js"></script>
<link rel='stylesheet' href='themes/<?php print $theme; ?>/theme.css'/>
<title><?php print $siteName; ?> :: Unread Topics</title>
</head>
<body onLoad="startUnreadTopicUpdateTask();">
<?php menu(); ?>
<?php
    $unread = array();
    $q = db_query("select max(messages.id) as maxid, topics.id as topic from topics,messages,latest_actions where latest_actions.message=messages.id and topics.id=messages.topic and (latest_actions.action = 'P' or latest_actions.action='E') group by topic order by maxid desc");
    while ($r = db_next($q)) {
        $unread[$r->topic] = $r->maxid;
    }

    $views = array();
    $q = db_query("select maxid, topic from user_views where user=:user", array("user" => $user->id));
    while ($r = db_next($q)) {
        $views[$r->topic] = $r->maxid;
    }
?>
<div class="forum">
    <h1>Unread Posts</h1>
    </h1>
    <table>
        <tbody id="unreadList">
        <tr>
            <th width="100%">Topic</th><th>User</th><th>Replies</th><th>Updated</th>
        </tr>
<?php

    foreach ($unread as $topicid=>$maxid) {
        if ($views[$topicid] >= $maxid) {
            continue;
        }
        $topic = getTopic($topicid);
?>
        <tr class="unreadRowPlaceholder<?php if ($topic->sticky) { print " sticky"; } ?>">
            <td class="unreadTitle">
                <a href='topic.php?topic=<?php print $topic->id; ?>'>
                    <?php print $topic->title; ?>
                </a>
                <?php if ($topic->locked == 'Y') { ?>
                    <img src='assets/locked.png' title='This forum is locked' />
                <?php } ?>
            </td>
            <?php
                $u = $topic->message_user->name;
                if ($u == "") {
                    $u = $topic->user->name;
                }
            ?>
            <td class="unreadUser"><?php print $u; ?></td>
            <td class="unreadReplies"><?php print $topic->posts; ?></td>
            <td class="unreadUpdated"><?php print date("H:i d M Y", $topic->maxts); ?></td>
        </tr>

<?php
        $c++;
        if ($c >= 10) break;
    }
?>
    </tbody>
    </table>
</div>
<?php
    
    footer();
?>
</body>
</html>
