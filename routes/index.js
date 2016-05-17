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

    // Check if a `response_url` was given by Slack
    if (!req.body.response_url) {
        res.json({text: 'Missing `response_url`.'});
    }

    // Respond immediately and provide multiple delayed responses later
    res.json({
        response_type: 'in_channel'
    });

    client.get('buzzkill', function(err, reply) {
        if (reply) {
            // See if a buzzkill is present to prevent anyone from partying too hard
            request.post(req.body.response_url, {
                json: true,
                body: {
                    response_type: 'in_channel',
                    text: 'I\'m so tired of partying. So very tired.'
                }
            });
        } else {
            // Support multiple /party slash commands
            if (req.body.text === 'hard') {
                partyHard(req.body.response_url);
            } else if (req.body.text === 'slow') {
                partySlow(req.body.response_url);
            } else {
                party(req.body.response_url);
            }
        }
    });
});

function partyHard(responseUrl) {
    // Post the Spotify song link
    request.post(responseUrl, {
        json: true,
        body: {
            response_type: 'in_channel',
            text: 'https://open.spotify.com/track/0E0bZtTG39K95uRjqBo1Mx'
        }
    }, function() {
        // Start the party
        request.post(responseUrl, {
            json: true,
            body: {
                response_type: 'in_channel',
                text: ':fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot::fastparrot:'
            }
        });
    });
}

function partySlow(responseUrl) {
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
    request.post(responseUrl, {
        json: true,
        body: {
            response_type: 'in_channel',
            text: song
        }
    }, function() {
        // Start the party
        request.post(responseUrl, {
            json: true,
            body: {
                response_type: 'in_channel',
                text: ':slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot::slowparrot:'
            }
        });
    });
}

function party(responseUrl) {
    // Get access token from Redis or retrieve it from Spotify
    client.get('access_token', function(err, reply) {
        var spotifyPromise = reply ? getTracks() : getAccessToken();
        spotifyPromise.then(function(song) {
            if (!song) {
                res.json({text: 'No song found.'});
            }

            // Post the Spotify song link
            request.post(responseUrl, {
                json: true,
                body: {
                    response_type: 'in_channel',
                    text: song.track.external_urls.spotify
                }
            }, function() {
                // Start the party
                request.post(responseUrl, {
                    json: true,
                    body: {
                        response_type: 'in_channel',
                        text: ':congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot:\n' +
                        ':middleparrot::middleparrot::middleparrot::spacer::spacer::middleparrot::spacer::spacer::middleparrot::middleparrot::middleparrot::spacer::middleparrot::middleparrot::middleparrot::spacer::middleparrot::spacer::middleparrot:\n' +
                        ':parrotcop::spacer::parrotcop::spacer::parrotcop::spacer::parrotcop::spacer::parrotcop::spacer::parrotcop::spacer::spacer::parrotcop::spacer::spacer::parrotcop::spacer::parrotcop:\n' +
                        ':parrotdad::parrotdad::parrotdad::spacer::parrotdad::parrotdad::parrotdad::spacer::parrotdad::parrotdad::spacer::spacer::spacer::parrotdad::spacer::spacer::spacer::parrotdad::spacer:\n' +
                        ':partyparrot::spacer::spacer::spacer::partyparrot::spacer::partyparrot::spacer::partyparrot::spacer::partyparrot::spacer::spacer::partyparrot::spacer::spacer::spacer::partyparrot::spacer:\n' +
                        ':aussieparrot::spacer::spacer::spacer::aussieparrot::spacer::aussieparrot::spacer::aussieparrot::spacer::aussieparrot::spacer::spacer::aussieparrot::spacer::spacer::spacer::aussieparrot::spacer:\n' +
                        ':congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot::congaparrot:'
                    }
                });
            });

            // Set a buzzkill to prevent anyone from partying too hard
            client.set('buzzkill', true);
            client.expire('buzzkill', 14400);
        }).catch(function(reason) {
            res.json({text: reason});
        });
    });
}

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
