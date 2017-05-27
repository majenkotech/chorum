<?php
    require_once("chorum.inc");

    if ($_POST['username'] != "") {
        sendEmailAuth($_POST['username']);
        header("Location: waitauth.php");    
        exit(0);
    }
?>

<head>
<link rel='stylesheet' href='chorum.css'/>
<title><?php print $siteName; ?> :: Re-send Auth</title>
</head>

<body>
<?php menu(); ?>
<div class='login'>
    <form action='resendauth.php' method='POST'>
        <table>
            <tr>
                <td>Username:</td>
                <td><input type='text' name='username' value='<?php print $_POST['username']; ?>'/></td>
            </tr>
            <tr>
                <td colspan=2 align="right">
                    <input type="submit" value="Re-send" />
                </td>
            </tr>
        </table>
    </form>
<p>Enter your username to re-send your authentication email.</p>
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
