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
async function revokeTokenHandler(req) {
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
            const revokeTokenReqOpt = {
                method: 'POST',
                url: 'https://sso.data-holder.local/as/revoke_token.oauth2',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Accept': '*.*',
                },
                data: qs.stringify({
                    'token' : refreshToken,
                    'client_assertion' : consent_client_assertion,
                    'grant_type': 'refresh_token',
                    'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                }),
            }
            console.log(revokeTokenReqOpt);
            return ax(revokeTokenReqOpt).then(res => {
                return {
                    'status': 'ok'
                };
            });
        }).catch(e => {
            console.log(e.response);
            throw e;
        })
    })
}

async function revokeConsentHandler(req) {
    console.log('revoke user consent');
    const consent_cdr_arrangement_id = req.consent_cdr_arrangement_id;
    const softwareId = req.softwareId;
    const clientId = req.clientId;
    return ax.get('https://mockregister.data-holder.local/softwarestatement/JWKS/'+softwareId+'/private').then(res => {
        // const software_jwks_private = 'eyJwIjoiOXpwWU5YX0NLQ0JCTXJTOTBiVnlLZ0NKblNjWnVhSEM0MkM1UmNra3ZpQW8tM3BDSldDSDhpT0tPZXQwdEtDLU41YTBRZUVVVzlrRGJRMDczSHV2WkVWdk1ua3QtaFJGMEhlNEcwaWIydkxwbmI3SjdLRHJidVhDSXJERGFicmpIZmpsTnZ1ZUxUVFZTTkdMZTd0cVRIVGJ0QXZLT28tU3VzLXFvbG5tb05VIiwia3R5IjoiUlNBIiwicSI6ImhPNDM0N19YdjRmazJpUFBtSEpRUGc5VC04ajc3RXR4ZzRfSVg0ZkRFQnlydFl1OGRubXNqckdwX1R1WmNIYUg3YjNfRm14MVhERTUzOXg5d01tQ2FuRWtkRUxqU3ozc3RfT2dhSHFNTktQVnpNdDZZT0ZVU2F6dWczWFFyejBELWpjMVZ1SjcxRFJFdWFkcFQtaE1SNEhKZDRSaHJTT1I2cHRmb0VjQmN6TSIsImQiOiJQbjJPSXpkZ3RtaWluay13RzZWZkxVREJsdUNYcVo3NXdIUmszS29qQ2ZGS2dXeGMxem9zWXU4VU9GOWlsV3NVNERJbl94aWpHRE8tSzE1a0YzNEplUnh2X0p5V1BjNWhla3hBMmVXTWRORmRneGhCOVpzLVRHVmotejlsT2hyQ19feTZ5cTl5YVNJUWNqWUJQTkZ4RWpZZWRJazRiUDhOb0ctM1JNU1hqYU4wRzNWSnNXZVh0X2tRVndVMjZERlo4Uy04Y2J1ZWhfWDdOZlVYRG1TNVVEYWFmbVRCN2dDY3pHbE9TempVOEFaekJkSUIzQ1BSMGlvaU5DYXQwUTlPemFVVk1GcWNsMWhvQkhVY0FRbDJCbnd5eEl6clFPNkFjYXdXRFhMLXg2QmUxbE9zamlDRDJIZ1dxZU83VEZQdlZoUVhNMWtOWUhldklzV3FDTmQyTVEiLCJlIjoiQVFBQiIsInVzZSI6InNpZyIsImtpZCI6ImFiMjQ1NzIzLWIwN2UtNGFiMS04NjBkLWM0M2JkOWFkMzgyZSIsInFpIjoiQ2tMUEpzZlJsR1NHOEpjSXdFN2dYZG4tM05wUXhPV1ZwZlNiUUxleU1TSzNpY2dBWF9IXzF5a3ZUX2xpMnIydlR6dEVLY0V3RkNvQTlsMVFTRnBIdVlxYTdUMi1FUHl6S3pSZkRJTk5ZTS1mX05WSlE4ek5lYkthUWZNTG5hUk9nOVhuYXp4aU9fWTRJaDBRcDVZQm1XSjFqQ2piYkVzbU1TZTVLVWEyeTM0IiwiZHAiOiJScEt0STNoNDRDTjAtUmlISnhuNG9Pek9XOElSb2RfX1ZoRUNVbDE4MDVreW1iYm9zdXFfWS11cFJhZGxCVHJ0a2NpX1pCN3dSTmZLRnBNMGgxZjNWVlJNemNleHpEV0ZTR0VrZVFWZEdEOUhXUFJoaDk3WDFpeFlJcmI2MFctNzdZNWpRRExMa0hRSWZtVHl3RHRidUwtVEItNWxxQm5iOU5fYkFjVlFCSkUiLCJhbGciOiJQUzI1NiIsImRxIjoiUUt2VXJRek1YZll6TkoxdmhlODNjcm5xVmZpMTk0UE11Z0RkcnZ4UnZpajBzT0pHMGl6bjhwUWs2M3B2Yl9ONnRnTlZjd2RaSVgwaGR2UENpbVItLW1JSkpqYlVkZXF1bTlfX0RsVndtTHVNYkpJaC03Z2tWYU80ZG1SX0hvSkV5UnJLN0haTFlEWDlxWVQxQzFjc3BTMVRZcjRZOXk3eThueWN6VkUtTjFrIiwibiI6ImdHQWpzeEtSZTl5ek9ueE4xVUhHcVZGb2RnTEg1TlY3RTR5Tmo5OWl3RVZfRlRsVVpqRnRwQUNCdktlVHJMZmdvbGh1cjF1c25ZZDFNeWMwS0tkTjJQdmFJZWFCTndGai1jRTFlaHJxMFd5RzZiQ1k1aV9DOGpZV3N0akRmWjNhTFp3SlBWZC1Jb3FsTGhqR2hMOTdSVTlONERBZmdaZTcwYkZqam9nSkFXVGtNa1NNYUJwXzdYeTc4VnhlTFlvRzQ0RFFkckIxMnlNdzFsbEdOR0puR09WbmdxQlNtQlpCek11SVVUM1A2SzJyMTBqamF3aWlvVnVleURCOWVZNVFUVHF1ZHo5Q1dnVjJOZUVJVUQyQzFsNUwtUFNOajB0LV9YUUhlQkdHQXVPNlZvdW8zRlFtdjYtdFZPR0RrREQzVXVnNzJUcXhNV2tMWWMxY053YTVidyJ9';
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
                    'code' : code,
                    'client_assertion' : consent_client_assertion,
                    'grant_type': 'authorization_code',
                    'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                    'code_verifier': 'iE6J6yykJ68pWqYooNvqp17xNF_54jOQttyTG9j-E0pggUO.lsDm23t9ZdTjsFT.SpzludwTRlun8wQX8VJunzE09tnWHqviupObE-5rF_fAHlcsqMl5ti4Kx53vVf3j',
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

module.exports = { revokeConsentHandler, revokeTokenHandler};
