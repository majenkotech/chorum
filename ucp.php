<?php
    require_once("chorum.inc");
    if ($_SESSION['uid'] <= 0) {
        header("Location: signin.php");
        exit(0);
    }

    $user = db_select("users", $_SESSION['uid']);
    function updateUser() {
        global $user;
        if (array_key_exists("submit", $_POST)) {
            $username = trim($_POST['username']);
            if ($username == "") {  
                return("Error: invalid username");
            }

            $email = trim($_POST['email']);
            if (!preg_match("/^(.*)@(.*)$/", $email, $m)) {
                return("Error: invalid email address");
            }

            db_update("users", $user->id, array(
                "name" => $username,
                "email" => $email,
                "notifications" => (($_POST['notifications'] == "on") ? 'Y' : 'N')
            ));
        }
    }

    $error = updateUser();


?>

<head>
<link rel='stylesheet' href='chorum.css'/>
<title><?php print $siteName; ?> :: Log In</title>
</head>

<body>
<?php menu(); ?>
<div class='login'>
    <form action='ucp.php' method='POST'>
        <table>
            <tr>
                <td>Username:</td>
                <td><input type='text' name='username' value='<?php print $user->name; ?>'></td>
            </tr>
            <tr>
                <td>Email:</td>
                <td><input type='text' name='email' value='<?php print $user->email; ?>'></td>
            </tr>
            <tr>
                <td colspan=2>
<input type='checkbox' name='notifications' <?php if ($user->notifications == 'Y') print "checked"; ?>>Popup Notifications</checkbox>
                </td>
            </tr>
            <tr><td colspan=2><hr/></td></tr>
            <tr>
                <td>Password:</td>
                <td><input type='password' name='password'></td>
            </tr>
            <tr>
                <td>Password (again):</td>
                <td><input type='password' name='password2'></td>
            </tr>
            <tr>
                <td colspan=2 align="right">
                    <input type="submit" name="submit" value="Save" />
                </td>
            </tr>
        </table>
    </form>
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
