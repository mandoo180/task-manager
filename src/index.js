const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

require('./db/mongoose');

// app.use((req, res, next) => {
//   res.status(503).send('Maintenance!!');
// });

// automatically change the request data into js object
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

// without middleware: new request -> run route handler
// with middleware: new request -> do something -> run route handler

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
