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

    console.log(data)
    try {
        if (username === data.username && password === data.password) {
            res.json("Login successful");
        }
        else {

            if (username !== data.username) {
                res.json("Wrong username");
            }
            else if (password !== data.password) {
                res.json(`Wrong password on user: ${data.username}`);
            }


        }
    }
    catch (e) {
        res.json(`Internal login error`)
    }

})

let countLoginAttempts = 0;
let onTimout = false

router.post('/authProtected', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (onTimout) {
        res.json(`Still no login for you`);
    }
    else if (countLoginAttempts >= 3) {
        onTimout = true;
        setTimeout(() => {
            countLoginAttempts = 0;
            onTimout = false
        }, 10000);

        res.json(`Next 10 seconds no login for you`);
    }
    else {
        try {
            if (username === data.username && password === data.password) {
                countLoginAttempts = 0;
                res.json("Login successful");
            }
            else {

                if (username !== data.username) {
                    countLoginAttempts += 1
                    res.json("Login data is wrong");
                }
                else if (password !== data.password) {
                    countLoginAttempts += 1
                    res.json("Login data is wrong");
                }

            }
        }
        catch (e) {
            res.json(`Internal login error`)
        }
    }


})
module.exports = router