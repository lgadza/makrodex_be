import { ErrorRequestHandler, Request, Response, NextFunction } from "express";

export const unauthorizedErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.status === 401) {
    res.status(401).send({ success: false, message: err.message });
  } else {
    next(err);
  }
};

export const forbiddenErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.status === 403) {
    res.status(403).send({ success: false, message: err.message });
  } else {
    next(err);
  }
};

export const notFoundErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.status === 404) {
    res.status(404).send({ success: false, message: err.message });
  } else {
    next(err);
  }
};

export const genericErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  res.status(500).send({ success: false, message: "Generic Server Error" });
};
