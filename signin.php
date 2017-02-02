<?php
    require_once("chorum.inc");

    if ($_POST['username'] != "") {
        $pw = hash('sha256', $_POST['password']);
        $q = db_query("SELECT * FROM users WHERE name=:name and password=:password", array("name" => $_POST['username'], "password" => $pw));
        if ($r = db_next($q)) {
            if ($r->auth != 'Y') {
                header("Location: waitauth.php");
                exit(0);
            }
            $_SESSION['uid'] = $r->id;
            db_update("users", $r->id, array(
                "lastip" => $_SERVER['REMOTE_ADDR'],
                "lastlogin" => time()
            ));
            header("Location: index.php");
            exit(0);
        }
        $error = "Error logging in";
    }
?>

<head>
<link rel='stylesheet' href='chorum.css'/>
<title><?php print $siteName; ?> :: Log In</title>
</head>

<body>
<?php menu(); ?>
<div class='login'>
    <form action='signin.php' method='POST'>
        <table>
            <tr>
                <td>Username:</td>
                <td><input type='text' name='username'></td>
            </tr>
            <tr>
                <td>Password:</td>
                <td><input type='password' name='password'></td>
            </tr>
            <tr>
                <td colspan=2 align="right">
                    <input type="submit" value="Log In" />
                </td>
            </tr>
        </table>
    </form>
<p>Don't have an account? <a href='signup.php'>Click here</a> to create one!</p>
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
