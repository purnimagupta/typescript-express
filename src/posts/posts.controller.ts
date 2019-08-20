import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import Post from './post.interface';
import postModel from './posts.model';
import HttpException from 'exceptions/HttpException';
import PostNotFoundException from 'exceptions/PostNotFoundException';
import createPost from './post.dto';
import validationMiddleware from 'middleware/validation.middleware';
import CreatePostDto from './post.dto';

class PostController {
  public path = '/posts';
  public router = express.Router();
  private post = postModel;

  constructor() {
    this.initializeRouters();
  }

  private initializeRouters() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById)
    this.router.patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost);
    this.router.delete(`${this.path}/:id`, this.deletePost);
    // this.router.post(this.path, this.createPost);
    this.router.post(this.path, validationMiddleware(CreatePostDto), this.createPost);

  }

  private getAllPosts = (request: express.Request, response: express.Response) => {
    this.post.find()
      .then(posts => {
        response.send(posts);
      })
  }
  // retrieve a certain document
  private getPostById = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const id = request.params.id;
    this.post.findById(id)
      .then(post => {
        if(post) {
          response.send(post);
        }
        else {
          // next(new HttpException(404, 'Post not found'))
          next(new PostNotFoundException(id));
        }
      })
  }
  // replacing a document
  private modifyPost = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const id = request.params.id;
    const postData: Post = request.body;
    this.post.findByIdAndUpdate(id, postData, { new: true})
      .then(post => {
        // response.send(post);
        next(new PostNotFoundException(id));
      })
  }
  private createPost = (request: express.Request, response: express.Response) => {
    const postData: Post = request.body;
    const createPost = new this.post(postData);

    createPost.save()
      .then(savedPost => {
        response.send(savedPost);
      })
  }
  //removing a document
  private deletePost = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const id = request.params.id;
    this.post.findByIdAndDelete(id)
      .then(successResponse => {
        if(successResponse) {
          response.send(200);
        } else {
            next(new PostNotFoundException(id));
        }
      })
  }
}


export default PostController;

 // private posts: Post[] = [
  //   {
  //     author: 'Marcin',
  //     content: 'Dolor sit amet',
  //     title: 'Lorem Ipsum',
  //   }
  // ]