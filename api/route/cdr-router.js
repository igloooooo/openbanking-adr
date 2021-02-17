const cdr_routes = [{
    method: 'POST',
    path: '/api/cdr/register',
    handler: async (request, h) => {
        return request.hemera.act({
            topic: 'register',
            cmd: 'getClient',
            timeout$: 20000
        })
    }
}, {
    method: 'POST',
    path: '/api/cdr/consentRequest',
    handler: async (request, h) => {
        console.log('hit consentRequest');
        return request.hemera.act({
            topic: 'register',
            cmd: 'generateConsentRequest',
            timeout$: 20000
        })
    }
}, {
    method: 'POST',
    path: '/api/cdr/swapCode',
    handler: async (request, h) => {
        return request.hemera.act({
            topic: 'register',
            cmd: 'swapCode',
            clientId:request.payload.clientId,
            softwareId: request.payload.softwareId,
            code: request.payload.code,
            timeout$: 20000
        })
    }
}];

module.exports = cdr_routes;
