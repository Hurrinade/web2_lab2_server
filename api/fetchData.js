const express = require('express')
const router = express.Router()

const db = require('../db/index')

const data = require('../users/data.json');

/*
    SQL INJECTION
*/
router.post('/sqlNonprotected', async (req, res) => {
    const gameName = req.body.name;

    // SQL injection true
    try {
        let names = (await db.query(`SELECT * FROM games where game_name = '${gameName}'`)).rows;

        res.json(names);
    }
    catch (e) {
        res.json(`INVALID SQL: SELECT * FROM games where game_name = '${gameName}'`)
    }

})


router.post('/sqlProtected', async (req, res) => {
    let gameName = req.body.name;

    // SQL injection false
    try {
        gameName = gameName.replaceAll("'", "");
        gameName = gameName.replaceAll("=", "");
        gameName = gameName.replaceAll(";", "");
        gameName = gameName.replaceAll("(", "");
        gameName = gameName.replaceAll(")", "");
        gameName = gameName.trim()

        console.log(gameName)

        let names = (await db.query(`SELECT * FROM games where game_name = $1`, [gameName])).rows;

        res.json(names);
    }
    catch (e) {
        res.json(`INVALID SQL: SELECT * FROM games where game_name = '${gameName}'`)
    }

})

/*
    BROKEN AUTH
*/

router.get('/authNotProtected', async (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    console.log(data, username, password)
    try {
        if (username === data[0].username && password === data[0].password) {
            req.session.cookie.httpOnly = false;
            console.log(req.session.id)
            res.json({ msg: "Login successful", cookie: req.session.cookie });
        }
        else {
            if (username !== data[0].username) {
                res.json({ msg: "Wrong username" });
            }
            else if (password !== data[0].password) {
                res.json({ msg: `Wrong password on user: ${data[0].username}` });
            }
        }
    }
    catch (e) {
        res.json({ msg: `Internal login error` });
    }

})

let countLoginAttempts = 0;
let onTimout = false

router.post('/authProtected', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (onTimout) {
        res.json({ msg: `Still no login for you` });
    }
    else if (countLoginAttempts >= 3) {
        onTimout = true;
        setTimeout(() => {
            countLoginAttempts = 0;
            onTimout = false
        }, 10000);

        res.json({ msg: `Next 10 seconds no login for you` });
    }
    else {
        try {
            if (username === data[1].username && password === data[1].password) {
                countLoginAttempts = 0;
                req.session.cookie.httpOnly = true;
                let hour = 3600000
                req.session.cookie.expires = new Date(Date.now() + hour)
                req.session.cookie.maxAge = hour
                req.session.cookie.secure = true;
                req.session.cookie.sameSite = true;
                res.json({ msg: "Login successful", cookie: req.session.cookie });
            }
            else {

                if (username !== data[1].username) {
                    countLoginAttempts += 1
                    res.json({ msg: "Login data is wrong" });
                }
                else if (password !== data[1].password) {
                    countLoginAttempts += 1
                    res.json({ msg: "Login data is wrong" });
                }

            }
        }
        catch (e) {
            res.json({ msg: `Internal login error` })
        }
    }


})
module.exports = router