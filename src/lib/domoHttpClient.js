const request = require('request');

async function getAccessToken() {
    const username = process.env.DOMO_CLIENT_ID;
    const password = process.env.DOMO_SECRET;
    const options = {
        'method': 'GET',
        'url': `https://api.domo.com/oauth/token?grant_type=client_credentials&scope=data`,
        'headers': {
            'Authorization': `Basic ${Buffer.from(username + ":" + password).toString("base64")}`,
            'Content-Type': 'application/json'
        }
    };
    console.log(JSON.stringify(options))
    return new Promise(function (resolve, reject) {
        request(options, function (error, response) {
            if (error) {
                console.log(error);
                resolve(false);
            } else {
                console.log(response.body);
                resolve(JSON.parse(response.body))
            }
        });
    })
}

async function getData(accessToken, fromDate, limit) {
    const sql = `SELECT * FROM Ticketline_Data_API Where line_updated_date >= '${fromDate}' order by line_updated_date Limit ${limit};`;
    console.log(`SQL: ${sql}`)
    const options = {
        'method': 'POST',
        'url': `https://api.domo.com/v1/datasets/query/execute/${process.env.DATASET_ID}`,
        'headers': {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "sql": sql
        })
    };
    console.log(JSON.stringify(options))
    return new Promise(function (resolve, reject) {
        request(options, function (error, response) {
            if (error) {
                console.log(error);
                resolve(false);
            } else {
                resolve(JSON.parse(response.body))
            }
        });
    })
}

module.exports = {getAccessToken, getData}