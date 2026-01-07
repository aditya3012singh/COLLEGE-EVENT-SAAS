/**
 * Async Route Handler Wrapper
 * Wraps controller functions to catch Promise rejections
 * Prevents unhandled promise rejections in async handlers
 */

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Wrap all controller functions
 */
export const wrapControllers = (controllers) => {
  const wrapped = {};

  Object.keys(controllers).forEach((key) => {
    if (typeof controllers[key] === 'function') {
      wrapped[key] = asyncHandler(controllers[key]);
    } else {
      wrapped[key] = controllers[key];
    }
  });

  return wrapped;
};

export default { asyncHandler, wrapControllers };
