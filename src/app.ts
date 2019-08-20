import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import Controller from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';


class App {
  public app: express.Application;
  
  constructor(controllers: Controller[]) {
    this.app = express();
    this.connectToTheDatabase();
    this.initializeMiddlewares();
    // this.loggerMiddleware(request, response, next);
    this.initializeControllers(controllers);
    this.initialzeErrorHandling();
  }
  
  public listen() {
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
  }

  private initialzeErrorHandling() {
    this.app.use(errorMiddleware);
  }
  private initializeControllers(controllers: Controller[]) {
    controllers.forEach(controller => {
      console.log("controller.......", controller.router)
      this.app.use('/', controller.router)
    })
  }
  private connectToTheDatabase() {
    const {
      MONGODB_URL,
    } = process.env;
    mongoose.connect(`mongodb://${MONGODB_URL}`,  { useNewUrlParser: true }, function(err: any){
      if(err) {
        console.log('Error connecting to: ', MONGODB_URL)
      }
      else {
        console.log('Connected to : ' + MONGODB_URL)
      }
    });
  }
}

export default App;
// public port: number;

  // constructor(controllers, port) {
  //   this.app = express();
  //   this.port = port;

  //   this.initializeMiddlewares();
  //   this.initializeControllers(controllers);
  // }
  
// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
