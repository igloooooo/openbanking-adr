const EJSON = require('mongodb-extended-json')

const tokenQueryByBrandHandler = async function(req) {
    try {
        const result = await this.act(
            {
                topic: 'mongo-store',
                cmd: 'find',
                collection: 'tokens',
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

const updateTokenByBrandHandler = async function(req) {
    const token = req.data;
    token.brand_id = req.brandId;
    this.act(
        {
            topic: 'mongo-store',
            cmd: 'update',
            collection: 'tokens',
            query: EJSON.serialize({
                'brand_id': req.brandId
            }),
            data: req.data
        },
        function(err, resp) {
            if(err) {
                console.log(err);
                throw err;
            }

        }
    );

    return {
        'status': 'OK'
    }

};

module.exports = { tokenQueryByBrandHandler, updateTokenByBrandHandler };
