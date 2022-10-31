const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
    res.json({ error: false })
})

module.exports = router