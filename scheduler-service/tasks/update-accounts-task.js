const updateAccountsTask = async function(hemera) {
    // get brands -> get token => request account
    hemera.act({
        topic: 'register',
        cmd: 'getDataHolderList'
    }, (err, resp) => {
        if (err) throw err;
        resp.forEach(dh => {
            console.log('update brand ' + dh.brand)
            hemera.act({
                topic: 'consent',
                cmd: 'searchTokens',
                brandId: dh._id,
            }, (err, resp) => {

            });
        })
    })
}

module.exports = updateAccountsTask;