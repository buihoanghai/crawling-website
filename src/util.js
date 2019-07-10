const fs = require('fs');
async function updateCSVFile(file, data) {
	return new Promise(resolve => {
		fs.appendFile(file, data, 'utf8', function (err) {
			if (err) {
				console.log('Some error occured - file either not saved or corrupted file saved.');
			} else {
				console.log(file, 'It\'s updated!');
			}
			resolve();
		});
	});
}
function arrayToCSV(data){
	let lineArray = [];
	data.forEach(infoArray => {
		let line = infoArray.join(",");
		lineArray.push(line);
	});
	return lineArray.join("\n");
}
const revealed = {
	updateCSVFile,
	arrayToCSV
};

module.exports = revealed;
