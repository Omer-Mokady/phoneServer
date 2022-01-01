const express = require('express');
const phoneRouter = require('./routes/phoneRoute');
const app = express();
const port = process.env.port || 3000;

app.use(express.json());
app.use('/phones', phoneRouter);
app.use((req,res,next) => {
    const error = new Error('404 - url path was not found');
    error.status = 404;
    next(error);
});
app.use((error,req,res,next) => {
    res.status(error.status || 500);
    res.json({error: error.message});
});

var server = app.listen(port, () => {
    console.log(`Server is listenig on port: ${port}`);
});
 
process.on("SIGINT", handleShutdownGracefully);
process.on("SIGTERM", handleShutdownGracefully);
function handleShutdownGracefully() {
server.close((err) => {
    console.log('server closed');
    process.exit(err ? 1 : 0)
    })
}

module.exports = app;