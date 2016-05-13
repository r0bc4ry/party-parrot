var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    // console.log(req.body.token);
    // console.log(process.env.NODE_ENV);
    res.json({
        response_type: "in_channel",
        text: ":parrot: :parrot: :parrot: :parrot:\nhttps://open.spotify.com/track/67awxiNHNyjMXhVgsHuIrs"
    });
});

module.exports = router;
