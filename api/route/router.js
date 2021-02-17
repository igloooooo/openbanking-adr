const consent_Routes = require('./consent-router')
const cdr_Routes = require('./cdr-router')
const resource_Routes = require('./resource-router')

const basicRoutes = [{
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
}];

let routerMerge = (...arrs) => [ ...new Set( [].concat(...arrs) ) ];

const routes = routerMerge(resource_Routes, consent_Routes, cdr_Routes);
module.exports = routes;
