/**
 * Brightcove Player CSS Wrapper 1.0 (3 DECEMBER 2010)
 * (Formerly known as BCSS)
 *
 * REFERENCES:
 *	 Website: http://opensource.brightcove.com
 *	 Source: http://github.com/brightcoveos
 *
 * AUTHORS:
 *	 Brian Franklin <bfranklin@brightcove.com>
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
	this.brightcove;
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
	 * @param string [pUrl] Path to the CSS file
	 */
	this.inject = function (pUrl) {
		var pElement = document.createElement("iframe");
		pElement.setAttribute("src", (pUrl));
		pElement.setAttribute("id", "BCSS");
		pElement.style.display = "none";
		pElement.style.height = "1px";
		pElement.style.width = "1px";

		document.body.appendChild(pElement);

		if (pElement.addEventListener) {
			pElement.addEventListener("load", BCSS.loader, false);
		} else if (pElement.attachEvent) {
			pElement.attachEvent("onload", BCSS.loader);
		} else {
			pElement.onload = BCSS.loader;
		}
	};

	/**
	 * Stores the content and removes the iFrame from the DOM once it's loaded
	 * @since 1.0
	 */
	this.loader = function () {
		var pElement = document.getElementById("BCSS");
		var pDocument = ((typeof pElement.contentDocument == undefined) || (pElement.contentDocument == null)) ? pElement.contentWindow.document : pElement.contentDocument;
		var pContent = pDocument.body.innerHTML;

		setTimeout("document.body.removeChild(document.getElementById('BCSS'));", 500);

		BCSS.translate(pContent);
	};

	/**
	 * Parses the CSS into a Brightcove-readable string to send to the player
	 * @since 1.0
	 * @param string [pStyle] The CSS styles
	 */
	this.translate = function (pStyle) {
		pStyle = pStyle.replace(/<.*?>/ig, "");
		pStyle = pStyle.replace(/\s{1,}?/ig, "");

		var pLine = pStyle.split("}");
		var pPlayerStyle = "";

		for (var i in pLine) {
			var pSelector = pLine[i].substr(0, pLine[i].indexOf("{"));
			var pValues = pLine[i].substr(pLine[i].indexOf("{") + 1).split(";");

			for (var q in pValues) {
				if (pValues[q].length < 1) { continue; }
				
				var pKey = pValues[q].substr(0, pValues[q].indexOf(":"));
				var pValue = pValues[q].substr(pValues[q].indexOf(":") + 1);

				pPlayerStyle += (pSelector.replace(".", "") + "-" + pKey + ":" + pValue + ";");
			}
		}

		try {
		    BCSS.player.setStyles(pPlayerStyle);
		} catch (e) {
			BCSS.queue = pPlayerStyle;
		}
	};

	/**
	 * An event that runs when onTemplateLoaded is fired
	 * @since 1.0
	 * @param string [pId] The Brightcove experience ID
	 */
	this.loaded = function (pId) {
		BCSS.brightcove = brightcove.getExperience(pId);
	    BCSS.experience = BCSS.brightcove.getModule("experience");
	    BCSS.player = BCSS.brightcove.getModule(APIModules.VIDEO_PLAYER);

		if (BCSS.queue != null) {
			BCSS.player.setStyles(BCSS.queue);
		}
	};

	if (typeof onTemplateLoaded == "function") {
		var temp = onTemplateLoaded;

		window.onTemplateLoaded = function (pId) {
			BCSS.loaded(pId);
			temp(pId);
		};
	} else {
		window.onTemplateLoaded = function (pId) {
			BCSS.loaded(pId);
		};
	}
}();

if (typeof window.onload == "function") {
	var temp = window.onload;

	window.onload = function (pId) {
		BCSS.init();
		temp(pId);
	}
} else {
	window.onload = BCSS.init;
}