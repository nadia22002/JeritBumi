const Boom = require("boom");

const errorResponse = (error) => {
  if (
    error &&
    error.output &&
    error.output.payload &&
    error.output.payload.statusCode
  ) {
    const data =
      error.data && typeof error.data === "string" ? error.data : null;

    if (error.data && typeof error.data === "object") {
      switch (error.output.payload.statusCode) {
        case 400:
          return error;
        default:
          return Boom.badImplementation();
      }
    }

    switch (error.output.payload.statusCode) {
      case 422:
        return Boom.badData(error.output.payload.message, data);
      case 404:
        return Boom.notFound(error.output.payload.message, data);
      case 400:
        return Boom.badRequest(error.output.payload.message, data);
      case 401:
        return Boom.unauthorized(error.output.payload.message, data);
      default:
        return Boom.badImplementation();
    }
  }

  return Boom.badImplementation();
};

const statusResponse = (error) => {
  if (
    error &&
    error.output &&
    error.output.payload &&
    error.output.payload.statusCode
  ) {
    const data =
      error.data && typeof error.data === "string" ? error.data : null;

    if (error.data && typeof error.data === "object") {
      switch (error.output.payload.statusCode) {
        case 400:
          return error;
        default:
          return Boom.badImplementation();
      }
    }

    switch (error?.output?.payload?.statusCode) {
      case 422:
        return 422;
      case 404:
        return 422;
      case 400:
        return 400;
      case 401:
        return 401;
      default:
        return 500;
    }
  }
};

module.exports = {
  errorResponse,
  statusResponse,
};