<?php
    require_once("chorum.inc");
?>
<head>
<link rel='stylesheet' href='themes/<?php print $theme; ?>/theme.css'/>
<script src='prototype.js'></script>
<script src='chorum.js'></script>
<title><?php print $siteName; ?> :: Cookie List</title>
</head>

<body onLoad='displayCookies("cookieList");'>
<?php menu(); ?>
<h1>Cookies</h1>
<h2>What do we use cookies for?</h2>
<div class='questionBox'>
<p>We use cookies for two things and two things alone.</p>
<p>First and foremost they provide the ability to log in to the
site. Without a cookie it is very hard to remember who you are
from one page to the next, which makes posting messages on the
site almost impossible. This cookie lasts for 30 days or until
you log out.</p>
<p>The second use for a cookie (and probably the most
important one) is to remember if you have clicked "Close this
popup" on the cookie alert popup. Without that the popup would
keep coming back, which would really annoy you. This
cookie lasts for up to a year.</p>
</div>
<h2>Can I remove my cookies any time?</h2>
<div class='questionBox'>
<p>Yes. All browsers provide a means to remove cookies. For instancein Google Chrome you select the (i) symbol next to the URL at the top of the window.</p>
<p>There will be no consequences deleting the cookies for this site. All that will happen is that you will be asked to log in again and the cookie information popup will re-appear.</p>
</div>
<h2>Cookie List</h2>
<div class='questionBox'>
<p>This is a report showing you the cookies set on your computer or device by this website.</p>
<div class='cookieList' id='cookieList'></div>    
</div>
<?php
    footer();
?>
</body>
