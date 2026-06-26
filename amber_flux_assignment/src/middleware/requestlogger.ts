import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = uuidv4();
  req.headers["x-request-id"] = id;
  res.setHeader("x-request-id", id);
  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = req.headers["x-request-id"];

  console.log(`--> [${requestId}] ${req.method} ${req.url}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `<-- [${requestId}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}