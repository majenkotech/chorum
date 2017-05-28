<?php

require_once("chorum.inc");

db_query("UPDATE users SET auth='Y' WHERE authkey=:key", array("key"=>$_GET['auth']));
?>
<head>
<link rel='stylesheet' href='themes/<?php print $theme; ?>/theme.css'/>
<title><?php print $siteName; ?> :: Validate Email</title>
</head>

<body>
<?php menu(); ?>
<div class='login'>
<p>Thank you for validating your email address. Your account has now been activated.</p>
<p>You may now <a href='signin.php'>click here to sign in to your account.</a></p>
</div>
<?php footer(); ?>
</body>
