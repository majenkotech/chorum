<?php
    include "chorum.inc";

    if ($session->get("uid") <= 0) {
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
<div class="forum">
    <h1>Unread Posts</h1>
    </h1>
    <div id="unreadlist">
    </div>
</div>
<?php
    
    footer();
?>
</body>
</html>
