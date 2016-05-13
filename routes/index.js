var client = require('redis').createClient();
var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.redirect('http://cultofthepartyparrot.com/');
});

router.post('/', function(req, res, next) {
    // Check if Slack token is valid
    if (req.body.token !== process.env.TOKEN) {
        res.status(400).json({
            error: {
                code: 400,
                message: 'Invalid Slack token'
            }
        });
    }

    client.get('access_token', function(err, reply) {
        console.log(reply);
        var spotifyPromise = reply ? getTracks() : getAccessToken();
        spotifyPromise.then(function(song) {
            if (!song) {
                res.status(400).json({
                    error: {
                        code: 400,
                        message: 'No song found'
                    }
                });
            }

            res.json({
                response_type: 'in_channel',
                text: ':parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot: :parrot:\n' + song.track.external_urls.spotify
            });
        }).catch(function(error) {
            res.status(400).json({
                error: {
                    code: 400,
                    message: error
                }
            });
        });
    });
});

function getAccessToken() {
    return new Promise(function(resolve, reject) {
        request.post('https://accounts.spotify.com/api/token', {
            headers: {
                Authorization: 'Basic ' + new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            json: true,
            body: 'grant_type=client_credentials'
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                client.set('access_token', body.access_token);
                client.expire('access_token', body.expires_in);

                getTracks().then(function(song) {
                    resolve(song);
                });
            }
            reject(error);
        });
    });
}

function getTracks() {
    return new Promise(function(resolve, reject) {
        client.get('access_token', function(err, reply) {
            request.get('https://api.spotify.com/v1/users/1213343043/playlists/4HyRbS6komQ56vIkB6jnlX/tracks', {
                headers: {
                    Authorization: 'Bearer ' + reply
                },
                json: true
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var songs = body.items;
                    var song = songs[Math.floor(Math.random() * songs.length)];

                    resolve(song);
                }
                reject(error);
            });
        });
    });
}

module.exports = router;
