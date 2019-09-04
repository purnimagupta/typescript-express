import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import RequestWithUser from 'interfaces/requestWithUser.interface';
import DataStoredInToken from 'interfaces/dataStoredInToken';
import userModel from '../users/user.model';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';


async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
  const cookies = request.cookies;
  if(cookies && cookies.Authorization) {
    const secret = process.env.JWT_SECRET;
    console.log("secret", process.env.JWT_SECRET);
    console.log("cookies", cookies);
    try {
      const verificationResponse = jwt.verify(cookies.Authorization, secret) as DataStoredInToken;
      console.log("verificationResponse", verificationResponse);
      const id = verificationResponse._id;
      const user = await userModel.findById(id);
      if(user) {
        request.user = user;
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch ( error) {
      next(new WrongAuthenticationTokenException());
    }
  }
  else {
    next(new AuthenticationTokenMissingException());
  }
}

export default authMiddleware;