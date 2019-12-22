const fs = require('fs');

function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );


    // Create an array to hold our data. Give the array9
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
}

function getArrDataFromCSV(path, strDelimiter) {
    let defered = new Promise(resolve => {
        fs.readFile(path, 'utf8', function (err, data) {
            console.log(data.length);
            let arr = CSVToArray(data, strDelimiter);
            resolve(arr);
        });
    });
    return defered;
}

const createDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

const saveDataToFile = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data));
};
const updateRawDataInToFile = (file, data) => {
    return new Promise(resolve => {
        let lineArray = [];
        data.forEach(function (infoArray) {
            lineArray.push(JSON.stringify(infoArray));
        });
        let csvContent = lineArray.join("\n");
        csvContent += "\n";
        fs.appendFile(file, csvContent, 'utf8', function (err) {
            if (err) {
                console.log('Some error occurred - file either not saved or corrupted file saved.');
            } else {
                console.log(file, 'It\'s updated!');
            }
            resolve();
        });
    });
};

const getDataFromCSV = path => {
    let defered = new Promise(resolve => {
        fs.readFile(path, 'utf8', function (err, data) {
            // console.log(data.length);
            resolve(data.split("\n"));
        });
    });
    return defered;
};
const regexMatching = regexString => (str, cb) => {
    return new Promise(async resolve => {
        let matches;
        // console.time("regexMatching" + str.length);
        // console.log("regexString", regexString);
        while ((matches = regexString.exec(str))) {
            // console.log("start cb");
            await cb(matches);
            // console.log("end  cb");
        }
        // console.timeEnd("regexMatching" + str.length);
        resolve();
    });
};
const regexMatchingSync = regexString => (str, cb) => {
    let matches;
    while ((matches = regexString.exec(str))) {
        cb(matches);
    }
};

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const executeAsync = (tasks, timeDelay) => {
    // const timeStart = "timeStart-" + (+new Date());
    // console.time(timeStart);
    return new Promise(resolve => {
        let promises = [];

        tasks.map((task, i) => {
            promises.push(task());
            // promises.push(waiting(task, i * timeDelay));
        });
        Promise.all(promises).then(() => {
            // console.timeEnd(timeStart);
            resolve();
        });
    });
};
const waiting = (fn, time) => {
    // console.log("setTimeout", time);
    return new Promise(resolve => {
        setTimeout(async () => {
            await fn();
            resolve();
        }, time);
    });
};

const createTasks = tasks => task => {
    tasks.push(task);
};
const executeTasks = async (tasks, opt) => {
    const thread = opt.thread || 10;
    const timeDelay = opt.timeDelay || 20;
    let currentTasks = tasks.splice(0, thread);
    while (currentTasks.length) {
        await executeAsync(currentTasks, timeDelay);
        currentTasks = tasks.splice(0, thread);
    }
};

const getYYYYMMDD = () => {
    const dateObj = new Date();
    const month = dateObj.getUTCMonth() + 1; //months from 1-12
    const day = dateObj.getUTCDate();
    const year = dateObj.getUTCFullYear();

    return `${year}-${month}-${day}`;
};

async function updateCSVFile(file, data) {
    return new Promise(resolve => {
        let lineArray = [];
        data.forEach(function (infoArray, index) {
            let line = infoArray.join("\,");
            lineArray.push(line);
        });
        let csvContent = lineArray.join("\n") + "\n";
        fs.appendFile(file, csvContent, 'utf8', function (err) {
            if (err) {
                console.log('Some error occurred - file either not saved or corrupted file saved.');
            } else {
                // console.log(file, 'It\'s updated!');
            }
            resolve();
        });
    });
}

async function exportJsonFile(file, data) {
    return new Promise(resolve => {
        fs.writeFile(file, JSON.stringify(data), 'utf8', function (err) {
            if (err) {
                console.log('Some error occurred - file either not saved or corrupted file saved.');
            } else {
                // console.log(file, 'It\'s updated!');
            }
            resolve();
        });
    });
}

async function removeContent(file) {
    return new Promise(resolve => {
        fs.writeFile(file, '', function () {
            resolve();
        })
    });
}

const getDataFromJSON = (jsonPath) => {
    return require(jsonPath);
};
const removeItem = (array, item) => {
    const index = array.indexOf(item);
    // console.log("test", index);
    if (index !== -1) {
        array.splice(index, 1)
    }
};

const revealed = {
    getYYYYMMDD,
    removeItem,
    createDir,
    saveDataToFile,
    updateRawDataInToFile,
    createTasks,
    executeTasks,
    getDataFromCSV,
    regexMatching,
    regexMatchingSync,
    executeAsync,
    removeContent,
    exportJsonFile,
    updateCSVFile,
    getArrDataFromCSV,
};

module.exports = revealed;
