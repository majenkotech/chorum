<?php
    require_once("chorum.inc");

    if ($_SESSION['uid'] <= 0) {
        header("Location: signin.php");
        exit(0);
    }

    $user = db_select("users", $_SESSION['uid']);

    $error = "";
    $title = trim($_POST['title']);
    if ($title != "") {

        $forum = $_POST['forum'];
        $body = trim($_POST['body']);

        if ($forum <= 0) {
            $error = "Error: you haven't selected a forum to post to";
        } else if (!$user) {
            $error = "Error: you are not logged in";
        } else if (!canPostInForum($forum)) {
            $error = "Error: the forum is locked";
        } else {
            $id = db_insert("topics", array(
                "title" => $title,
                "message" => $body,
                "user" => $user->id,
                "forum" => $forum,
                "ts" => time()
            ));
            header("Location: topic.php?topic=" . $id);
            exit(0);
        }
    }
?>
<head>
<link rel='stylesheet' href='themes/<?php print $theme; ?>/theme.css'/>
<title><?php print $siteName; ?> :: Post New Topic</title>
</head>

<body>
<?php menu(); ?>
<div class='newpost'>
    <form action='newtopic.php' method='POST'>
        <table width="100%">
            <tr>
                <td>Forum:</td>
                <td>
                    <select name='forum'>
                        <option value=0>Select a forum to post in...</option>
<?php
    $forums = getAvailableForums();
    foreach ($forums as $forum) {
?>
                        <option <?php if ($_POST['forum'] == $forum->id) { print "selected"; } ?> value=<?php print $forum->id; ?>><?php print $forum->name; ?></option>
<?php
     }
?>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Title:</td>
                <td><input type='text' name='title' value="<?php print $_POST['title']; ?>"></td>
            </tr>
            <tr>
                <td colspan=2>Message:</td>
            </tr>
                <td colspan=2>
<textarea name="body"><?php print $_POST['body']; ?>
</textarea>
                </td>
            </tr>
            <tr>
                <td colspan=2 align="right">
                    <input type="submit" value="Post" />
                </td>
            </tr>
        </table>
    </form>
    <div class='messagePostHint'>
    This forum system supports the Github flavour of Markdown. <a href='https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet'>Click here for instructions on using Markdown</a>
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
footer(); ?>
</body>
