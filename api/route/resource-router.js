const resource_routes = [{
    method: 'GET',
    path: '/api/ob/products',
    handler: async (request, h) => {
        return request.hemera.act({
            topic: 'ingestion',
            cmd: 'getProduct',
            version: request.query.version,
            resourceURL: request.query.resourceURL,
        })
    }
}, {
    method: 'GET',
    path: '/api/ob/accounts',
    handler: async (request, h) => {
        // this will query the database, not fetch account from the data holder
        return request.hemera.act({
            topic: 'persistent',
            cmd :'getAccountList',
            brandId: '5fb755cbf4fdf155bad4afd6',
        })
    }
}, {
    method: 'GET',
    path: '/api/ob/accountBalance',
    handler: async (request, h) => {
        // this will query the database, not fetch account from the data holder
        return request.hemera.act({
            topic: 'persistent',
            cmd :'getAccountBalance',
            accountId: request.query.accountId,
        })
    }
}];

module.exports = resource_routes;
