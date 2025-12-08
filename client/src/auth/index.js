import React, { createContext, useEffect, useState } from "react";
import authRequestSender from './requests'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        errorMessage: null
    });
    useEffect(() => {
        auth.getLoggedIn();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: null
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    errorMessage: null
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            case AuthActionType.UPDATE_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            default:
                return auth;
        }
    }

    auth.getLoggedIn = async function () {
        const response = await authRequestSender.getLoggedIn();
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: response.data.loggedIn,
                    user: response.data.user
                }
            });
        }
    }

    auth.registerUser = async function(username, email, password, passwordVerify, avatarFile) {
        console.log("REGISTERING USER");
        try{   
            const response = await authRequestSender.registerUser(
                username,
                email,
                password,
                passwordVerify,
                avatarFile
            );   
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.REGISTER_USER,
                    payload: {
                        user: null,
                        loggedIn: false,
                        errorMessage: null
                    }
                })
                return { ok: true };
            }
        } catch(error){
            const msg =
                error?.response?.data?.errorMessage ||
                error?.message ||
                "Failed to register account.";

            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: null,
                    loggedIn: false,
                    errorMessage: msg
                }
            });

            return { ok: false };
        }
    }

    auth.loginUser = async function(email, password) {
        try{
            const response = await authRequestSender.loginUser(email, password);
            if (response.status === 200 && response.data.success) {
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        user: response.data.user,
                        loggedIn: true,
                        errorMessage: null
                    }
                })
                return { ok: true };
            }
        } catch(error){
            const msg =
            error?.response?.data?.errorMessage ||
            error?.message ||
            "Failed to log in.";

            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: null,
                    loggedIn: false,
                    errorMessage: msg,
                },
            });

            return { ok: false };
        }
    }

    auth.logoutUser = async function() {
        const response = await authRequestSender.logoutUser();
        if (response.status === 200) {
            authReducer( {
                type: AuthActionType.LOGOUT_USER,
                payload: null
            })
            return { ok: true };
        }
        return { ok: false };
    }

    auth.updateUser = async function (username, newPassword, newPasswordConfirm, avatarFile) {
        try {
            const response = await authRequestSender.updateUser(
                username, 
                newPassword,
                newPasswordConfirm,
                avatarFile
            );
            if (response.status === 200 && response.data.success) {
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        user: response.data.user,
                        loggedIn: true,
                        errorMessage: null,
                    },
                });
                return { ok: true };
            }
            return { ok: false }
        } catch (error) {
            const msg =
                error?.response?.data?.errorMessage ||
                error?.message ||
                "Failed to update your account.";

            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: auth.user,
                    loggedIn: true,
                    errorMessage: msg
                }
            });

            return { ok: false };
        }
    };

    auth.getUserInitials = function() {
        let initials = "";
        if (auth.user) {
            const name = auth.user.username.trim();
            if(name.length >= 2) {
                initials = name[0] + name[1];
            } else if (name.length === 1) {
                initials = name[0]
            }
            initials = initials.toUpperCase();
        }
        console.log("user initials: " + initials);
        return initials || "?";
    }

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };