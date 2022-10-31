const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const fs = require('fs')
var cors = require('cors')
const https = require('https')
// const { auth, requiresAuth } = require('express-openid-connect');
var bodyParser = require('body-parser')

dotenv.config()

//Routes
const matches = require('./api/fetchData')
const authenticate = require('./api/authenticate')

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080
const app = express()

// const config = {
//     authRequired: false,
//     idpLogout: true, //login not only from the app, but also from identity provider
//     secret: process.env.SECRET,
//     baseURL: externalUrl || `https://localhost:${port}`,
//     clientID: process.env.CLIENT_ID,
//     issuerBaseURL: 'https://dev-djm6hoiw.us.auth0.com',
//     clientSecret: process.env.CLIENT_SECRET,
//     authorizationParams: {
//         response_type: 'code',
//         //scope: "openid profile email"
//     }
// }

app.use(express.static(path.join(__dirname, 'public')))
// app.use(auth(config))
app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/data', matches);
app.use('/authenticate', authenticate)

// app.get("/sign-up", (req, res) => {
//     res.oidc.login({
//         returnTo: '/',
//         authorizationParams: { screen_hint: "signup" },
//     });
// });
// app.get('/', function (req, res) {
//     let username = "null";
//     if (req.oidc.isAuthenticated()) {
//         username = req.oidc.user?.name ?? req.oidc.user?.sub;
//     }
//     res.send({ username });
// });
// app.get('/private', requiresAuth(), function (req, res) {
//     const user = JSON.stringify(req.oidc.user);
//     res.send({ user });
// });

if (externalUrl) {
    const hostname = '127.0.0.1';
    app.listen(port, hostname, () => {
        console.log(`Server locally running at http://${hostname}:${port}/ and from
    outside on ${externalUrl}`);
    });
}
else {
    https.createServer({
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }, app).listen(port, () => {
        console.log(`Server locally running at https://localhost:${port}`);
    });
}

