const sqlite3 = require('sqlite3').verbose();
let db;
const getConnect = () => {
    return new Promise(resolve => {
        db = new sqlite3.Database('data-my.db', (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to the SQLite database.');
            resolve();
        })
    });
};

const createTable = () =>
    new Promise(resolve => {
        db.serialize(async function () {
            console.log("create table");
            db.run(`CREATE TABLE content_my (
                url VARCHAR(255),
                statusCode INTEGER,
                status VARCHAR(255),
                took INTEGER,
                deep INTEGER,
                PRIMARY KEY(url)
            );`);
            db.run(`CREATE TABLE out_link_my (
                url VARCHAR(255),
                outUrl VARCHAR(255)
            );`);
            // db.run(`CREATE INDEX tag_content_my_url ON content_my (url);`);
            // db.run(`CREATE INDEX tag_content_my_status ON content_my (status);`);
            // db.run(`CREATE INDEX tag_out_link_my_url ON out_link_my (url);`);
            setTimeout(() => {
                resolve();
            }, 100);
        })
    });

const getCrawlingURLs = async () => {
    return await execQuery("select url from content_my where status ='crawling'");
};

function execQuery(query) {
    return new Promise(resolve => {
        db.all(query, (err, rows) => {
            if (err) {
                console.error(err.message);
            }
            resolve(rows);
        });
    });
}

const insertDataContent = (url, deep) => {
    let query = `INSERT INTO content_my (url, statusCode, deep) VALUES
             ('${url}','crawling', '${deep}')
            `;
    db.run(query, function (error) {
        if (error) {
            console.log(error);
            console.log(query);
        }
    });
};

const updateDataContent = (url, statusCode, took) => {
    let query = `UPDATE content_my  set statusCode = '${statusCode}', status = 'crawled', took = ${took}
            where url = '${url}'`;
    db.run(query, function (error) {
        if (error) {
            console.log(error);
            console.log(query);
        }
    });
};

const insertDataOutLink = (url, outUrl) => {
    let query = `INSERT INTO out_link_my (url, outUrl) VALUES
             ('${url}', '${outUrl}')
            `;
    db.run(query, function (error) {
        if (error) {
            console.log(error);
            console.log(query);
        }
    });

};

module.exports = {
    createTable,
    getConnect,
    insertDataContent,
    insertDataOutLink,
    getCrawlingURLs,
    updateDataContent,
};
