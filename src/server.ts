import dotenv from 'dotenv';
import jwtProxy from './index'

/** This is a demo server used to test and validate the actual middleware which is in index.ts */

import express, { Application, Request, Response, NextFunction, RequestHandler } from 'express';

dotenv.config();

// https://dev.to/aligoren/developing-an-express-application-using-typescript-3b1

const loggerMiddleware = (req: Request, resp: Response, next: NextFunction) => {
  console.log('Request logged:', req.method, req.path);
  next();
}

class UserController {
  private sampleUsers:string[] = ['john', 'paul', 'ringo'];
  public router = express.Router();

  constructor() {
    this.router.get('/users', this.getAllUsers);
  }

  getAllUsers = (request: express.Request, response: express.Response) => {
    return response.send(this.sampleUsers);
  };
}

class StatusController {
  private status = 'all OK';
  public router = express.Router();

  constructor() {
    this.router.get('/status', this.getStatus);
  }

  getStatus = (request: express.Request, response: express.Response) => {
    return response.send(this.status);
  };

}

class App {
  public app: Application
  public port: number

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor (appInit: { port: number; middleWares: RequestHandler[]; controllers: any; }) {
    this.app = express()
    this.port = appInit.port

    this.middlewares(appInit.middleWares)
    this.routes(appInit.controllers)
    this.assets()
    this.template()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
    middleWares.forEach(middleWare => {
      this.app.use(middleWare)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private routes (controllers: { forEach: (arg0: (controller: any) => void) => void; }) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router)
    })
  }

  private assets () {
    //this.app.use(express.static('public'))
    //this.app.use(express.static('views'))
  }

  private template () {
    //this.app.set('view engine', 'pug')
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public listen () {
    this.app.listen(this.port, () => {
      console.log(`App listening on the http://localhost:${this.port}`)
    })
  }
}

const appWrapper = new App({
  port: (!process.env.PORT) ? 5000 : parseInt(process.env.PORT),
  controllers: [
    new UserController(),
    new StatusController()
  ],
  middleWares: [
    // bodyParser.json(),
    jwtProxy("foo"), //jwtVerifyMiddleware,
    // bodyParser.urlencoded({ extended: true }),
    loggerMiddleware
  ]
})


//test if running in mocha
const isInTest = typeof global.it === 'function';
//running as a proper listener process NOT under Mocha
if (!isInTest)
{ 
  appWrapper.listen();
}
else {
  //running under mocha, just forward the status code; suppress the stack trace
  appWrapper.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    //console.error(error);
    res.sendStatus(res.statusCode);
    next();
  });
}

export default appWrapper.app;

