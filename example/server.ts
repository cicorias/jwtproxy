/* eslint-disable no-console */
import dotenv from 'dotenv';
import jwt, { SignOptions } from 'jsonwebtoken';
import express, { Application, Request, Response, NextFunction, RequestHandler } from 'express';
import bodyParser from 'body-parser';
import jwtProxy, { JwtProxyOptions } from '../dist/index'

/** This is a demo server used to test and validate the actual middleware which is in index.ts */
dotenv.config();

const loggerMiddleware = (req: Request, resp: Response, next: NextFunction) => {
  console.log('Request logged:', req.method, req.path);
  next();
}

const sharedSecret = "notasecret";

/** this route is to be protected */
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

/** this route is OPEN  */
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

/** this route provides token signing for testing only. */
class SignController {
  private status = 'use POST with a json jwt payload';
  public router = express.Router();

  constructor() {
    this.router.get('/sign', this.getSign);
    this.router.post('/sign', this.sign);
  }

  getSign = (request: express.Request, response: express.Response) => {
    return response.send(this.status);
  };

  sign = (request: express.Request, response: express.Response) => {
    const options: SignOptions = { algorithm: 'HS256'}
    const rv = jwt.sign(request.body, sharedSecret, options)
    return response.send(rv);
  };

}

class App {
  public app: Application
  public port: number
  public hostname: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor (appInit: { port: number; host?: string, middleWares: RequestHandler[]; controllers: any; }) {
    this.app = express()
    this.port = appInit.port
    this.hostname = appInit.host || 'localhost'

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
    this.app.listen(this.port, this.hostname, () => {
      console.log(`App listening on the http://${this.hostname}:${this.port}`)
    })
  }
}

const options: JwtProxyOptions = {
  algorithms: [ 'RS256','HS256'],
  excluded: ['/status', '/sign'],
  secretOrKey: sharedSecret
}

const appWrapper = new App({
  port: process.env.PORT ? parseInt(process.env.PORT) : 5000,
  host: process.env.HOST || 'localhost',
  controllers: [
    new UserController(),
    new StatusController(),
    new SignController()
  ],
  middleWares: [
    jwtProxy(options),
    loggerMiddleware,
    bodyParser.json(),
    // bodyParser.urlencoded({ extended: true })
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

