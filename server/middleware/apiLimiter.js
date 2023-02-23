import rateLimit from "express-rate-limit";

const getApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 100, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const otherApiLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
});

const apiLimiter = (req, res, next) => {
  if (req.method === "GET") {
    getApiLimiter(req, res, next);
  } else {
    otherApiLimiter(req, res, next);
  }
};

export default apiLimiter;
