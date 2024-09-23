var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Login = require('../models/login');
var Visitor = require('../models/visitor');

router.post('/login', async function (req, res) {
    try {
        let data = await User.findOne({ email: req.body.email });
        if (data) {
            if (data.password == req.body.password) {
                req.session.userId = data.unique_id;

                // Sla login-gebeurtenis op
                var loginEvent = new Login({ userId: data.unique_id });
                await loginEvent.save();

                res.json({ "Success": "Success!" });
            } else {
                res.json({ "Success": "Wrong password!" });
            }
        } else {
            res.json({ "Success": "This Email Is not registered!" });
        }
    } catch (err) {
        console.log(err);
    }
});

// Route om login-gegevens op te halen
router.get('/login-stats', async function (req, res) {
    try {
        let stats = await Login.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(stats);
    } catch (err) {
        console.log(err);
    }
});

// Route om bezoekersgegevens op te halen
router.get('/visitor-stats', async function (req, res) {
    try {
        let stats = await Visitor.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: "$count" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(stats);
    } catch (err) {
        console.log(err);
    }
});

router.get('/profile', async function (req, res) {
    try {
        let data = await User.findOne({ unique_id: req.session.userId });
        if (!data) {
            res.redirect('/admin');
        } else {
            res.send(`
                <!DOCTYPE html>
                <html lang="nl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Profile - Arnotjuh.be</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                </head>
                <body class="bg-gray-100 flex items-center justify-center h-screen">
                    <div class="bg-white p-8 rounded shadow-md w-full max-w-sm">
                        <h2 class="text-2xl mb-6 text-center">Profile</h2>
                        <p><strong>Name:</strong> ${data.username}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <a href="/logout" class="block mt-4 bg-blue-500 text-white p-2 rounded text-center">Logout</a>
                    </div>
                </body>
                </html>
            `);
        }
    } catch (err) {
        console.log(err);
    }
});

router.get('/logout', function (req, res) {
    if (req.session) {
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/admin');
            }
        });
    }
});

module.exports = router;
