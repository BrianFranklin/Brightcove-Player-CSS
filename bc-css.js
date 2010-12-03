/**
 * BC CSS PLAYER WRAPPER 1.0 (14 OCTOBER 2010)
 * (Formerly known as BCSS)
 *
 * REFERENCES:
 *	 Website: http://opensource.brightcove.com
 *	 Source: http://github.com/brightcoveos/
 *
 * AUTHORS:
 *	 Brian Franklin, Professional Services Engineer, Brightcove
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE. YOU AGREE TO RETAIN IN THE SOFTWARE AND ANY
 * MODIFICATIONS TO THE SOFTWARE THE REFERENCE URL INFORMATION, AUTHOR ATTRIBUTION AND
 * CONTRIBUTOR ATTRIBUTION PROVIDED HEREIN.
 */

var BCSS = new function () {
	this.bc;
	this.experience;
	this.player;
	this.queue = null;

	/**
	 * Initializes the script and finds the appropriate CSS files
	 * @since 1.0
	 */
	this.init = function () {
		var tags = document.getElementsByTagName("link");

		for (var i = 0; i < tags.length; i++) {
			if ((typeof tags[i].getAttribute("rel") != undefined) && (tags[i].getAttribute("rel") == "brightcove-css")) {
				BCSS.inject(tags[i].getAttribute("href"));
			}
		}
	};

	/**
	 * Injects a CSS file as an iFrame into the DOM
	 * @since 1.0
	 * @param string [s] Path to the CSS file
	 */
	this.inject = function (s) {
		var n = document.createElement("iframe");
		n.setAttribute("src", s);
		n.setAttribute("id", "BCSS");
		n.style.display = "none";
		n.style.height = "1px";
		n.style.width = "1px";

		document.body.appendChild(n);

		if (n.addEventListener) {
			n.addEventListener("load", BCSS.loader, false);
		} else if (n.attachEvent) {
			n.attachEvent("onload", BCSS.loader);
		} else {
			n.onload = BCSS.loader;
		}
	};

	/**
	 * Stores the content and removes the iFrame from the DOM once it's loaded
	 * @since 1.0
	 */
	this.loader = function () {
		var n = document.getElementById("BCSS");
		var d = ((typeof n.contentDocument == undefined) || (n.contentDocument == null)) ? n.contentWindow.document : n.contentDocument;
		var c = d.body.innerHTML;

		setTimeout("document.body.removeChild(document.getElementById('BCSS'));", 500);

		BCSS.translate(c);
	};

	/**
	 * Parses the CSS into a Brightcove-readable string to send to the player
	 * @since 1.0
	 * @param string [css] The CSS styles
	 */
	this.translate = function (css) {
		css = css.replace(/<.*?>/ig, "");
		css = css.replace(/\s{1,}?/ig, "");

		var p = css.split("}");
		var s = "";

		for (var i in p) {
			var n = p[i].substr(0, p[i].indexOf("{"));
			var r = p[i].substr(p[i].indexOf("{") + 1).split(";");

			for (var j in r) {
				if (r[j].length < 1) { continue; }
				var t = r[j].substr(0, r[j].indexOf(":"));
				var v = r[j].substr(r[j].indexOf(":") + 1);

				s += (n.replace(".", "") + "-" + t + ":" + v + ";");
			}
		}

		try {
		    this.player.setStyles(s);
		} catch (e) {
			queue = s;
		}
	};

	/**
	 * An event that runs when onTemplateLoaded is fired
	 * @since 1.0
	 * @param string [id] The Brightcove experience ID
	 */
	this.loaded = function (id) {
		BCSS.bc = brightcove.getExperience(id);
	    BCSS.experience = BCSS.bc.getModule("experience");
	    BCSS.player = BCSS.bc.getModule(APIModules.VIDEO_PLAYER);

		if (queue != null) {
			BCSS.player.setStyles(queue);
		}
	};

	if (typeof onTemplateLoaded == "function") {
		var temp = onTemplateLoaded;

		window.onTemplateLoaded = function (id) {
			BCSS.loaded(id);
			temp(id);
		}
	} else {
		window.onTemplateLoaded = function (id) {
			BCSS.loaded(id);
		}
	}

}();

if (typeof window.onload == "function") {
	var temp = window.onload;

	window.onload = function (id) {
		BCSS.init();
		temp(id);
	}
} else {
	window.onload = BCSS.init;
}