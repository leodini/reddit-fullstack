import { Response, Request, Express } from "express";

export type MyContext = {
  req: Request & { session: Express.Session };
  res: Response;
};
