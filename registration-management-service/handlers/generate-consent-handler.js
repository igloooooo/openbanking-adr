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
        "redirect_uri": "https://httpbin.org/get",
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

function getPFFromCookie(cookies) {
    return cookies.map(c => {
        const name = c.split(';')[0].split('=')[0];
        const value = c.split(';')[0].split('=')[1];
        return name +"=" + value;
    }).join(';');
}
function jwtResponseHandler(clientId, softwareId, jwt) {
    const softwareJWKSPrivate = new Buffer.from(JSON.stringify(jwt)).toString('base64');
    const jwtRequestOpt = {
        method: 'POST',
        url: 'https://mockregister.data-holder.local/testtool/tpp/requestGenericJWT',
        headers: generateRequestJWTHeader(softwareJWKSPrivate, clientId),
        data: generateRequestJWTBody(clientId),

    };
    ax(jwtRequestOpt).then(res => {
        const consent_request_url = res.data['request-url'];
        ax.get(consent_request_url, {
            headers: {
                'Accept': '*.*',
            }
        }).then(res => {
            console.log('requestGenericJWT sucess ');
            const root = parse(res.data);
            const consent_request_nonceurl = root.querySelector('form').getAttribute('action');
            const ConsentRequestOpt = {
                method: 'POST',
                url: 'https://sso.data-holder.local'+ consent_request_nonceurl,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Accept': '*.*',
                    'Cookie': getPFFromCookie(res.headers['set-cookie']),
                },
                data: qs.stringify({
                    '$ok' : 'clicked',
                    'subject' : 'crn0',
                }),
            };
            console.log(ConsentRequestOpt);
            ax(ConsentRequestOpt).then(res => {
                console.log('consent_request_nonceurl success');
                const responseHtml = parse(res.data);
                const consent_request_otp_csrf = responseHtml.querySelector("input[name='CSRF_TOKEN']").getAttribute('value');
                const verifyOTPOpt = {
                    method: 'POST',
                    url: 'https://sso.data-holder.local'+ consent_request_nonceurl,
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'Accept': '*.*',
                        'Cookie': getPFFromCookie(res.headers['set-cookie']),
                    },
                    data: qs.stringify({
                        '$ok' : 'clicked',
                        'CODE_VERIFICATION_VALUE': '123456',
                        'CODE_VERIFICATION_STATE': 'true',
                        'CSRF_TOKEN': consent_request_otp_csrf,
                        'submitform': 'true'
                    }),
                };
                console.log(verifyOTPOpt);
                // verify OTP
                ax(verifyOTPOpt).then(res => {
                    console.log('verify OTP success');
                    const html = parse(res.data);
                    const consent_ref = html.querySelector("input[name='REF']").getAttribute('value');
                    const consent_action = html.querySelector("form").getAttribute('action');
                    // Load Consent Agentless App
                    const consentAgentLessOpt = {
                        method: 'POST',
                        url: consent_action,
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            'Accept': '*.*',
                            'Cookie': getPFFromCookie(res.headers['set-cookie']),
                        },
                        data: qs.stringify({
                            'allowInteraction' : 'true',
                            'connectionId' : clientId,
                            'resumePath': consent_request_nonceurl,
                            'reauth': false,
                            'REF': consent_ref,
                        }),

                    };
                    console.log(consentAgentLessOpt);
                    ax(consentAgentLessOpt).then(response => {
                        const html = parse(response.data);
                        // console.log(response.headers);
                        console.log('consent_action success, redirect to consent page');

                        // console.log(response);

                        // console.log(response.request.res.responseUrl);
                        const jsessionid = response.request.res.responseUrl.split(';')[1];
                        const consent_request_consent_account_1 = html.querySelectorAll("input[name='accounts']")[0].getAttribute('value');
                        const consent_request_consent_account_2= html.querySelectorAll("input[name='accounts']")[1].getAttribute('value');
                        const consent_request_consent_completeurl = 'https://consent.data-holder.local/complete'
                        const performConsentOpt = {
                            method: 'POST',
                            url: consent_request_consent_completeurl,
                            headers: {
                                'content-type': 'application/x-www-form-urlencoded',
                                'Accept': '*.*',
                                'Cookie': jsessionid.toUpperCase(),
                            },
                            data: qs.stringify({
                                'approved' : 'allow',
                                'accounts' : consent_request_consent_account_1,
                                'accounts' : consent_request_consent_account_2,
                            }),
                        };
                        console.log(performConsentOpt);
                        ax(performConsentOpt).then(res => {
                            console.log(res.headers);
                            console.log(res.data);
                            console.log(res.request.res.responseUrl);
                            // ax.get(res.request.res.responseUrl, {
                            //     headers: {
                            //         'Accept': '*.*',
                            //         'Cookie': getPFFromCookie(res.headers['set-cookie']),
                            //     },
                            // }).then(res => {
                            //     console.log(res.headers);
                            //     console.log(res.data);
                            // });
                        });

                    })
                });

            });
        })
    });
}
function clientRegisterHandler(res) {
    console.log('start to generate consent');
    const clientId = 'dcr-6309d0a4-7183-3c81-98ef-9d936a2e7fad'
    //res.clientId;
    const softwareId = '8be34874-4b35-4948-bafc-830a2c8f78d2'
        //res.softwareId;
    ax.get('https://mockregister.data-holder.local/softwarestatement/JWKS/'+softwareId+'/private')
        .then(res => {
            console.log('request jwt successful')
            jwtResponseHandler(clientId, softwareId, res.data)
        })
}

const generateConsentHandler = async function(req) {

    // this.act({
    //     topic: 'register',
    //     cmd: 'getClient',
    // }, (err, resp) => {
    //     console.log('===========client response================')
    //     console.log(resp);
    //     clientRegisterHandler(resp);
    // })
    clientRegisterHandler({});

    return {
        'status': 'generating consent...'
    }
};

module.exports = generateConsentHandler;
