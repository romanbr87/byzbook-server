import flash from 'connect-flash';
import logger from 'morgan';
import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
import expressSession from 'express-session';
import { mainRouter } from './server/routers/routes.js';
import nocache from "nocache";
import passport from 'passport';
import { connect } from './server/lib/db.js';
import { authRouter } from './server/routers/authRouter.js';
import { commentRouter } from './server/routers/commentsRouter.js';
import { imgRouter } from './server/routers/imagesRouter.js';
import { reportRouter } from './server/routers/reportRouter.js';
import { typeRouter } from './server/routers/typesRouter.js';
import { messageRouter } from './server/routers/messagesRouter.js';
import { businessRouter } from './server/routers/businessRouter.js';
import cloudinary from "cloudinary";
import { app } from './server/lib/server.js';

dotenv.config()
/*(async () => {
  await register(app);

app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
//var options = { beautify: true, doctype: "<!DOCTYPE html>" };
//app.engine('jsx', require('express-react-views').createEngine(options));*/
//const app = express()
connect().catch((e) => {
  console.log(e);
  console.log(`\x1Bc`);
});

app.get('/favicon.ico', function (req, res, next) {
  next();
});

const session = expressSession({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
});

app.set('trust proxy', 1);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use(
  cors({
    origin: ["http://localhost:3000", "https://byzbook1.vercel.app"],
    allowedHeaders: ["Content-Type", "Authorization"], credentials: true
  })
);

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.header('Access-Control-Allow-Origin', 'https://byzbook1.vercel.app');
  
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
//   res.header('Access-Control-Allow-Credentials', 'true');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   next();
// });

app.use(session);
//app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(nocache());
app.use(logger('dev'));
app.use(flash())
// app.use(notFound);
app.use(passport.initialize());
app.use(passport.session());

// app.use(function (req, res, next) {
//   if (!req.user)
//     passport.authenticate("local", function (err, user, info) {
//       user = { username: "romanbr87", password: "1213456" };
//       req.login({ username: user.username }, (loginErr) => {
//         console.log("User Authenticated");
//         next();
//       });
//     })(req, res, next);
//   else next();
// }); //*/

cloudinary.config({
  secure: true,
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

app.use('/auth', authRouter);
app.use('/business', businessRouter);
app.use('/comment', commentRouter);
app.use('/image', imgRouter);
app.use('/message', messageRouter);
app.use('/report', reportRouter);
app.use('/type', typeRouter);
app.use('/', mainRouter);

app.get("/*", function (req, res, next) {
  next({ status: 404, message: "הדף לא קיים" });
});

app.post("/*", function (req, res, next) {
  res.status(403).send({ message: "לא ניתן לקבל נתונים" });
});

export { app }