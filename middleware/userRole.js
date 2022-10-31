const users = require('../users/data.json')

const axios = require('axios');

const authConfig = {
    domain: "dev-djm6hoiw.us.auth0.com",
    audience: "https://vue-web2-api.com"
};

let currentAccessToken = null
let userData = null

async function checkUserRole(req, res, next) {

    try {
        const accessToken = req.headers.authorization.split(" ")[1]

        if (currentAccessToken == null || currentAccessToken != accessToken) {
            userData = await axios.get(`https://${authConfig.domain}/userinfo`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            currentAccessToken = accessToken
        }

        if (userData != null &&
            userData.data != null &&
            userData.data.email != null
            && users[userData.data.email].role === 'USER') {
            req.email = userData.data.email
            next();
        }
        else {
            res.status(403).json({ error: "You are not user" })
        }
    } catch (error) {
        res.status(429).json({ error: "Too many requests" })
    }

}

async function checkAdminRole(req, res, next) {
    try {
        const accessToken = req.headers.authorization.split(" ")[1]

        if (currentAccessToken == null || currentAccessToken != accessToken) {
            userData = await axios.get(`https://${authConfig.domain}/userinfo`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            currentAccessToken = accessToken
        }

        if (
            userData != null &&
            userData.data != null &&
            userData.data.email != null
            && users[userData.data.email].role === 'ADMIN') {
            req.email = userData.data.email
            next();
        }
        else {
            res.status(403).json({ error: "You are not admin" })
        }
    } catch (error) {
        res.status(429).json({ error: "Too many requests" })
    }
}

module.exports = { checkUserRole, checkAdminRole }