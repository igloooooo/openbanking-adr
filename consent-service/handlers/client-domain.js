const saveClientHandler = async function(req) {

    this.act(
        {
            topic: 'mongo-store',
            cmd: 'update',
            collection: 'client',
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

const getClientHandler = async function(req) {
    // use default brand
    try {
        const result = this.act(
            {
                topic: 'mongo-store',
                cmd: 'find',
                collection: 'client',
                query: EJSON.serialize({
                    'brand_id': req.brandId
                })
            });
        return result.data.result;
    } catch (error) {
        console.log(error)
        return {status : 'error' + error}
    }

};

module.exports = { saveClientHandler, getClientHandler };
