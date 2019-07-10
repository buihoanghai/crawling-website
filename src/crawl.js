const puppeteer = require('puppeteer');
const _ = require("lodash");
// let browsers;
let pages = [];
let maxCrawl = 4;

async function setUpPage() {
	console.log("maxCrawl", maxCrawl);

	for (let i = 0; i < maxCrawl; i++) {
		let browser = await puppeteer.launch({
			// headless: false,
		});
		let page = await browser.newPage();
		let available = true;
		pages.push({
			page,
			available,
			i
		})
	}
}

function getFreePage() {
	return new Promise(resolve => {
		var handle = setInterval(function () {
			let freePage = _.find(pages, {available: true});
			if (freePage) {
				freePage.available = false;
				// console.log("use page", freePage.i);
				resolve(freePage);
				clearInterval(handle);
			}
			// console.log("wait free page");

		}, 1000);
	});
}

async function crawl(url) {
	let page;
	if (pages.length === 0) {
		await setUpPage();
	}
	let freePage = await getFreePage();
	page = freePage.page;
	await page.goto(url);
	const data = await page.evaluate(() => {
		let result = [];
		let anchors = document.querySelectorAll("a");
		anchors.forEach(anchor => {
			let link = {
				href: anchor.href,
				rel: anchor.rel
			};
			// console.log(link);
			if (link.href && link.rel === "" || link.ref === "follow") {
				result.push(link.href);
			}
		});

		return result;
	});
	// await browser.close();
	freePage.available = true;
	return data;
}

const revealed = {
	crawl
};

module.exports = revealed;