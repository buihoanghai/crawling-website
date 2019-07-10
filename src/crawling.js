const crawl = require("./crawl");
const _ = require("lodash");
let visitedStr = "";
let count = 0;
let timeStart = +(new Date());
let range = 100;
let rootUrl = "iprice.my";
let ignore = [
	"/r/",
	"/insights/",
	"?",
	"iema",
	"#"
];

function setConfig(opt) {
	range = opt.range;
	timeStart = opt.timeStart;
	range = opt.range;
	ignore = opt.ignore;
	rootUrl = opt.rootUrl;
}

function getVisitedStr() {
	return visitedStr;
}

function monitorProcess(current, range, timeStart) {
	if (count % range === 0) {
		let timeEnd = +(new Date());
		console.log(count, "consumed", (timeEnd - timeStart) / 1000);
	}
	return current + 1;
}

async function goToURL(url, callback) {
	if (noNeedCrawl(url, rootUrl, ignore)) {
		return;
	}
	crawl.crawl(url).then(links => {
		count = monitorProcess(count, range, timeStart);
		callback(url, links);
		processLinks(links, callback);
	});


}

function noNeedCrawl(url, rootUrl, ignore) {
	if (visitedStr.indexOf(url) > -1 || url.indexOf(rootUrl) === -1) {
		return true;
	}

	if (!existed(url, ignore)) {
		visitedStr += url;
		return false;
	}
	return true;
}

function existed(str, arr) {
	for (let i = 0; i < arr.length; i++) {
		if (str.indexOf(arr[i]) > -1) {
			return true;
		}
	}
	return false;
}

function processLinks(anchors, callback) {
	for (let i = 0; i < anchors.length; i++) {
		let anchor = anchors[i];
		goToURL(anchor, callback);
	}
}

let revealed = {
	goToURL,
	setConfig,
	getVisitedStr
};
module.exports = revealed;
