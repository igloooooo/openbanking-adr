const updateProductTask = async function(hemera) {
    hemera.act({
        topic: 'register',
        cmd: 'getDataHolderList'
    }, (err, resp) => {
        if (err) throw err;
        resp.forEach(dh => {
            console.log('update brand ' + dh.brand)
            hemera.act({
                topic: 'ingestion',
                cmd: 'getProduct',
                version: dh.version,
                resourceURL: dh.resourceRUL,
            });
        })
    })
}

module.exports = updateProductTask;