import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import {
    AppBanner,
    HomeScreen,
    LoginScreen,
    RegisterScreen,
    EditAccountScreen,
    PlaylistScreen,
} from './components';

function App () {   
    return (
        <BrowserRouter>
            <AppBanner />
            <Switch>
                <Route path="/" exact component={HomeScreen} />
                <Route path="/login" component={LoginScreen} />
                <Route path="/create-account" component={RegisterScreen} />
                <Route path="/edit-account" component={EditAccountScreen} />
                <Route path="/playlists" component={PlaylistScreen} />
            </Switch>
        </BrowserRouter>
    );
}

export default App