// Wraps an async Express route handler so a rejected promise is forwarded to
// next(err) instead of needing a try/catch in every single route.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
