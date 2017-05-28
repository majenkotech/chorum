<?php
    require_once("chorum.inc");
    if (!isAdmin($user->id)) {
        header("HTTP/1.1 403 Forbidden");
        exit(0);
    }

    $args = array_merge($_POST, $_GET);

    $forum = db_select("forums", $args['forum']);
    if (!$forum) {
        header("HTTP/1.1 404 Not Found");
        exit(0);
    }

    $forums = array();
    $q = db_query("SELECT * FROM forums ORDER BY name");
    while ($r = db_next($q)) {
        if ($r->id != $forum->id) {
            $forums[$r->id] = $r->name;
        }
    }

    if ($args['sure'] == "on") {
        if ($args['posts'] == "-1") {
        } else {
            db_query("UPDATE topics SET forum=:to WHERE forum=:from", array(
                "from" => $forum->id,
                "to" => $args['posts']
            ));
        }
        db_delete("forums", $forum->id);
        header("Location: manage.php");
        exit(0);
    }
        
?>

<head>
<script src="prototype.js"></script>
<script src="showdown/dist/showdown.js"></script>
<script src="chorum.js"></script>
<link rel='stylesheet' href='themes/<?php print $theme; ?>/theme.css'/>
<title><?php print $siteName; ?> :: Delete Forum</title>
</head>

<body>
<?php menu(); ?>

<h1 class="questiontitle">Delete Forum "<?php print $forum->name; ?>"</h1>
<div class="login">
<div class="center">
<form id="selforum" action='delforum.php' method="POST">
<input type="hidden" name="forum" value="<?php print $forum->id; ?>"/>
<h3>What to do with existing posts?</h3>
<select name='posts'>
<?php
    foreach ($forums as $id=>$name) {
?>
<option value='<?php print $id ?>'>Move posts to "<?php print $name; ?>"</option>
<?php
    }
?>
<option value='-1'>Delete posts</option>
</select><br/>
<br/>
<input type="checkbox" name="sure">I am sure</input><br/>
<br/>
<input type="submit" value="Confirm"/>
</form>
</div>
</div>


</div>
<?php
    if ($error != "") {
?>
<div class='error'>
<?php print $error; ?>
</div>
<?php
    }
    footer();
?>
</body>
