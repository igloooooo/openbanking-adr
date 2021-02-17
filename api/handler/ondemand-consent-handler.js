const onDemandConsentHandler = async function(request, h) {
    // refresh token
    const token = await request.hemera.act({
        topic: 'register',
        cmd: 'refreshToken',
        clientId:request.payload.clientId,
        softwareId: request.payload.softwareId,
        refreshToken: request.payload.refreshToken,
    })
    // send on demand request
    let payload = request.payload;
    payload.token = token.access_token;
    return request.hemera.act({
        topic: 'ingestion',
        cmd: 'onDemand',
        type: request.query.type,
        data:payload,
        timeout$: 20000
    })
};

module.exports = onDemandConsentHandler;
