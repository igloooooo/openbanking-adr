// const MongoClient = require('mongodb').MongoClient;
// const url = "mongodb://192.168.86.250:27017/";

const EJSON = require('mongodb-extended-json')

function collectionMap(type) {
    if (type === 'Product') {
        return 'product';
    } else {
        return 'unknown';
    }

}
function upsertQuery(type, data) {
    if (type === 'Product') {
        return { 'productId' : data.productId}
    } else {
        return {};
    }
}

const domainHandler = async function(req) {

    this.act(
        {
            topic: 'mongo-store',
            cmd: 'update',
            collection: collectionMap(req.type),
            query: upsertQuery(req.type, req.data),
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
module.exports = domainHandler;
