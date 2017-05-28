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
<p>We use cookies for three things and three things alone.</p>
<p>First and foremost they provide the ability to log in to the
site. Without a cookie it is very hard to remember who you are
from one page to the next, which makes posting messages on the
site almost impossible. This cookie is deleted when you close
your browser window.</p>
<p>Secondly an optional pair of cookies are used to keep you
logged in across visits to the site. This saves you logging
in each and every time you come here. This only happens if you
specifically select "Keep me logged in" when logging in. This
cookie lives for up to a year.</p>
<p>The third and final use for a cookie (and probably the most
important one) is to remember if you have clicked "Close this
popup" on the cookie alert popup. Without that the popup would
keep coming back, which would really annoy you. Again, this
cookie lasts for up to a year.</p>
</div>
<h2>Can I remove my cookies any time?</h2>
<div class='questionBox'>
<p>Yes. All browsers provide a means to remove cookies. For instancein Google Chrome you select Settings from the menu, then find the
"Show Advanced Settings". In there is a "Contrent settings..." which when clicked brings up a new box. The "All cookies and site data..." button then allows you to selectively delete any cookies you like.</p>
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
