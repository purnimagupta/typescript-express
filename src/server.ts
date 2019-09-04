import App from './app';
import PostsController from './posts/posts.controller';
import AuthenticationController from './authentication/authentication.controller';
import UserController from './users/user.controller';
import 'dotenv/config';
import validateEnv from './utils/validateEnv';
import ReportController from './report/report.controller';

validateEnv();

const app = new App([ 
  new PostsController(),
  new AuthenticationController(),
  new UserController(),
  new ReportController()
]);

app.listen();













// import * as express from 'express';
// import * as bodyParser from 'body-parser';

// function loggerMiddleware(request: express.Request, response: express.Response, next) {
//   console.log(`${request.method} ${request.path}`);
//   next();
// }
 
// const app = express();
// app.use(bodyParser.json());
// app.use(loggerMiddleware);

// const router = express.Router();
// router.get('/', (request, response) => {
//   response.send("hello world");
// })

// router.get('/hello', (request, response) => {
//   response.send("hello world llllllllll");
// })

// // app.use('/', router);
// app.use('/api', router);

// app.get('/', (request, response) => {
//   response.send({
//     hostname: request.hostname,
//     path: request.path,
//     method: request.method,
//   });
// });
// // app.post('/', (request, response) => {
// //   response.send(request.body);
// // });
 
// app.listen(5000);