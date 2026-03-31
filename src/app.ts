import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import config from "./app/config";

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      config.client_side_url as string,
      config.admin_side_url as string,
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Smart inventory system start.');
});

// handle global error
app.use(globalErrorHandler);
app.use(notFound);
export default app;
