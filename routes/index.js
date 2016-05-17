var client = require('redis').createClient(process.env.REDIS_URL);
var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.redirect('http://cultofthepartyparrot.com/');
});

router.post('/', function(req, res, next) {
    // Check if Slack token is valid
    if (req.body.token !== process.env.TOKEN) {
        res.json({text: 'Invalid Slack token.'});
    }

    if (!req.body.response_url) {
        res.json({text: 'Missing `response_url`.'});
    }

    // Respond immediately and provide multiple delayed responses later
    res.json({
        response_type: 'in_channel'
    });

    // Support /party hard slash command
    if (req.body.text === 'hard') {
        // Post the Spotify song link
        request.post(req.body.response_url, {
            json: true,
            body: {
                response_type: 'in_channel',
                text: 'https://open.spotify.com/track/0E0bZtTG39K95uRjqBo1Mx'
            }
        }, function() {
            // Start the party
            request.post(req.body.response_url, {
                json: true,
                body: {
                    response_type: 'in_channel',
                    text: ':fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot:'
                }
            });
        });
    }

    // Support /party soft slash command
    if (req.body.text === 'slow') {
        var songs = [
            'https://open.spotify.com/track/4jDmJ51x1o9NZB5Nxxc7gY',
            'https://open.spotify.com/track/27ncbKwESFYzgBo9RN9IXe',
            'https://open.spotify.com/track/1rLYWSXPrJGWnlGlSwPEia',
            'https://open.spotify.com/track/4eHbdreAnSOrDDsFfc4Fpm',
            'https://open.spotify.com/track/5GorFaKkP2mLREQvhSblIg',
            'https://open.spotify.com/track/3Otjx9ULpmWdUbkDTYDXHc',
            'https://open.spotify.com/track/68K0qD0VDqdm0eWXsGqnvM',
            'https://open.spotify.com/track/665Jxlgi1HamPKbW1vwzx4',
            'https://open.spotify.com/track/69hwHdKl4Y1HusAutt3W6q',
            'https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb'
        ];
        var song = songs[Math.floor(Math.random() * songs.length)];

        // Post the Spotify song link
        request.post(req.body.response_url, {
            json: true,
            body: {
                response_type: 'in_channel',
                text: song
            }
        }, function() {
            // Start the party
            request.post(req.body.response_url, {
                json: true,
                body: {
                    response_type: 'in_channel',
                    text: ':slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot:'
                }
            });
        });
    }

    // Get access token from Redis or retrieve it from Spotify
    client.get('access_token', function(err, reply) {
        var spotifyPromise = reply ? getTracks() : getAccessToken();
        spotifyPromise.then(function(song) {
            if (!song) {
                res.json({text: 'No song found.'});
            }

            // Post the Spotify song link
            request.post(req.body.response_url, {
                json: true,
                body: {
                    response_type: 'in_channel',
                    text: song.track.external_urls.spotify
                }
            }, function() {
                // Start the party
                request.post(req.body.response_url, {
                    json: true,
                    body: {
                        response_type: 'in_channel',
                        text: '' +
                        ':congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot:' +
                        ':middleparrot::middleparrot::middleparrot::spacer::spacer::middleparrot::spacer::spacer::middleparrot::middleparrot::middleparrot::spacer::middleparrot::middleparrot::middleparrot::spacer::middleparrot::spacer::middleparrot:' +
                        ':parrotcop::spacer::parrotcop::spacer::parrotcop::spacer::parrotcop::spacer::parrotcop::spacer::parrotcop::spacer::spacer::parrotcop::spacer::spacer::parrotcop::spacer::parrotcop:' +
                        ':parrotdad::parrotdad::parrotdad::spacer::parrotdad::parrotdad::parrotdad::spacer::parrotdad::parrotdad::spacer::spacer::spacer::parrotdad::spacer::spacer::spacer::parrotdad::spacer:' +
                        ':partyparrot::spacer::spacer::spacer::partyparrot::spacer::partyparrot::spacer::partyparrot::spacer::partyparrot::spacer::spacer::partyparrot::spacer::spacer::spacer::partyparrot::spacer:' +
                        ':aussieparrot::spacer::spacer::spacer::aussieparrot::spacer::aussieparrot::spacer::aussieparrot::spacer::aussieparrot::spacer::spacer::aussieparrot::spacer::spacer::spacer::aussieparrot::spacer:' +
                        ':congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot:'
                    }
                });
            });
        }).catch(function(reason) {
            res.json({text: reason});
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
            body: {
                grant_type: 'client_credentials'
            }
        }, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                return reject(error || body);
            }

            client.set('access_token', body.access_token);
            client.expire('access_token', body.expires_in);

            getTracks().then(function(song) {
                resolve(song);
            }).catch(function(reason) {
                reject(reason)
            });
        });
    });
}

function getTracks() {
    return new Promise(function(resolve, reject) {
        client.get('access_token', function(err, reply) {
            var spotifyPlaylistUrl = Math.random() < 0.5 ? 'https://api.spotify.com/v1/users/spotify/playlists/2JkjXscXs35c5wKE5ZeaYK/tracks' : 'https://api.spotify.com/v1/users/spotify/playlists/2ruCyy85iUzZcTZbeSVFRY/tracks';
            request.get(spotifyPlaylistUrl, {
                headers: {
                    Authorization: 'Bearer ' + reply
                },
                json: true
            }, function(error, response, body) {
                if (error || response.statusCode !== 200) {
                    return reject(error || body);
                }

                var songs = body.items;
                var song = songs[Math.floor(Math.random() * songs.length)];

                resolve(song);
            });
        });
    });
}

module.exports = router;
