<?php
    include "chorum.inc";

?>
<html>
<head>
<script src="prototype.js"></script>
<script src="showdown/dist/showdown.js"></script>
<script src="chorum.js"></script>
<link href="https://fonts.googleapis.com/css?family=Handlee" rel="stylesheet">
<link rel='stylesheet' href='chorum.css'/>
<title>UECIDE</title>
</head>
<body>
<?php
    $q = db_query("SELECT * FROM topics ORDER BY id DESC");
    while ($r = db_next($q)) {
?>
<a href='topic.php?topic=<?php print $r->id; ?>'><?php print $r->title; ?></a><br/>
<?php
    }
?>
<div class="footer">Powered by Chorum v0.0.1<br/>&copy;2017 Majenko Technologies</div>
</body>
</html>
