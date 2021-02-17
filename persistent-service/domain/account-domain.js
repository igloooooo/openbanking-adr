const queryAccountListHandler = async function(req) {

    try {
        const result = await this.act(
            {
                topic: 'mongo-store',
                cmd: 'find',
                collection: 'account',
                query: EJSON.serialize({
                    'brand_id': req.brandId
                }),
                timeout$: 20000
            });
        return result.data.result;
    } catch (error) {
        console.log(error)
        return {status : 'error' + error}
    }

};

const queryAccountBalanceHandler = async function(req) {

    try {
        const result = await this.act(
            {
                topic: 'mongo-store',
                cmd: 'find',
                collection: 'accountBalance',
                query: EJSON.serialize({
                    'accountId': req.accountId
                }),
                timeout$: 20000
            });
        return result.data.result;
    } catch (error) {
        console.log(error)
        return {status : 'error' + error}
    }

};

module.exports = { queryAccountListHandler, queryAccountBalanceHandler};
