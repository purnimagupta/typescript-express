import * as bcrypt from 'bcrypt';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import Controller from '../interfaces/controller.interface';
import userModel from '../users/user.model';
import validationMiddleware from '../middleware/validation.middleware';
import WrongCredentialsException from '../exceptions/WrongAuthenticationTokenException';
import CreateUserDto from '../users/user.dto';
import LogInDto from './logIn.dto';
import TokenData from 'interfaces/tokenData.interface';
import User from '../users/user.interface';
import DataStoredInToken from '../interfaces/dataStoredInToken';


class AuthenticationController implements Controller {
  public path = '/auth';
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.initialzeRoutes();
  }

  private initialzeRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration)
    this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn)
    this.router.post(`${this.path}/logout`, this.loggingOut);
  }

  private loggingOut = (request: express.Request, response: express.Response) => {
    response.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
    response.send(200);
  }

  private registration = async(request: express.Request, response: express.Response, next: express.NextFunction) => {
    console.log("request.body", request.body)
    const userData: CreateUserDto = request.body;
    if( await this.user.findOne({ email: userData.email }) ) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email))
    }
    else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({
        ...userData,
        password: hashedPassword
      })
      user.password = undefined;
      const tokenData = this.createToken(user);
      response.setHeader('Set-Cookie', [this.createCookie(tokenData)])
      response.send(user);
    }   
  }

  private loggingIn = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const logInData: LogInDto = request.body;
    const user = await this.user.findOne({ email: logInData.email });
    if(user) {
      const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);

      if(isPasswordMatching) {
        user.password = undefined;
        // create token
        const tokenData = this.createToken(user);
        //set token in the cookie
        response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);

        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    }
    else {
      next(new WrongCredentialsException());
    }

  }

  private createToken(user: User): TokenData {
    const expiresIn = 60 * 60 * 24 ; 
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
    }
    return {
      expiresIn, 
      token: jwt.sign(dataStoredInToken, secret, { expiresIn} ),
    };
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-age=${tokenData.expiresIn}`
  }
}

export default AuthenticationController;