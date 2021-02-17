const axios = require('axios');

const accountListWorker = async function(req) {
    const request_opt = {
        host: req.resourceURL,
        method: 'GET',
        url: 'https://' + req.resourceURL + '/v'+req.version+'/banking/accounts',
        headers: {
            'Accept': 'application/json',
            'x-v': req.version,
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + req.token,
        }
    };
    const self = this;
    axios(request_opt)
        .then(res => {
            console.log(res.data)
            const products = res.data.data.products;
            products.forEach(product => {
                console.log('Update Product: ' + product.brand + '-' + product.productId);
                self.act({
                    topic : 'persistent',
                    cmd :'saveProduct',
                    type : 'Product',
                    data: product
                });
            })
        })
        .catch(error => {
            console.log(error)
        })

    return {
        'status': 'request has been sent'
    }
};

module.exports = accountListWorker;