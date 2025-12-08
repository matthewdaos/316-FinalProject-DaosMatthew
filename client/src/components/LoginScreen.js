import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function LoginScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        auth.loginUser(email, password);
    }

    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
            backgroundColor: "#fdeaff"
        }}>
            <Card sx={{ padding: 5, minWidth: 400, backgroundColor: "#fff6d5" }}>
                <LockOutlinedIcon sx={{ fontSize: 40, mb: 1 }}/>
                <Typography variant="h4" sx={{ mb: 3 }}>Sign In</Typography>

                <TextField 
                    label="Email"
                    fullWidth sx={{ mb: 2 }}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <TextField 
                    label="Password"
                    type="password"
                    fullWidth sx={{ mb: 2 }}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button 
                    variant="contained"
                    fullWidth
                    onClick={handleLogin}
                >Sign In</Button>

                <Typography
                    variant="body2"
                    sx={{ mb: 2, cursor: "pointer", color: "red" }}
                    onClick={() => history.push("/create-account")}
                >
                    Don't have an account yet? Sign Up
                </Typography>

                 <Box sx={{ mt: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                        Copyright © Playlister 2025.
                    </Typography>
                </Box>
            </Card>
        </Box>
    );
}