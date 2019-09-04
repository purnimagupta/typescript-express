import * as express from 'express';
import Post from './post.interface';
import postModel from './posts.model';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';
import CreatePostDto from './post.dto';
import RequestWithUser from 'interfaces/requestWithUser.interface';
import userModel from '../users/user.model';

class PostController {
  public path = '/posts';
  public router = express.Router();
  private post = postModel;
  private user = userModel;

  constructor() {
    this.initializeRouters();
  }

  private initializeRouters() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById)
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost)
      .delete(`${this.path}/:id`, this.deletePost)
      .post(this.path, authMiddleware, validationMiddleware(CreatePostDto), this.createPost);
    // this.router.patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost);
    // this.router.delete(`${this.path}/:id`, this.deletePost);
    // // this.router.post(this.path, this.createPost);
    // this.router.post(this.path, validationMiddleware(CreatePostDto), this.createPost);

  }

  private getAllPosts = async (request: express.Request, response: express.Response) => {
    this.post.find().populate('author', 'name email').exec()
      .then(posts => {
        response.send(posts);
    })
    // const posts = await this.post.find()
    //   .populate('author', '-password');
    // response.send(posts);
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
  private createPost = async (request: RequestWithUser, response: express.Response) => {
    // const postData: Post = request.body;
    // const createPost = new this.post(postData);
    const postData: CreatePostDto = request.body;
   
    const createPost = new this.post({
      ...postData,
      author: request.user._id,
    })
    console.log("request.user._id", request.user._id)
    // request.user._id 5d6e42babae92b300bffb2a7

    //get user of this post
    const user = await this.user.findById(request.user._id);
    console.log("User................", user);
    // { posts: [],
    //   _id: 5d6e42babae92b300bffb2a7,
    //   name: 'poo',
    //   password:
    //    '$2b$10$Wk710ZbUKLQ7JpTn6nblmewxm.LbOM8jEYL7v7aNfGbzQy04J43KC',
    //   email: '1234@gmail.com',
    //   __v: 0 }
    
    // save posts associated with that User
    user.posts = [...user.posts, createPost._id];
    await user.save();
    console.log("User after saving................", user);
    // { posts: [ 5d6f540669fe28734558e962 ],
    //   _id: 5d6e42babae92b300bffb2a7,
    //   name: 'poo',
    //   password:
    //    '$2b$10$Wk710ZbUKLQ7JpTn6nblmewxm.LbOM8jEYL7v7aNfGbzQy04J43KC',
    //   email: '1234@gmail.com',
    //   __v: 1 }
    
    const savedPost = await createPost.save();
    //populate Author
    await savedPost.populate('author', 'name email').execPopulate();
    response.send(savedPost);
    // createPost.save()
    //   .then(savedPost => {
    //     response.send(savedPost);
    //   })
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