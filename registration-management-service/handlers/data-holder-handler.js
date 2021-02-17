const dataHolderResourceHandler = async function(req) {
    return [{
        'brand': 'cba',
        'resourceRUL' : 'api.commbank.com.au/public',
        'version': 1
    }]
}

module.exports = dataHolderResourceHandler;