var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'G.L.O.M.',
    username: req.header('x-ms-client-principal-name'),
    userid: req.header('x-ms-client-principal-id')
  });
});

router.get("/dbquery", async (req, res) => {
  if (req.header('x-ms-client-principal-id')) {
    userid = req.header('x-ms-client-principal-id')
    await req.app.dbquery(userid)
    res.send(req.app.get('resultString'))
  }
  else {
    res.send(req.app.get('resultString'))
  };
});

router.post("/dbupdate", (req, res) => {
  if (req.header('x-ms-client-principal-id')) {
    res.send(req.app.dbupdate(req))
  };
});

module.exports = router;