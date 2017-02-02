<?php
    require_once("chorum.inc");

    if ($_SESSION['uid'] <= 0) {
        header("Location: signin.php");
        exit(0);
    }

    $user = db_select("users", $_SESSION['uid']);

    if ($_POST['title'] != "") {
        $id = db_insert("topics", array(
            "title" => $_POST['title'],
            "message" => $_POST['body'],
            "user" => $user->id,
            "ts" => time()
        ));
        header("Location: topic.php?topic=" . $id);
        exit(0);
    }

?>
<head>
<link rel='stylesheet' href='chorum.css'/>
<title><?php print $siteName; ?> :: Post New Topic</title>
</head>

<body>
<?php menu(); ?>
<div class='newpost'>
    <form action='newtopic.php' method='POST'>
        <table width="100%">
            <tr>
                <td>Title:</td>
                <td><input type='text' name='title'></td>
            </tr>
            <tr>
                <td colspan=2>Message:</td>
            </tr>
                <td colspan=2>
<textarea name="body">
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
<?php footer(); ?>
</body>
