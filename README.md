About
=====

This project allows you to dynamically change player styles using
JavaScript and CSS styles that map to Brightcove player styles.

Notes
=====

On page load, the `bcss.js` file searches through the source looking for
any link tags with a `rel` value of `brightcove-css`. When found, the URL
in the `href` attribute is loaded into an `iframe`. The `iframe` content
is then captured, parsed, and fed to the Brightcove Player API.

Limitations
===========

Because the Brightcove CSS file is being loaded and manipulated via
Javascript, it's a requirement that both the page and the CSS being loaded
are served from the same domain. For more information on cross-site
scripting, please see [this page](http://en.wikipedia.org/wiki/Cross-site_scripting).