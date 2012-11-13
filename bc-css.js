/*
 * Copyright 2012 Brian Franklin

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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