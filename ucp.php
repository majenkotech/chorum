<?php
    require_once("chorum.inc");
    if ($session->get("uid") <= 0) {
        header("Location: signin.php");
        exit(0);
    }

    $user = db_select("users", $session->get("uid"));
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

            $color = trim($_POST['color']);
            if ($color == "") {
                $color = "red";
            }
            $side = trim($_POST['side']);
            if ($side == "") {
                $side = "left";
            }
            $p1 = trim($_POST['password']);
            $p2 = trim($_POST['password2']);
            if ($p1 != "") {
                if ($p1 == $p2) {
                    $crpw = hash('sha256', $p1);
                    db_update("users", $user->id, array(
                        "name" => $username,
                        "email" => $email,
                        "color" => $color,
                        "side" => $side,
                        "password" => $crpw,
                        "notifications" => (($_POST['notifications'] == "on") ? 'Y' : 'N')
                    ));
                } else {
                    return "Error: passwords do not match";
                }
            } else {
                db_update("users", $user->id, array(
                    "name" => $username,
                    "email" => $email,
                    "color" => $color,
                    "side" => $side,
                    "notifications" => (($_POST['notifications'] == "on") ? 'Y' : 'N')
                ));
            }
        }
        return "Settings updated OK";
    }

    $error = updateUser();


?>

<head>
<link rel='stylesheet' href='themes/<?php print $theme; ?>/theme.css'/>
<title><?php print $siteName; ?> :: Control Panel</title>
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
            <tr>
                <td>Colour:</td>
                <td>
                    <select name="color">
                        <option value="red" <?php if($user->color == "red") print "selected"; ?>>Red</option>
                        <option value="blue" <?php if($user->color == "blue") print "selected"; ?>>Blue</option>
                        <option value="green" <?php if($user->color == "green") print "selected"; ?>>Green</option>
                        <option value="yellow" <?php if($user->color == "yellow") print "selected"; ?>>Yellow</option>
                        <option value="purple" <?php if($user->color == "purple") print "selected"; ?>>Purple</option>
                        <option value="cyan" <?php if($user->color == "cyan") print "selected"; ?>>Cyan</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Appear on:</td>
                <td>
                    <select name="side">
                        <option value="left" <?php if($user->side == "left") print "selected"; ?>>Left</option>
                        <option value="right" <?php if($user->side == "right") print "selected"; ?>>Right</option>
                    </select>
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
