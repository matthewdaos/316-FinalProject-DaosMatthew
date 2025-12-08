import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';

import { useHistory } from "react-router-dom";

export default function HomeScreen() {
    const history = useHistory();

    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
            backgroundColor: "#C6DBEF"
        }}>
            <Card sx={{
                width: "70%",
                maxWidth: "800px",
                padding: 5,
                textAlign: "center",
                backgroundColor: "#fff6d5",
                boxShadow: 4
            }}>
                <Typography variant="h3" sx={{ mb: 4 }}>
                    The Playlister
                </Typography>

                <QueueMusicIcon 
                    sx={{
                        fontSize: 120,
                        mb: 4,
                        transform: "rotate(180deg)",
                        color: "black"
                    }}
                />

                <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => history.push("/playlists")}
                    >Continue as Guest</Button>

                <Button
                    variant="contained"
                    onClick={() => history.push("/login")}
                >Login</Button>

                <Button
                    variant="contained"
                    onClick={() => history.push("/create-account")}
                >Create Account</Button>
                </Box>
            </Card>
        </Box>
    );
}