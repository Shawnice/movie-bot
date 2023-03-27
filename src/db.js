class DBConnection {
    constructor(client) {
        this.client = client;
        this.connect();
    }

    connect() {
        this.client.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
        })
    }

    async execute(command) {
        console.debug(`Execute command ${command}`);
        return new Promise((resolve) => {
            this.client.execute(command, function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        })
    }
}

module.exports.default = DBConnection