/** add validated property to requests */
declare namespace Express {
  export interface Request {
    validated?: unknown;
  }
}
