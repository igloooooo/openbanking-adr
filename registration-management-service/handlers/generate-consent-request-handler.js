const axios = require('axios');
const https = require('https');
const qs  = require('qs');
const fs = require('fs');
const {parse} = require('node-html-parser');
axios.defaults.withCredentials = true;

const ax = axios.create({
    httpsAgent: new https.Agent({
        keepAlive: true,
        rejectUnauthorized : false,
        pfx: fs.readFileSync('./ca/client/network.p12'),
        passphrase: 'P@ssword1',
    }),
    withCredentials : true,

});


function generateRequestJWTBody(dcrClientId) {
    let body = {
        "client_id":dcrClientId,
        "scope": "openid bank:accounts.basic:read bank:transactions:read",
        "iss": dcrClientId,
        "claims": {
            "sharing_duration": 5184000,
            "id_token": {
                "acr": {
                    "values": [
                        "urn:cds.au:cdr:2"
                    ],
                    "essential": true
                },
                "auth_time": {
                    "essential": true
                }
            },
            "userinfo": {
                "family_name": {
                    "essential": true
                },
                "given_name": {
                    "essential": true
                }
            }
        },
        "response_type": "code id_token",
        "redirect_uri": "http://localhost:7916/callback",
        "code_challenge":"PNU4mSDcKWgrG1Sl8C7UT9n0PyvOJEuc6JV7r9YcCyE",
        "code_challenge_method": "S256",
        "state": "xyz"
    }

    return body;
}

function generateRequestJWTHeader(jwk, dcrClientId) {
    return {
        'Accept': '*/*',
        'x-private-jwk' : jwk,
        'content-type': 'application/json',
        'x-nonce': 'ea18887b-8629-43f2-93e1-4346959fb2ec',
        'x-state': '887bea18-93e1-8629-43f2-59fb2ec43469',
        'x-issuer': dcrClientId,
        'x-duration-seconds': '60',
        'x-dataholder-authorization-endpoint': 'https://sso.data-holder.local/as/authorization.oauth2',
        'x-response-type': 'code id_token',
        'x-scope': 'openid profile bank:accounts.basic:read bank:transactions:read',
        'x-redirecturi': 'https://httpbin.org/get',
        'x-maxage': -1,

    }
}


async function  jwtResponseHandler(clientId, softwareId, jwt) {
    const softwareJWKSPrivate = new Buffer.from(JSON.stringify(jwt)).toString('base64');
    const jwtRequestOpt = {
        method: 'POST',
        url: 'https://mockregister.data-holder.local/testtool/tpp/requestGenericJWT',
        headers: generateRequestJWTHeader(softwareJWKSPrivate, clientId),
        data: generateRequestJWTBody(clientId),

    };
    return ax(jwtRequestOpt).then(res => {
        const consent_request_url = res.data['request-url'];
        return consent_request_url;
    });
}
async function clientRegisterHandler(res) {
    console.log('start to generate consent');
    const clientId = 'dcr-15f4e1bb-2ab9-38dd-af7a-507b0419e46b'
    //res.clientId;
    const softwareId = 'ab245723-b07e-4ab1-860d-c43bd9ad382e'
    //res.softwareId;
    return ax.get('https://mockregister.data-holder.local/softwarestatement/JWKS/'+softwareId+'/private')
        .then(res => {
            console.log('request jwt successful')
            return jwtResponseHandler(clientId, softwareId, res.data)
        })
}

const generateConsentRequestHandler = async function(req) {

    // this.act({
    //     topic: 'register',
    //     cmd: 'getClient',
    // }, (err, resp) => {
    //     console.log('===========client response================')
    //     console.log(resp);
    //     clientRegisterHandler(resp);
    // })
    return await clientRegisterHandler({});

};

module.exports = generateConsentRequestHandler;
