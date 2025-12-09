import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {jsTPS} from "jstps"
import storeRequestSender from './requests'
import CreateSong_Transaction from '../transactions/CreateSong_Transaction'
import MoveSong_Transaction from '../transactions/MoveSong_Transaction'
import RemoveSong_Transaction from '../transactions/RemoveSong_Transaction'
import UpdateSong_Transaction from '../transactions/UpdateSong_Transaction'
import AuthContext from '../auth'

/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR STORE
export const GlobalStoreContext = createContext({});
console.log("create GlobalStoreContext");

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    EDIT_SONG: "EDIT_SONG",
    REMOVE_SONG: "REMOVE_SONG",
    HIDE_MODALS: "HIDE_MODALS"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

const CurrentModal = {
    NONE : "NONE",
    DELETE_LIST : "DELETE_LIST",
    EDIT_SONG : "EDIT_SONG",
    EDIT_PLAYLIST: "EDIT_PLAYLIST",
    PLAY_PLAYLIST: "PLAY_PLAYLIST",
    ERROR : "ERROR",
    DELETE_SONG: "DELETE_SONG"
}

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalStoreContextProvider(props) {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        currentModal : CurrentModal.NONE,
        playlists: [],
        allPlaylists: [],
        catalogSongs: [],
        filteredCatalogs: [],
        songSearchQuery: "",
        filters: {},
        sortMethod: "Listeners (Hi-Lo)",
        idNamePairs: [],
        currentList: null,
        currentSongIndex : -1,
        currentSong : null,
        newListCounter: 0,
        listNameActive: false,
        listIdMarkedForDeletion: null,
        listMarkedForDeletion: null,
        songMarkedForDeletion: null
    });
    const history = useHistory();

    console.log("inside useGlobalStore");

    // SINCE WE'VE WRAPPED THE STORE IN THE AUTH CONTEXT WE CAN ACCESS THE USER HERE
    const { auth } = useContext(AuthContext);
    console.log("auth: " + auth);

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.NONE,
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.playlist,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: prev.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songMarkedForDeletion: null
                }));
            }

            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.NONE,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songMarkedForDeletion: null
                }));
            }

            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_NEW_LIST: {                
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.NONE,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: prev.newListCounter + 1,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songMarkedForDeletion: null
                }));
            }

            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.NONE,
                    idNamePairs: payload,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songMarkedForDeletion: null
                }));
            }

            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.DELETE_LIST,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    listNameActive: false,
                    listIdMarkedForDeletion: payload.id,
                    listMarkedForDeletion: payload.playlist,
                    songMarkedForDeletion: null
                }));
            }

            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.NONE,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songMarkedForDeletion: null
                }));
            }

            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.NONE,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    listNameActive: true,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songMarkedForDeletion: null
                }));
            }

            // EDIT SONG (for playlist or catalog)
            case GlobalStoreActionType.EDIT_SONG: {
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.EDIT_SONG,
                    currentSongIndex: payload.currentSongIndex,
                    currentSong: payload.currentSong,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songMarkedForDeletion: null
                }));
            }

            case GlobalStoreActionType.REMOVE_SONG: {
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.NONE,
                    currentSongIndex: payload.currentSongIndex,
                    currentSong: payload.currentSong,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songMarkedForDeletion: null
                }));
            }

            case GlobalStoreActionType.HIDE_MODALS: {
                return setStore(prev => ({
                    ...prev,
                    currentModal : CurrentModal.NONE,
                    currentSongIndex: -1,
                    currentSong: null,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songMarkedForDeletion: null
                }));
            }
            default:
                return store;
        }
    }

    store.tryAcessingOtherAccountPlaylist = function(){
        let id = "635f203d2e072037af2e6284";
        async function asyncSetCurrentList(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: playlist
                });
            }
        }
        asyncSetCurrentList(id);
        history.push("/playlist/635f203d2e072037af2e6284");
    }

    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        async function asyncChangeListName(id) {
            // 1. Get the latest playlist from backend
            let response = await storeRequestSender.getPlaylistById(id);
            if (!response.data.success) return;

            let playlist = response.data.playlist;
            playlist.name = newName;

            // 2. Update playlist in DB
            response = await storeRequestSender.updatePlaylistById(
                playlist._id,
                playlist
            );
            if (!response.data.success) return;

            // 3. Refresh pairs from backend
            const pairsResponse = await storeRequestSender.getPlaylistPairs();
            if (!pairsResponse.data.success) return;

            const pairsArray = pairsResponse.data.idNamePairs || [];

            // 4. Update playlists, allPlaylists, idNamePairs, currentList in store
            setStore(prev => {
                const updateNameInList = (list) =>
                    (list || []).map(p =>
                        p._id === playlist._id
                            ? { ...p, name: playlist.name }
                            : p
                    );

                return {
                    ...prev,
                    currentModal: prev.currentModal,
                    playlists: updateNameInList(prev.playlists),
                    allPlaylists: updateNameInList(prev.allPlaylists),
                    idNamePairs: pairsArray,
                    currentList: playlist,
                    currentSongIndex: -1,
                    currentSong: null,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                };
            });
        }
        asyncChangeListName(id);
    };

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions();
        history.push("/");
    }

    store.copyPlaylist = function (playlistId) {
        async function asyncCopy(playlistId) {
            try {
                const response = await storeRequestSender.copyPlaylistById(playlistId);
                if (response.status === 201 && response.data.success) {
                    const searchResp = await storeRequestSender.searchPlaylists({
                        scope: 'mine',
                        sortBy: 'listeners',
                        sortDir: 'desc'
                    });

                    if (searchResp.data.success) {
                        const playlists = searchResp.data.playlists || [];
                        setStore(prev => ({
                            ...prev,
                            allPlaylists: playlists,
                            playlists
                        }));
                    } else {
                        console.error("Failed to refresh playlists after copy:", searchResp.data);
                    }
                } else {
                    console.error("Copy playlist failed:", response.data);
                }
            } catch (err) {
                console.error("Error copying playlist:", err.response?.data || err.message);
            }
        }
        asyncCopy(playlistId);
    };

    // THIS FUNCTION CREATES A NEW LIST
    store.createNewList = async function () {
        if (!auth.user || !auth.user.email) {
            console.error("createNewList: no logged-in user or missing email", auth.user);
            return;
        }

        const existingNames = new Set(
            (store.playlists || []).map(p => p.name)
        );

        const base = "Untitled";
        let counter = 1;
        let newListName = `${base}${counter}`;
        while (existingNames.has(newListName)) {
            counter++;
            newListName = `${base}${counter}`;
        }

        try {
            const response = await storeRequestSender.createPlaylist(
                newListName,
                [],                 // no songs yet
                auth.user.email     // backend ignores ownerEmail but it's fine
            );

            console.log("createPlaylist response:", response);

            if (response.status === 201 && response.data.success) {
                tps.clearAllTransactions();
                let newList = response.data.playlist;

                // keep your existing reducer behavior
                storeReducer({
                    type: GlobalStoreActionType.CREATE_NEW_LIST,
                    payload: newList
                });

                // and also add it to the playlists list for cards
                setStore(prev => ({
                    ...prev,
                    playlists: [newList, ...(prev.playlists || [])]
                }));
            } else {
                console.error("Server did not return success:", response.data);
            }
        } catch (err) {
            console.error(
            "createPlaylist failed:",
            err.response?.status,
            err.response?.data || err.message
            );
        }
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await storeRequestSender.getPlaylistPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                console.log(pairsArray);
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }
    store.loadUserPlaylists = function () {
        if (!auth.loggedIn || !auth.user) {
            setStore(prev => ({
                ...prev,
                allPlaylists: [],
                playlists: [],
                currentList: null,
                idNamePairs: [],
                listIdMarkedForDeletion: null,
                listMarkedForDeletion: null
            }));
            return;
        }
        async function load() {
            try {
                const response = await storeRequestSender.searchPlaylists({
                    scope: 'mine',       
                    sortBy: 'listeners', 
                    sortDir: 'desc'
                });

                if (response.data.success) {
                    const playlists = response.data.playlists || [];
                    setStore(prev => ({
                        ...prev,
                        allPlaylists: playlists,
                        playlists
                    }));
                }
            } catch (err) {
                console.error('Failed to load playlists:', err);
                setStore(prev => ({
                    ...prev,
                    allPlaylists: [],
                    playlists: []
                }));
            }
        }

        load();
    };

    store.loadSongCatalog = function () {
        async function load() {
            try {
                const response = await storeRequestSender.getSongCatalog();

                if (response.data.success) {
                    const songs = response.data.songs;
                    setStore(prev => ({
                        ...prev,
                        catalogSongs: songs,
                        filteredCatalogs: songs
                    }));
                } else {
                    console.log("FAILED TO LOAD SONG CATALOG:", response.data);
                }
            } catch (err) {
                console.error("Error loading song catalog:", err);
            }
        }
        load();
    };

    store.searchPlaylists = function (filters, sortMethod) {
        const { name, user } = filters;

        const nameF   = name?.trim().toLowerCase();
        const userF   = user?.trim().toLowerCase();

        let result = (store.allPlaylists || []).filter(pl => {
            const plName = (pl.name || "").toLowerCase();
            const plOwner = (pl.ownerUsername || pl.ownerName || pl.ownerEmail || "").toLowerCase();

            if (nameF && !plName.includes(nameF)) return false;

            if (userF && !plOwner.includes(userF)) return false;

            return true;
        });

        switch (sortMethod) {
            case "Playlist Name (A–Z)":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "Playlist Name (Z–A)":
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "User Name (A–Z)":
                result.sort((a, b) =>
                    (a.ownerUsername || a.ownerName || "").localeCompare(b.ownerUsername || b.ownerName || ""));
                break;
            case "User Name (Z–A)":
                result.sort((a, b) =>
                    (b.ownerUsername || b.ownerName || "").localeCompare(a.ownerUsername || a.ownerName || ""));
                break;
            case "Listeners (Lo–Hi)":
                result.sort((a, b) => (a.listeners ?? 0) - (b.listeners ?? 0));
                break;
            case "Listeners (Hi–Lo)":
            default:
                result.sort((a, b) => (b.listeners ?? 0) - (a.listeners ?? 0));
                break;
        }

        setStore(prev => ({
            ...prev,
            playlists: result
        }));
    }

    store.searchCatalogSongs = function (query) {
        const q = query.trim().toLowerCase();

        if (!q) {
            setStore(prev => ({
                ...prev,
                filteredCatalog: prev.catalogSongs,
                songSearchQuery: ""
            }));
            return;
        }

        const results = store.catalogSongs.filter(song =>
            song.title.toLowerCase().includes(q) ||
            song.artist.toLowerCase().includes(q) ||
            (song.year || "").toString().includes(q)
        );

        setStore(prev => ({
            ...prev,
            filteredCatalog: results,
            songSearchQuery: query
        }));
    };

    store.clearCatalogSearch = function () {
        setStore(prev => ({
            ...prev,
            filteredCatalog: prev.catalogSongs,
            songSearchQuery: ""
        }))
    };

    // THE FOLLOWING 5 FUNCTIONS ARE FOR COORDINATING THE DELETION
    // OF A LIST, WHICH INCLUDES USING A VERIFICATION MODAL. THE
    // FUNCTIONS ARE markListForDeletion, deleteList, deleteMarkedList,
    // showDeleteListModal, and hideDeleteListModal
    store.markListForDeletion = function (id) {
        async function getListToDelete(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                    payload: {id: id, playlist: playlist}
                });
            }
        }
        getListToDelete(id);
    }
    store.deleteList = function (id) {
    async function processDelete(id) {
        try {
            let response = await storeRequestSender.deletePlaylistById(id);

            if (response.data.success) {
                setStore(prev => ({
                    ...prev,
                    playlists: (prev.playlists || []).filter(p => p._id !== id),
                    idNamePairs: (prev.idNamePairs || []).filter(p => p._id !== id),
                    currentModal: CurrentModal.NONE,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                }));
            } else {
                console.log("FAILED TO DELETE PLAYLIST", response.data);
            }
        } catch (err) {
            console.error("Error deleting playlist:", err);
        }
    }

    processDelete(id);
};
    store.deleteMarkedList = function () {
        if (store.listIdMarkedForDeletion) {
            store.deleteList(store.listIdMarkedForDeletion);
        }
    };
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST

    store.showEditSongModal = (songIndex, songToEdit) => {
        storeReducer({
            type: GlobalStoreActionType.EDIT_SONG,
            payload: {currentSongIndex: songIndex, currentSong: songToEdit}
        });        
    }

    store.showDeleteSongModal = function (song) {
        setStore(prev => ({
            ...prev,
            currentModal: CurrentModal.DELETE_SONG,
            songMarkedForDeletion: song,
        }));
    };

    store.showEditPlaylistModal = function (id) {
        async function asyncOpen(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;

                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: playlist
                });

                setStore(prev => ({
                    ...prev,
                    currentModal: CurrentModal.EDIT_PLAYLIST
                }));
            }
        }
        asyncOpen(id);
    };

    store.showPlayPlaylistModal = function (id) {
        async function asyncOpen(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;

                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: playlist
                });

                setStore(prev => ({
                    ...prev,
                    currentModal: CurrentModal.PLAY_PLAYLIST
                }));    
            }
        }
        asyncOpen(id);
    };
    store.hideModals = () => {
        auth.errorMessage = null;
        storeReducer({
            type: GlobalStoreActionType.HIDE_MODALS,
            payload: {}
        });    
    }
    store.isDeleteListModalOpen = () => {
        return store.currentModal === CurrentModal.DELETE_LIST;
    }

    store.isDeleteSongModalOpen = function () {
        return store.currentModal === CurrentModal.DELETE_SONG;
    };

    store.isEditSongModalOpen = () => {
        return store.currentModal === CurrentModal.EDIT_SONG;
    }
    store.isErrorModalOpen = () => {
        return store.currentModal === CurrentModal.ERROR;
    }

    store.isEditPlaylistModalOpen = () => {
        return store.currentModal === CurrentModal.EDIT_PLAYLIST;
    }

    store.isPlayPlaylistModalOpen = () => {
        return store.currentModal === CurrentModal.PLAY_PLAYLIST;
    };

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;

                response = await storeRequestSender.updatePlaylistById(playlist._id, playlist);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: playlist
                    });
                    history.push("/playlist/" + playlist._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }

    store.getPlaylistSize = function() {
        return store.currentList.songs.length;
    }

    store.addSongFromCatalogToPlaylist = async function (song, playlistId) {
        try {
            const response = await storeRequestSender.addSongToPlaylist(
                song._id,
                playlistId
            );

            if (!response.data || !response.data.success) {
                console.error("Failed to add song to playlist:", response.data);
                return;
            }

            const updatedPlaylist = response.data.playlist;

            setStore(prev => {
                const updateListArray = (arr) =>
                    (arr || []).map(pl =>
                        pl._id === updatedPlaylist._id ? updatedPlaylist : pl
                    );

                const newPlaylists    = updateListArray(prev.playlists);
                const newAllPlaylists = updateListArray(prev.allPlaylists);

                let newCurrentList = prev.currentList;
                if (prev.currentList && prev.currentList._id === updatedPlaylist._id) {
                    newCurrentList = updatedPlaylist;
                }

                return {
                    ...prev,
                    playlists: newPlaylists,
                    allPlaylists: newAllPlaylists,
                    currentList: newCurrentList
                };
            });

        } catch (err) {
            console.error("Error adding song from catalog to playlist:", err);
        }
    };

    store.addNewSong = function() {
        let index = this.getPlaylistSize();
        this.addCreateSongTransaction(index, "Untitled", "?", new Date().getFullYear(), "dQw4w9WgXcQ");
    }
    // THIS FUNCTION CREATES A NEW SONG IN THE CURRENT LIST
    // USING THE PROVIDED DATA AND PUTS THIS SONG AT INDEX
    store.createSong = function(index, song) {
        let list = store.currentList;      
        list.songs.splice(index, 0, song);
        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }

    store.createNewCatalogSong = async function () {
        const allSongs = store.catalogSongs || [];

        const baseTitle = "Untitled";
        const artist = "Unknown Artist";

        let counter = 1;
        let newTitle = baseTitle;

        const exists = (title) =>
            allSongs.some(
                (s) =>
                    (s.title || "").toLowerCase() === title.toLowerCase() &&
                    (s.artist || "").toLowerCase() === artist.toLowerCase()
            );

        while (exists(newTitle)) {
            counter += 1;
            newTitle = `${baseTitle} ${counter}`;
        }

        const payload = {
            title: newTitle,
            artist: artist,
            year: new Date().getFullYear().toString(),
            youTubeId: "dQw4w9WgXcQ",
        };

        try {
            const response = await storeRequestSender.createSong(payload);

            if (response.data.success) {
                const newSong = response.data.song;

                // add to catalog
                setStore((prev) => ({
                    ...prev,
                    catalogSongs: [...(prev.catalogSongs || []), newSong],
                }));

                // open edit modal for the new song
                const index = (store.catalogSongs || []).length;
                store.showEditSongModal(index, newSong);
            } else {
                console.error("Failed to create song:", response.data);
            }
        } catch (err) {
            console.error(
                "Error creating catalog song:",
                err.response?.status,
                err.response?.data || err.message
            );
        }
    };

    store.deleteCatalogSong = function () {
        const song = store.songMarkedForDeletion;
        if (!song || !song._id) {
            store.hideModals();
            return;
        }

        async function asyncDelete() {
            try {
                const response = await storeRequestSender.deleteSong(song._id);

                if (response.data.success) {
                    setStore(prev => ({
                        ...prev,
                        catalogSongs: (prev.catalogSongs || []).filter(
                            (s) => s._id !== song._id
                        ),
                        currentModal: CurrentModal.NONE,
                        songMarkedForDeletion: null,
                    }));
                } else {
                    console.error("Failed to delete song:", response.data);
                }
            } catch (err) {
                console.error("Error deleting song:", err);
            }
        }
        asyncDelete();
    };

    store.updateCatalogSong = async function (songId, newSongData) {
        try {
            const response = await storeRequestSender.updateSong(songId, newSongData);

            if (response.data.success) {
                const updatedSong = response.data.song;

                setStore(prev => ({
                    ...prev,
                    catalogSongs: (prev.catalogSongs || []).map(s =>
                        s._id === updatedSong._id ? updatedSong : s
                    )
                }));
            } else {
                console.error("Failed to update catalog song:", response.data.errorMessage);
            }
        } catch (err) {
            console.error("Error updating catalog song:", err);
        }
    };

    store.addSongToPlaylist = async function (songId, playlistId) {
        try {
            const response = await storeRequestSender.addSongToPlaylist(songId, playlistId);

            if (response.data && response.data.success) {
                const updatedPlaylist = response.data.playlist;

                setStore(prev => ({
                    ...prev,
                    currentList:
                        (prev.currentList && prev.currentList._id === updatedPlaylist._id)
                            ? updatedPlaylist
                            : prev.currentList
                }));
            } else {
                console.error("addSongToPlaylist failed:", response.data);
            }
        } catch (err) {
            console.error("Error in store.addSongToPlaylist:", err);
        }
    };

    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    store.moveSong = function(start, end) {
        let list = store.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    // THIS FUNCTION REMOVES THE SONG AT THE index LOCATION
    // FROM THE CURRENT LIST
    store.removeSong = function(index) {
        let list = store.currentList;      
        list.songs.splice(index, 1); 

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    // THIS FUNCTION UPDATES THE TEXT IN THE ITEM AT index TO text
    store.updateSong = function(index, songData) {
        let list = store.currentList;
        let song = list.songs[index];
        song.title = songData.title;
        song.artist = songData.artist;
        song.year = songData.year;
        song.youTubeId = songData.youTubeId;

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    store.addNewSong = () => {
        let playlistSize = store.getPlaylistSize();
        store.addCreateSongTransaction(
            playlistSize, "Untitled", "?", new Date().getFullYear(), "dQw4w9WgXcQ");
    }
    // THIS FUNCDTION ADDS A CreateSong_Transaction TO THE TRANSACTION STACK
    store.addCreateSongTransaction = (index, title, artist, year, youTubeId) => {
        // ADD A SONG ITEM AND ITS NUMBER
        let song = {
            title: title,
            artist: artist,
            year: year,
            youTubeId: youTubeId
        };
        let transaction = new CreateSong_Transaction(store, index, song);
        tps.processTransaction(transaction);
    }    
    store.addMoveSongTransaction = function (start, end) {
        let transaction = new MoveSong_Transaction(store, start, end);
        tps.processTransaction(transaction);
    }
    // THIS FUNCTION ADDS A RemoveSong_Transaction TO THE TRANSACTION STACK
    store.addRemoveSongTransaction = (song, index) => {
        //let index = store.currentSongIndex;
        //let song = store.currentList.songs[index];
        let transaction = new RemoveSong_Transaction(store, index, song);
        tps.processTransaction(transaction);
    }
    store.addUpdateSongTransaction = function (index, newSongData) {
        let song = store.currentList.songs[index];
        let oldSongData = {
            title: song.title,
            artist: song.artist,
            year: song.year,
            youTubeId: song.youTubeId
        };
        let transaction = new UpdateSong_Transaction(this, index, oldSongData, newSongData);        
        tps.processTransaction(transaction);
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await storeRequestSender.updatePlaylistById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }
    store.canAddNewSong = function() {
        return (store.currentList !== null);
    }
    store.canUndo = function() {
        return ((store.currentList !== null) && tps.hasTransactionToUndo());
    }
    store.canRedo = function() {
        return ((store.currentList !== null) && tps.hasTransactionToDo());
    }
    store.canClose = function() {
        return (store.currentList !== null);
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    function KeyPress(event) {
        if (!store.modalOpen && event.ctrlKey){
            if(event.key === 'z'){
                store.undo();
            } 
            if(event.key === 'y'){
                store.redo();
            }
        }
    }
  
    document.onkeydown = (event) => KeyPress(event);

    return (
        <GlobalStoreContext.Provider value={{
            store
        }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };