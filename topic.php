<?php
    include "chorum.inc";

    $uid = $_SESSION['uid'];
    $user = db_select("users", $uid);
    $topic = db_select("topics", $_GET['topic']);
?>
<html>
<head>
<script src="prototype.js"></script>
<script src="showdown/dist/showdown.js"></script>
<script src="chorum.js"></script>
<link rel='stylesheet' href='chorum.css'/>
<title><?php print $siteName; ?> :: <?php print $topic->title; ?></title>
</head>
<?php if ($user->id > 0) { ?>
<body onLoad="startChorum('messagelist', <?php print $topic->id; ?>);">
<?php } else { ?>
<body>
<?php } ?>
<?php menu(); ?>
<div id="messagelist">
    <?php populateStaticMessages($topic->id); ?>
</div>
<?php footer(); ?>
</body>
</html>
