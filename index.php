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
    $q = db_query("SELECT * FROM topics ORDER BY id DESC");
    while ($r = db_next($q)) {
?>
<a href='topic.php?topic=<?php print $r->id; ?>'><?php print $r->title; ?></a><br/>
<?php
    }
    footer();
?>
</body>
</html>
