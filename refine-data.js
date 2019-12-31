const utils = require("./utils");
const config = require('./config.json');
let outLinkData = {};
const main = async () => {
    const contentData = await utils.getArrDataFromCSV(config.content, ',');
    await utils.getArrDataFromLargeCSV(config.out_link, processOutLink);
    let plpData = await utils.getArrDataFromCSV(config.plp_data, ',');
    plpData = convertArrToDictionary(plpData);
    let result = [];
    contentData.map(item => {
        {
            const url = item[0];
            const statusCode = item[1];
            const deep = item[2];
            const took = item[3];
            const plpItem = plpData[url] || {};
            const inLinkCount = outLinkData[url] || 0;
            const googleSearchVolume = plpItem[2];
            const totalSearchVolume = plpItem[3];
            const session = plpItem[4];
            result.push([url, statusCode, deep, took, googleSearchVolume, totalSearchVolume, session, inLinkCount]);
        }
    });
    await utils.saveCSVFile("old-internal-linking.csv", result);

};

const processOutLink = (arr, file, s) => {
    console.log("processOutLink", arr.length, file);
    arr.map(item => {
        const url = item[0];
        const outUrl = item[1];
        outLinkData[outUrl] = outLinkData[outUrl] ? outLinkData[outUrl] + 1 : 1;
    });
    console.log("resume");
    s.resume();
};


const convertArrToDictionary = (arr) => {
    let result = {};
    arr.map(item => {
        let url;
        switch (item[1]) {
            case "filtered":
                url = config.base_url + "compare/" + item[0] + '/';
                break;
            case "store":
                url = config.base_url + "coupons/" + item[0] + '/';
                break;
            default:
                url = config.base_url + item[0] + '/';

        }
        result[url] = [...item];
    });
    return result;
};


main();