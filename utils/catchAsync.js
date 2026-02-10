module.exports = (fn) => {
  // 1. receives your function (fn) as an argument
  return (req, res, next) => {
    // 2. returns a new anonymous function that Express calls
    fn(req, res, next).catch((err) => next(err));
    // 3. runs your function. Because it's async, it returns a Promise.
    // 4. .catch() waits for that promise to fail. If it does, it calls next(err).
  };
};
