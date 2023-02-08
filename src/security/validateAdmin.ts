import { AuthenticatedUser, ExpressMiddleware } from "./authentication";

export const validateAdmin = (): ExpressMiddleware => {
  return (request, response, next) => {
    const user = request.user as AuthenticatedUser;
    if (!user?.admin) {
      response.status(401).send("requires admin");
      return;
    }
    next();
  };
};
