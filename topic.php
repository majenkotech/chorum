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
<link href="https://fonts.googleapis.com/css?family=Handlee" rel="stylesheet">
<link rel='stylesheet' href='chorum.css'/>
<title>UECIDE :: <?php print $topic->title; ?></title>
</head>
<?php if ($user->id > 0) { ?>
<body onLoad="startChorum('messagelist', <?php print $topic->id; ?>);">
<?php } else { ?>
<body>
<?php } ?>
<div id="messagelist">
    <?php populateStaticMessages($topic->id); ?>
</div>
<div class="instructions">
This forum system supports the Github flavour of Markdown. <a href='https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet'>Click here for instructions on using Markdown</a>
</div>
<div class="footer">Powered by Chorum v0.0.1<br/>&copy;2017 Majenko Technologies</div>
</body>
</html>
