<?php
    include "chorum.inc";

?>
<html>
<head>
<script src="prototype.js"></script>
<script src="showdown/dist/showdown.js"></script>
<script src="chorum.js"></script>
<link rel='stylesheet' href='chorum.css'/>
<title><?php print $siteName; ?> :: Topic List</title>
</head>
<body>
<?php menu(); ?>
<?php
    $forum = db_select("forums", $_GET['forum']);
?>
<div class="forum">
    <h1><?php print $forum->name; ?></h1>
    <table>
        <tr>
            <th>Topic</th><th>User</th><th>Replies</th><th>Updated</th>
        </tr>
<?php

    $topics = getTopicsForForum($forum->id);

    $c = 0;
    foreach ($topics as $topic) {
?>
        <tr <?php if ($topic->sticky) { ?> class='sticky' <?php } ?>>
            <td width="100%"><a href='topic.php?topic=<?php print $topic->id; ?>'><?php print $topic->title; ?></a></td>
            <td nowrap align=center><?php print $topic->user->name; ?></td>
            <td nowrap align=center><?php print $topic->posts; ?></td>
            <td nowrap align=center><?php print date("H:i d M Y", $topic->maxts); ?></td>
        </tr>
<?php
        $c++;
        if ($c >= 10) break;
    }
?>
    </table>
<?php
    
    footer();
?>
</body>
</html>
