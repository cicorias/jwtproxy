import dotenv from 'dotenv';
// import express from 'express';
import express, { Application, Request, Response, NextFunction, RequestHandler } from 'express';

dotenv.config();

// https://dev.to/aligoren/developing-an-express-application-using-typescript-3b1

const loggerMiddleware = (req: Request, resp: Response, next: NextFunction) => {
  console.log('Request logged:', req.method, req.path);
  next();
}

class App {
  public app: Application
  public port: number

  constructor (appInit: { port: number; middleWares: RequestHandler[]; controllers: any; }) {
    this.app = express()
    this.port = appInit.port

    this.middlewares(appInit.middleWares)
    this.routes(appInit.controllers)
    this.assets()
    this.template()
  }

  private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
    middleWares.forEach(middleWare => {
      this.app.use(middleWare)
    })
  }

  private routes (controllers: { forEach: (arg0: (controller: any) => void) => void; }) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router)
    })
  }

  private assets () {
    this.app.use(express.static('public'))
    this.app.use(express.static('views'))
  }

  private template () {
    this.app.set('view engine', 'pug')
  }

  public listen () {
    this.app.listen(this.port, () => {
      console.log(`App listening on the http://localhost:${this.port}`)
    })
  }
}

const app = new App({
  port: 5000,
  controllers: [
    // new HomeController(),
    // new PostsController()
  ],
  middleWares: [
    // bodyParser.json(),
    // bodyParser.urlencoded({ extended: true }),
    loggerMiddleware
  ]
})

app.listen()
