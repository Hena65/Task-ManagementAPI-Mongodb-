const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { redisClient } = require("./config/redis");
const RedisStore = require("redis-connect")(session);
const userRouter = require("./routes/userRouter");
const projectRouter = require("./routes/projectRouter");
const taskRouter = require("./routes/taskRouter");
const authRouter = require("./routes/authRouter");

const errorHandler = require("./middlewares/error.middleware");
const limiter = require("./middlewares/rateLimit.middleware");

const app = express();
app.use(express.json());
app.use(
  session({
    store: new RedisStore({ cient: redisClient }),
    secret: "root",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60, httpOnly: true },
  }),
);
app.use(limiter);
app.use("/auth", authRouter);
app.use(userRouter);
app.use(projectRouter);
app.use(taskRouter);
app.use(errorHandler);
const MONGO_URL =
  "mongodb://henarathi:hena%401630@ac-stdp6vl-shard-00-00.tuo5ojk.mongodb.net:27017,ac-stdp6vl-shard-00-01.tuo5ojk.mongodb.net:27017,ac-stdp6vl-shard-00-02.tuo5ojk.mongodb.net:27017/?replicaSet=atlas-6w65ru-shard-0&ssl=true&authSource=admin";
const port = 3000;
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("connected to mongo");
    app.listen(port, () => {
      console.log(`server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("error while connecting to Mongo: ", err);
  });
