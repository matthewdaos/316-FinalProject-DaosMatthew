const auth = require('../auth')
const dbManager = require('../db/mongo/index')
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null
            })
        }

        const loggedInUser = await dbManager.findUserById(userId);
        console.log("loggedInUser: " + loggedInUser);

        if(!loggedInUser) {
            return res.status(200).json({ loggedIn: false, user: null });
        }
        return res.status(200).json({
            loggedIn: true,
            user: {
                username: loggedInUser.username,
                email: loggedInUser.email,
                avatar: loggedInUser.avatar,
                _id: loggedInUser._id
            }
        })
    } catch (err) {
        console.log("err: " + err);
        return res.status(500).json({ loggedIn: false, user: null, errorMesssage: "Server error" });
    }
}

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await dbManager.findUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res.status(401).json({ errorMessage: "Wrong email or password provided." })
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res.status(401).json({ errorMessage: "Wrong email or password provided." })
        }

        // LOGIN THE USER
        const token = auth.signToken(existingUser._id);
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                username: existingUser.username,
                email: existingUser.email,
                avatar: existingUser.avatar             
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    console.log("req.body =", req.body);

    try {
        const { username, email, password, passwordVerify, avatar } = req.body;

        if (!username || !email || !password || !passwordVerify) {
            return res.status(400).json({ errorMessage: "Please enter all required fields." });
        }

        console.log("all fields provided");

        if (password.length < 8) {
            return res.status(400).json({ errorMessage: "Please enter a password of at least 8 characters." });
        }

        console.log("password long enough");

        if (password !== passwordVerify) {
            return res.status(400).json({ errorMessage: "Please enter the same password twice." });
        }

        console.log("password and password verify match");

        const existingUser = await dbManager.findUserByEmail(email);
        console.log("existingUser:", existingUser);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                errorMessage: "An account with this email address already exists."
            });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash:", passwordHash);

        const savedUser = await dbManager.createUser({
            username,
            email,
            passwordHash,
            avatar: avatar || "default-avatar.png"
        });
        console.log("new user saved:", savedUser._id);

        return res.status(200).json({
            success: true,
            user: {
                username: savedUser.username,
                email: savedUser.email,
                avatar: savedUser.avatar
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
};

updateAccount = async (req, res) => {
    try {
        const userId = req.userId;

        const { username, avatar, currentPassword, newPassword, newPasswordVerify } = req.body;

        const user = await dbManager.findUserById(userId);
        if (!user) {
            return res.status(400).json({ errorMessage: "User not found" });
        }

        if (username) user.username = username;
        if(avatar) user.avatar = avatar;

        if (newPassword || newPasswordVerify || currentPassword) {
            if (!currentPassword || !newPassword || !newPasswordVerify) {
                return res.status(400).json({ errorMessage: "Please provide current and new passwords." });
            }

            const currentValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if(!currentValid) {
                return res.status(401).json({ errorMessage: "Current password is incorrect." });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ errorMessage: "New password must be at least 8 characters." });
            }

            if (newPassword !== newPasswordVerify) {
                return res.status(400).json({ errorMessage: "New passwords do not match." });
            }

            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(newPassword, salt);
        }

        const savedUser = await user.save();
        return res.status(200).json({
            success: true,
            user: {
                username: savedUser.username,
                email: savedUser.email,
                avatar: savedUser.avatar
            }
        })
    } catch (err) {
        console.error("updateAccount error:", err);
        res.status(500).send()
    }
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateAccount
}