const axios = require('axios');
const https = require('https');
const fs = require('fs');

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

async function resourceHandler (option, wrap) {
    return wrap(ax(option))
}
const requests = (wrap) => {
    return {
        accountList: async function (param) {
            const token = param.token;
            return resourceHandler({
                method: 'GET',
                url: "https://api.data-holder.local/cds-au/v1/banking/accounts",
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                    'x-v': '1'
                }
            }, wrap)
        },
        accountBalance: async function (param) {
            const token = param.token;
            const accountId = param.accountId
            return resourceHandler({
                method: 'GET',
                url: "https://api.data-holder.local/cds-au/v1/banking/accounts/" + accountId + "/balance",
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                    'x-v': '1'
                }
            }, wrap)
        }
    }
}

const baseWorker = async function(req, responseHandler) {
    return await requests(responseHandler)[req.type](req.data)
};

module.exports = baseWorker;
