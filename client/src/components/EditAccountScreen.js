import React, { useContext, useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";
import AuthContext from "../auth";

export default function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [newConfirm, setNewConfirm] = useState("");

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // For convenience in JSX
    const user = auth.user || {};

    useEffect(() => {
        if (!auth.loggedIn || !auth.user) {
            history.push("/login");
            return;
        }

        setUsername(user.username || "");
        setEmail(user.email || "");

        // use whatever field you’re storing for avatar (avatar, avatarUrl, etc.)
        setAvatarPreview(user.avatarUrl || user.avatar || null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loggedIn, auth.user]);

    // Clean up object URL when component unmounts or avatarPreview changes
    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const passwordFieldsFilled =
        newPassword.length > 0 || newConfirm.length > 0;

    let valid = username.trim().length > 0 && email.includes("@");

    if (passwordFieldsFilled) {
        valid =
            valid &&
            newPassword.length >= 8 &&
            newPassword === newConfirm;
    }

    function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            // enforce 250x250 max dimensions
            if (img.width > 250 || img.height > 250) {
                alert("Avatar image must be at most 250x250 pixels.");
                URL.revokeObjectURL(objectUrl);
                return;
            }

            // OK to use this preview
            setAvatarPreview(objectUrl);
            setAvatarFile(file);
        };

        img.src = objectUrl;
    }

    async function handleSubmit() {
        if (!valid) return;

        // auth.updateUser should accept avatarFile on backend side
        const result = await auth.updateUser(
            username,
            newPassword,
            newConfirm,
            avatarFile
        );

        if (result && result.ok) {
            setNewPassword("");
            setNewConfirm("");
            history.push("/playlists");
        }
    }

    function handleCancel() {
        history.push("/playlists");
    }

    const avatarLetter =
        (user.username && user.username[0].toUpperCase()) || "?";

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "90vh",
                backgroundColor: "#C6DBEF",
            }}
        >
            <Card
                sx={{
                    padding: 5,
                    minWidth: 420,
                    backgroundColor: "#fff6d5",
                    textAlign: "center",
                }}
            >
                <Typography variant="h4" sx={{ mb: 3 }}>
                    Edit Account
                </Typography>

                <input
                    type="file"
                    accept="image/*"
                    id="avatarEdit"
                    style={{ display: "none" }}
                    onChange={handleAvatarUpload}
                />

                <label htmlFor="avatarEdit" style={{ cursor: "pointer" }}>
                    <Avatar
                        src={avatarPreview || undefined}
                        sx={{ width: 56, height: 56, mx: "auto", mb: 2 }}
                    >
                        {avatarLetter}
                    </Avatar>
                </label>

                <TextField
                    label="User Name"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <TextField
                    label="Email"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={email}
                    InputProps={{ readOnly: true }}
                />

                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <TextField
                    label="Password Confirm"
                    type="password"
                    fullWidth
                    sx={{ mb: 3 }}
                    value={newConfirm}
                    onChange={(e) => setNewConfirm(e.target.value)}
                />

                <Button
                    variant="contained"
                    fullWidth
                    disabled={!valid}
                    onClick={handleSubmit}
                >
                    Complete
                </Button>

                <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            </Card>
        </Box>
    );
}
