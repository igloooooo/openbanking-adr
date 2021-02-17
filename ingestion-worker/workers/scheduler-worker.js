
const baseWorker = require('./base-worker')

const schedulerWorker = async function(req) {
    const self = this;
    baseWorker(req, promise => {
        promise.then(res => {
            const data = res.data.data;
            // save data into mongodb
            const type = req.type;
            self.act({
                topic: 'persistent',
                cmd :'saveResource',
                type: type,
                data: data
            })
        })
    });

    return {
        'status': 'OK'
    }
};

module.exports = schedulerWorker;
