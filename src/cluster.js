// cluster.js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const numCPUs = 2; // Two replica sets
    console.log(`Master ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); // Restart worker if it dies
    });
} else {
    // Workers will run the main server code
    require('./server');
}
