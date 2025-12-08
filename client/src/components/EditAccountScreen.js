import React, { useContext, useEffect, useState } from 'react'
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';

export default function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [newConfirm, setNewConfirm] = useState("");

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if(!auth.loggedIn || !auth.user) {
            history.push("/login");
            return;
        }

        const user = auth.user;
        setUsername(user.username || "");
        setEmail(user.email || "");
        setAvatarPreview(user.avatar || null);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loggedIn, auth.user]);

    const passwordFieldsFilled =
        newPassword.length > 0 ||
        newConfirm.length > 0;

    let valid =
        username.trim().length > 0 &&
        email.includes("@");

    if (passwordFieldsFilled) {
        valid =
            valid &&
            newPassword.length >= 8 &&
            newPassword === newConfirm;
    }

    function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if(!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    async function handleSubmit() {
        if(!valid) return;

        const result = await auth.updateUser(username, newPassword, newConfirm, avatarFile);
        if(result && result.ok) {
            setNewPassword("");
            setNewConfirm("");
            history.push("/playlists");
        }
    }

    function handleCancel() {
        history.push("/playlists");
    }

    return (
        <Box 
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "90vh",
                backgroundColor: "#C6DBEF"
        }}>
            <Card 
                sx={{
                    padding: 5,
                    minWidth: 420,
                    backgroundColor: "#fff6d5",
                    textAlign: "center"
            }}>
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

                <label htmlFor="avatarEdit">
                    <Avatar 
                        src={avatarPreview}
                        sx={{
                            width: 80,
                            height: 80,
                            margin: "0 auto 20px",
                            cursor: "pointer",
                            border: "2px solid black"
                        }}
                    />
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
                    fullWidth sx={{ mb: 2 }}
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
                >Complete</Button>

                <Button fullWidth sx={{ mt: 2 }} onClick={handleCancel}>
                    Cancel
                </Button>
            </Card>
        </Box>
    )
}
