const domoHttpClient = require('../lib/domoHttpClient');

module.exports.handler = async function (event, context, callback) {
    console.log(`Starting run.`)
    console.log(`Event: ${JSON.stringify(event)}`)

    let status = true;
    let value = '';
    let hasMore = false;

    if (process.env.IS_OFFLINE) {
        event.state = JSON.parse(event.body)
    }

    const accessTokenResponse = await domoHttpClient.getAccessToken();
    if (!accessTokenResponse || !accessTokenResponse.access_token) {
        status = false;
        value = {errorMessage: 'DOMO Authorization Failed'};
    }

    if (status) {

        let startDate = (event.state && event.state.transactionsCursor && event.state.transactionsCursor.lastLineUpdatedAt) || process.env.START_FROM;
        let pageSize = process.env.PAGE_SIZE;

        const data = await domoHttpClient.getData(accessTokenResponse.access_token, startDate, pageSize)
        if (!data) {
            status = false;
            value = {errorMessage: 'Failed to fetch data from DOMO'};
        }

        if (data) {
            const columns = data.columns;
            const rows = data.rows;
            const numRows = data.numRows;
            const transactions = [];
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const item = {};
                for (let j = 0; j < columns.length; j++) {
                    const column = columns[j];
                    item[column] = row[j];
                }
                transactions.push(item)
            }

            hasMore = ("" + pageSize === "" + numRows)
            const state = {
                hasMore,
            };
            console.log(`Query returned ${transactions.length} rows.`)
            if (transactions.length > 0) {    
                state.lastLineUpdatedAt = transactions[transactions.length - 1].line_updated_date
            }
            value = {
                "state": {
                    "transactionsCursor": state
                },
                "insert": {
                    "ticket_line_items": transactions
                },
                "schema": {
                    "ticket_line_items": {
                        "primary_key": [
                            "ticketlineid"
                        ]
                    }
                },
                "hasMore": hasMore
            }

            console.log(`Ending run.`)
            console.log(`Sending state back to Fivetran: ${JSON.stringify(state)}`)
        }
    }

    if (process.env.IS_OFFLINE) {
        let response = {
            statusCode: status ? '200' : '400',
            body: JSON.stringify({...value}),
            headers: {'Content-Type': 'application/json'}
        };
        context.succeed(response);
    } else {
        return value;
    }
}
