import { ExpressMiddleware } from "./authentication";

export const validateId = (): ExpressMiddleware => {
  return (request, response, next) => {
    const id = request.params.id;
    if (id == null || !isValidObjectId(id)) {
      // bad object id throws exception later, so check early
      return response.sendStatus(404);
    } else {
      next();
    }
  };
};

const checkForHexString = new RegExp("^[0-9a-fA-F]{24}$");
const isValidObjectId = (id: unknown) => {
  let _id = "";
  try {
    if (id == null) {
      return false;
    } else {
      typeof id !== "string" ? (_id = id.toString()) : (_id = id);
    }
    return checkForHexString.test(_id);
  } catch (e) {
    return false;
  }
};
