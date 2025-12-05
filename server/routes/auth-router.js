const express = require('express')
const router = express.Router()
const auth = require('../auth')
const AuthController = require('../controllers/auth-controller')

router.post('/register', AuthController.registerUser)
router.post('/login', AuthController.loginUser)
router.get('/logout', AuthController.logoutUser)
router.get('/loggedIn', AuthController.getLoggedIn)

router.put('/account', auth.verify, AuthController.updateAccount);

module.exports = router