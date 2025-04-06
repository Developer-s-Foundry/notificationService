
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
};

export const notFound = (
  req: Request, 
  res: Response
) => {
  res.status(404).send('Resource not found');
};