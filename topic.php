<?php
    include "chorum.inc";

    $uid = $_SESSION['uid'];
    $user = db_select("users", $uid);
    $topic = db_select("topics", $_GET['topic']);
?>
<html>
<head>
<script src="emojify.js"></script>
<script src="prototype.js"></script>
<script src="showdown/dist/showdown.js"></script>
<script src="chorum.js"></script>
<link rel='stylesheet' href='chorum.css'/>
<title><?php print $siteName; ?> :: <?php print $topic->title; ?></title>
</head>
<?php if ($user->id > 0) { ?>
<body onLoad="startChorum('messagelist', <?php print $topic->id; ?>);">
<?php } else { ?>
<body onLoad="emojify.run($('messagelist'));">
<?php } ?>
<?php menu(); ?>
<div id="messagelist">
    <?php populateStaticMessages($topic->id); ?>
</div>
<?php topicTools($topic->id); ?>
<?php footer(); ?>
</body>
</html>
