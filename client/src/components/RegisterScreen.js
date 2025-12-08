import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function RegisterScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const valid = username.trim().length > 0 && email.includes("@") && password.length >= 8 && password === confirm && avatarFile != null;

    function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if(!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    async function handleSubmit() {
        console.log("Create Account clicked");
        if(!valid) return;
        const result = await auth.registerUser(username, email, password, confirm, avatarFile);

        if (result && result.ok) {
            history.push("/login");
        }
    }

    console.log({ username, email, password, confirm, valid });
    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
            backgroundColor: "#C6DBEF"
        }}>
            <Card sx={{
                padding: 5,
                minWidth: 420,
                backgroundColor: "#fff6d5",
                textAlign: "center"
            }}>
                <LockOutlinedIcon sx={{ fontSize: 40, mb: 1 }}/>

                <Typography variant="h4" sx={{ mb: 3 }}>
                    Create Account
                </Typography>

                <input 
                    type="file"
                    accept="image/*"
                    id="avatarUpload"
                    style={{ display: "none" }}
                    onChange={handleAvatarUpload}
                />

                <label htmlFor="avatarUpload">
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
                    fullWidth sx={{ mb: 2 }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <TextField 
                    label="Email"
                    fullWidth sx={{ mb: 2 }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <TextField 
                    label="Password"
                    type="password"
                    fullWidth sx={{ mb: 2 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <TextField 
                    label="Password Confirm"
                    type="password"
                    fullWidth sx={{ mb: 3 }}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />

                <Button 
                    variant="contained"
                    fullWidth
                    disabled={!valid}
                    onClick={handleSubmit}
                >Create Account</Button>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                        Copyright © Playlister 2025.
                    </Typography>
                </Box>
            </Card>
        </Box>
    )
}