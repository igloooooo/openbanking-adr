const onDemandConsentHandler = require('../handler/ondemand-consent-handler')

const consent_routes = [{
    method: 'POST',
    path: '/api/cdr/consent',
    handler: async (request, h) => {
        return request.hemera.act({
            topic: 'register',
            cmd: 'generateConsent',
            timeout$: 20000
        })
    }
}, {
    method: 'GET',
    path: '/api/consent/tokens',
    handler: async (request, h) => {
        console.log('hit get tokens');
        return request.hemera.act({
            topic: 'consent',
            cmd: 'searchTokens',
            brandId: '5fb755cbf4fdf155bad4afd6',
        })
    }
}, {
    method: 'POST',
    path: '/api/consent/tokens',
    handler: async (request, h) => {
        console.log('hit save token');
        return request.hemera.act({
            topic: 'consent',
            cmd: 'saveTokens',
            brandId: '5fb755cbf4fdf155bad4afd6',
            data: request.payload
        })
    }
}, {
    method: 'GET',
    path: '/api/consent/client',
    handler: async (request, h) => {
        console.log('hit get client');
        return request.hemera.act({
            topic: 'consent',
            cmd: 'getClient',
            brandId: '5fb755cbf4fdf155bad4afd6',
        })
    }
}, {
    method: 'POST',
    path: '/api/consent/client',
    handler: async (request, h) => {
        console.log('hit save client');
        return request.hemera.act({
            topic: 'consent',
            cmd: 'saveClient',
            brandId: '5fb755cbf4fdf155bad4afd6',
            data: request.payload
        })
    }
}, {
    method: 'DELETE',
    path: '/api/cdr/token/revoke',
    handler: async (request, h) => {
        console.log('hit revoke token');
        return request.hemera.act({
            topic: 'register',
            cmd: 'revokeToken',
            clientId:request.payload.clientId,
            softwareId: request.payload.softwareId,
            refreshToken: request.payload.refreshToken,
            timeout$: 20000
        })
    }
},  {
    method: 'POST',
    path: '/api/consent/ondemand',
    handler: onDemandConsentHandler
}];

module.exports = consent_routes;
