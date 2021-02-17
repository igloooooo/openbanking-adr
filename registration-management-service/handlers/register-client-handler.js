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



function generateClientRequestBody(softwareId, softwareStatement) {
    let body = {
        "iss": softwareId,
        "aud": "https://sso.data-holder.local",
        "software_statement": softwareStatement,
        "token_endpoint_auth_signing_alg": "PS256",
        "grant_types": [
            "authorization_code",
            "client_credentials",
            "refresh_token"
        ],
        "request_object_signing_alg": "PS256",
        "redirect_uris": [
            "https://httpbin.org/get"
        ],
        "token_endpoint_auth_method": "private_key_jwt",
        "response_types": [
            "code id_token"
        ],
        "id_token_signed_response_alg": "PS256",
        "id_token_encrypted_response_alg": "RSA-OAEP",
        "id_token_encrypted_response_enc":"A256GCM"
    }

    return body;
}

function generateSSARequest() {
    return {
        'client_name':'Application abc',
        'client_desc': 'This is my application',
        'version': '1.0',
        'policy_uri': 'https://idpv2.pingapac.com/pf/heartbeat.ping',
        'terms_uri': 'https://idpv2.pingapac.com/pf/heartbeat.ping',
        'organisation_id': 'BudgetGuide',
        'redirect_uri': 'https://www.google.com.au,https://httpbin.org/get,https://hostname/ext/cdrcb',
        'software_id': '',
        'issuer': 'cdr-register',
        'scope': 'bank:accounts.basic:read bank:accounts.detail:read bank:transactions:read bank:payees:read bank:regular_payments:read common:customer.basic:read common:customer.detail:read cdr:registration'
    }
}

const registerClientHandler = async function(req) {
    const request_opt = {
        method: 'POST',
        url: 'https://mockregister.data-holder.local/softwarestatement',
        headers: {
            'Authorization' : 'Basic cGtpdXNlcjphYmNEMzBmZw==',
            'content-type': 'application/x-www-form-urlencoded',

        },
        data: qs.stringify(generateSSARequest()),
    };

    let softwareId = null;
    let softwareStatement = null;
    const response = await ax(request_opt)
        .then(res => {
            console.log('get ssa sucesss')
            console.log(res.data)
            this.log.info(res.data);
            softwareStatement = res.data.software_statement;
            softwareId = res.data.software_id;
            // download private key from CDR Register
            return ax.get('https://mockregister.data-holder.local/softwarestatement/JWKS/'+softwareId+'/private')
                .then(res => {
                    console.log('get private success');
                    console.log(res.data)
                    const softwareJWKSPrivate = new Buffer.from(JSON.stringify(res.data)).toString('base64');
                    console.log('softwareJWKSPrivate');
                    console.log(softwareJWKSPrivate)
                    // DR creates Request JWT
                    const jwtRequestOpt = {
                        method: 'POST',
                        url: 'https://mockregister.data-holder.local/testtool/tpp/dcr/requestCreateJwt',
                        headers: {
                            'Authorization' : 'Basic cGtpdXNlcjphYmNEMzBmZw==',
                            'x-private-jwk': softwareJWKSPrivate,

                        },
                        data: generateClientRequestBody(softwareId, softwareStatement),
                    }
                    console.log(generateClientRequestBody(softwareId, softwareStatement));
                    return ax(jwtRequestOpt).then(res => {
                        console.log('generate jwt request success');
                        console.log(res.data)
                        const jwt = res.data['request-jwt'];
                        console.log(jwt);
                        const clientRegisterRequestOpt = {
                            method: 'POST',
                            url: 'https://sso.data-holder.local/as/clients.oauth2',
                            headers: {
                                'Content-Type' : 'application/jwt',
                            },
                            data: jwt,
                        }
                        return ax.post('https://sso.data-holder.local/as/clients.oauth2', jwt, { headers: {
                                'Content-Type' : 'application/jwt',
                            }})
                    })
                })
        })
        .catch(error => {
            if (error.response) {
                // Request made and server responded
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
        })

    console.log(response);
    // save client into db

    return {
        'softwareId': softwareId,
        'softwareStatement': softwareStatement,
        'clientId': response.data.client_id
    }
};

module.exports = registerClientHandler;
