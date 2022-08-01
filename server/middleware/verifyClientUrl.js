const verifyClientUrl = (req, res, next) => {
  if (req.get("origin") !== process.env.CLIENT_URL) {
    return res.sendStatus(404);
  }

  next();
}; 

export default verifyClientUrl;