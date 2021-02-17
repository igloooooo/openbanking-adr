const axios = require('axios');
const https = require('https');
const qs  = require('qs');
const fs = require('fs');


const ax = axios.create({
    httpsAgent: new https.Agent({
        keepAlive: true,
        rejectUnauthorized : false,
        pfx: fs.readFileSync('./ca/client/network.p12'),
        passphrase: 'P@ssword1',
    }),


});

async function refreshTokenHandler(req) {
    console.log('start refresh Token');
    console.log(req);
    const refreshToken = req.refreshToken;
    const softwareId = req.softwareId;
    const clientId = req.clientId;
    return ax.get('https://mockregister.data-holder.local/softwarestatement/JWKS/'+softwareId+'/private').then(res => {
        const software_jwks_private = new Buffer.from(JSON.stringify(res.data)).toString('base64');
        console.log('get jwks');
        const clientAssertionOpt = {
            method: 'POST',
            url: 'https://mockregister.data-holder.local/testtool/tpp/createClientAssertion',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'

            },
            data: qs.stringify({
                'client-id' : clientId,
                'token-endpoint' : 'https://sso.data-holder.local/as/token.oauth2',
                'private-jwk': software_jwks_private,
                'kid': softwareId,
            }),
        };
        console.log(clientAssertionOpt);
        return ax(clientAssertionOpt).then(response => {
            console.log('get clientAssertionOpt');
            const consent_client_assertion = response.data["client-assertion"];
            console.log(consent_client_assertion);
            console.log(response.headers);
            const codeExchangeReqOpt = {
                method: 'POST',
                url: 'https://sso.data-holder.local/as/token.oauth2',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Accept': '*.*',
                },
                data: qs.stringify({
                    'refresh_token' : refreshToken,
                    'client_assertion' : consent_client_assertion,
                    'grant_type': 'refresh_token',
                    'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                    'redirect_uri': 'http://localhost:7916/callback',
                }),
            }
            console.log(codeExchangeReqOpt);
            return ax(codeExchangeReqOpt).then(res => {

                console.log(res.data);
                return res.data;
            });
        }).catch(e => console.log(e.response))
    })
};

module.exports = refreshTokenHandler;
