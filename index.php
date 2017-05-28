<?php
    include "chorum.inc";

?>
<html>
<head>
<script src="prototype.js"></script>
<script src="showdown/dist/showdown.js"></script>
<script src="chorum.js"></script>
<link rel='stylesheet' href='themes/<?php print $theme; ?>/theme.css'/>
<title><?php print $siteName; ?> :: Topic List</title>
</head>
<body>
<?php menu(); ?>
<?php
    $fq = db_query("SELECT * FROM forums ORDER BY id");
    while ($forum = db_next($fq)) {
?>
<div class="forum">
    <h1>
        <a href='topiclist.php?forum=<?php print $forum->id; ?>'>
            <?php print $forum->name; ?>
        </a>
        <?php if ($forum->locked == 'Y') { ?>
            <img src='assets/locked.png' title='This forum is locked' />
        <?php } ?>
    </h1>
    <table>
        <tr>
            <th>Topic</th><th>User</th><th>Replies</th><th>Updated</th>
        </tr>
<?php

    $topics = getTopicsForForum($forum->id);

    foreach ($topics as $topic) {
?>
        <tr <?php if ($topic->sticky) { ?> class='sticky' <?php } ?>>
            <td width="100%">
                <a href='topic.php?topic=<?php print $topic->id; ?>'>
                    <?php print $topic->title; ?>
                </a>
                <?php if ($topic->locked == 'Y') { ?>
                    <img src='assets/locked.png' title='This forum is locked' />
                <?php } ?>
            </td>
            <td nowrap align=center><?php print $topic->user->name; ?></td>
            <td nowrap align=center><?php print $topic->posts; ?></td>
            <td nowrap align=center><?php print date("H:i d M Y", $topic->maxts); ?></td>
        </tr>
<?php
    }
?>
    </table>
<?php
    }
    footer();
?>
</body>
</html>
