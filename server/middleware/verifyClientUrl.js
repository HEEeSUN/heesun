const verifyClientUrl = (req, res, next) => {
  const referer  = req.get("referer")
  const origin = req.get("origin")
  if (origin !== process.env.CLIENT_URL && referer !== process.env.OPEN_API_URL) {
    return res.sendStatus(404);
  }

  next();
}; 

export default verifyClientUrl;
