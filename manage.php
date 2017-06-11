<?php
    require_once("chorum.inc");
    if (!isAdmin($user->id)) {
        header("HTTP/1.1 403 Forbidden");
        exit(0);
    }

    $args = array_merge($_POST, $_GET);

    if (array_key_exists("forum", $args)) {
        $forum = db_select("forums", $args['forum']);
        if (!$forum) {
            header("HTTP/1.1 404 Not found");
            exit(0);
        }
    }

    $forums = array();
    $q = db_query("SELECT * FROM forums ORDER BY name");
    while ($r = db_next($q)) {
        $forums[$r->id] = $r->name;
    }
?>

<head>
<script src="prototype.js"></script>
<script src="showdown/dist/showdown.js"></script>
<script src="chorum.js"></script>
<link rel='stylesheet' href='themes/<?php print $theme; ?>/theme.css'/>
<title><?php print $siteName; ?> :: Manage Forums</title>
</head>

<body>
<?php menu(); ?>

<div class="center">
<form id="selforum" action='manage.php' method="POST">
<select name='forum' onChange='$(selforum).submit();'>
<option value='-1'>Select Forum...</option>
<?php
    foreach ($forums as $id=>$name) {
?>
<option value='<?php print $id ?>'>&nbsp;&nbsp;&nbsp;<?php print $name; ?></option>
<?php
    }
?>
</select>
</form>
</div>

<?php if ($forum) { ?>
<div class="login">
<form id="editform" action='manage.php' method="POST">
<input type='hidden' name='forum' value='<?php print $forum->id; ?>'/>
<table width="100%">
<tr>
    <td>
        <b>Title:</b>
    </td>
    <td>
        <input type='text' name="name" value="<?php print $forum->name; ?>">
    </td>
</tr>
<tr>
    <td>&nbsp;</td>
    <td>
        <input type='checkbox' name="locked" <?php if ($forum->locked == 'Y') { print "checked"; } ?>>Locked</input>
    </td>
</tr>
<tr>
    <td>&nbsp;</td>
    <td>
        <input type='checkbox' name="hidden" <?php if ($forum->hidden == 'Y') { print "checked"; } ?>>Hidden (only administrators can see it)</input>
    </td>
</tr>
<tr>
    <td colspan=2 align=right><input type='submit' value='Save'/></td>
</tr>
</table>
</forum>
<hr/>

<ul class="menu">
<li><a href='delforum.php?forum=<?php print $forum->id; ?>'>Delete forum</a></li>
</ul>

</div>

<?php } else { ?>


</div>

<div class="login">
<h3>Create new forum</h3>
<form id="editform" action='createforum.php' method="POST">
<table width="100%">
<tr>
    <td>
        <b>Title:</b>
    </td>
    <td>
        <input type='text' name="name" value="">
    </td>
</tr>
<tr>
    <td>&nbsp;</td>
    <td>
        <input type='checkbox' name="locked">Locked</input>
    </td>
</tr>
<tr>
    <td>&nbsp;</td>
    <td>
        <input type='checkbox' name="hidden">Hidden (only administrators can see it)</input>
    </td>
</tr>
<tr>
    <td colspan=2 align=right><input type='submit' value='Create'/></td>
</tr>
</table>
</div>

<?php } ?>

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
