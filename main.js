const crawling = require("./src/crawling");
const util = require("./src/util");

let file = "out.csv";

function main() {
	crawling.goToURL("https://iprice.hk/", saveData)
}

function saveData(url, data) {

	console.log("Found", url, data.length);
	let obj = {
		url: url,
		data: data
	};
	let csvStr = JSON.stringify(obj) + "\n";

	util.updateCSVFile(file, csvStr);
}

main();
