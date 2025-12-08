import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose')

const dbManager = require('../db/mongo/index')
const User = require('../models/user-model')
const Playlist = require('../models/playlist-model')
const Song = require('../models/song-model')

/**
 * Vitest test script for the Playlister app's Mongo Database Manager. Testing should verify that the Mongo Database Manager 
 * will perform all necessarily operations properly.
 */

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
    await dbManager.connect();
});

/**
 * Executed before each test is performed.
 */
beforeEach(async () => {
    await User.deleteMany({});
    await Playlist.deleteMany({});
    await Song.deleteMany({});
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {
});

/**
 * Executed once after all tests are performed.
 */
afterAll(async () => {
    await dbManager.disconnect();
});

/**
 * Vitest test to see if the Database Manager can create and get a User.
 */
test('Test #1) Creating and Reading a User from the Database', async () => {
    const userData = {
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: '$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu',
        avatar: 'avatar1'
    };

    const savedUser = await dbManager.createUser(userData);
    expect(savedUser).toBeDefined();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe('test@example.com');

    const foundUser = await dbManager.findUserByEmail('test@example.com');
    expect(foundUser).toBeDefined();
    expect(foundUser.username).toBe('testuser');
    expect(foundUser.avatar).toBe('avatar1');
});

/**
 * Vitest test to see if the Database Manager can create a Playlist for a User
 */
test('Test #2) Creating a Playlist for a User', async () => {
    const user = await dbManager.createUser({
        firstName: 'Matthew',
        lastName: 'Daos',
        username: 'matthewdaos',
        email: 'owner@example.com',
        passwordHash: '$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu',
        avatar: 'avatar2'
    });

    const playlist = await dbManager.createPlaylist({
        ownerId: user._id,
        name: 'Test Playlist',
        songs: []
    });

    expect(playlist).toBeDefined();
    expect(playlist.name).toBe('Test Playlist');
    expect(playlist.owner.toString()).toBe(user._id.toString());

    const updatedUser = await dbManager.findUserById(user._id);
    expect(updatedUser.playlists).toBeDefined();
    expect(updatedUser.playlists.length).toBe(1);
    expect(updatedUser.playlists[0].toString()).toBe(playlist._id.toString());
});

/**
 * Vitest test to see if the Database Manager can copy a playlist with a unique name
 */
test('Test #3) Copying a Playlist creates a new playlist with unique name', async () => {
    const user = await dbManager.createUser({
        firstName: "joe",
        lastName: "shmo",
        username: "joeshmo",
        email: "joe@shmo.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        avatar: "avatar3"
    });

    const original = await dbManager.createPlaylist({
        ownerId: user._id,
        name: "Cool playlist",
        songs: []
    });

    const copy1 = await dbManager.copyPlaylist({
        ownerId: user._id,
        sourcePlaylistId: original._id
    });

    expect(copy1).toBeDefined();
    expect(copy1.name).toBe("Copy of Cool playlist");

    const copy2 = await dbManager.copyPlaylist({
        ownerId: user._id,
        sourcePlaylistId: original._id
    });

    expect(copy2).toBeDefined();
    expect(copy2.name).toBe("Copy of Cool playlist (1)");
});

/**
 * Vitest test to see if Database Manager can update listeners and song listens from playing from a playlist
 */
test('Test #4) Playing a playlist updates listeners and song listens', async () => {
    const user = await dbManager.createUser({
        firstName: 'Shad',
        lastName: 'Shaharia',
        username: 'shadshaharia',
        email: 'shad@shaharia.com',
        passwordHash: 'pw',
        avatar: 'avatar4'
    });

    const song1 = await dbManager.createSong({
        ownerId: user._id,
        title: 'Like Him',
        artist: 'Tyler, The Creator',
        year: 2024,
        youTubeId: 'Z0CQf3JDKAY'
    });

    const song2 = await dbManager.createSong({
        ownerId: user._id,
        title: '90210',
        artist: 'Travis Scott',
        year: 2015,
        youTubeId: 'tBfWb5IrbOI'
    });

    const playlist = await dbManager.createPlaylist({
        ownerId: user._id,
        name: 'Bing Chilling',
        songs: [song1._id, song2._id]
    });

    const played = await dbManager.playPlaylist({
        listenerId: user._id,
        playlistId: playlist._id
    });

    expect(played).toBeDefined();
    expect(played.differentListeners).toBe(1);
    expect(played.listenedBy).toContain(user._id.toString());

    const updatedSong1 = await Song.findById(song1._id).exec();
    const updatedSong2 = await Song.findById(song2._id).exec();
    expect(updatedSong1.listens).toBe(1);
    expect(updatedSong2.listens).toBe(1);
});

/**
 * Vitest test to see if the Database Manager can create and search songs
 */
test('Test #5) Creating and searching songs', async () => {
    const user = await dbManager.createUser({
        firstName: 'Axel',
        lastName: 'Gutierrez',
        username: 'exlivert',
        email: 'axel@gutierrez.com',
        passwordHash: '$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu',
        avatar: 'avatar5'
    });

    const song1 = await dbManager.createSong({
        ownerId: user._id,
        title: 'Doot Doot',
        artist: 'Skrilla',
        year: 2025,
        youTubeId: '07xpV4ix2K8'
    });

    const song2 = await dbManager.createSong({
        ownerId: user._id,
        title: 'I THINK',
        artist: 'Tyler, The Creator',
        year: 2019,
        youTubeId: 'rkRdgFvuiYk'
    });

    expect(song1).toBeDefined();
    expect(song2).toBeDefined();

    const resultsByTitle = await dbManager.searchSong({
        title: 'Doot',
        artist: '',
        year: '',
        scope: 'all',
        sortBy: 'title',
        sortDir: 'asc',
        userId: null
    });

    expect(resultsByTitle.length).toBe(1);
    expect(resultsByTitle[0].title).toBe('Doot Doot');
    expect(resultsByTitle[0].artist).toBe('Skrilla');

    const resultsByArtist = await dbManager.searchSong({
        title: '',
        artist: 'Tyler',
        year: '',
        scope: 'all',
        sortBy: 'title',
        sortDir: 'asc',
        userId: null
    });

    expect(resultsByArtist.length).toBe(1);
    expect(resultsByArtist[0].title).toBe('I THINK');
    expect(resultsByArtist[0].artist).toBe('Tyler, The Creator');
});

/**
 * Vitest test to see if the Database Manager can update a song 
 */
test('Test #6) Updating a song changes its fields', async () => {
    const user = await dbManager.createUser({
        firstName: 'Edwin',
        lastName: 'Brito',
        username: 'edwinbrito',
        email: 'edwin@brito.com',
        passwordHash: '$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu',
        avatar: 'avatar6'
    });

    const original = await dbManager.createSong({
        ownerId: user._id,
        title: 'Nice Shoes',
        artist: 'Steve Lacy',
        year: 2025,
        youTubeId: '-p7B8EKRRNc'
    });

    expect(original).toBeDefined();

    const result = await dbManager.updateSong({
        ownerId: user._id,
        songId: original._id,
        data: {
            title: 'She',
            artist: 'Tyler, The Creator',
            year: 2011,
            youTubeId: 'mFNaFeIm4bU'
        }
    });

    expect(result.ok).toBe(true);
    expect(result.song).toBeDefined();
    expect(result.song.title).toBe('She');
    expect(result.song.artist).toBe('Tyler, The Creator');
    expect(result.song.year).toBe(2011);
    expect(result.song.youTubeId).toBe('mFNaFeIm4bU');

    const fromDb = await Song.findById(original._id).exec();
    expect(fromDb.title).toBe('She');
    expect(fromDb.artist).toBe('Tyler, The Creator');
    expect(fromDb.year).toBe(2011);
    expect(fromDb.youTubeId).toBe('mFNaFeIm4bU');
});

/**
 * Vitest test to see if the Database Manager can delete a song and pull it from the playlist
 */
test('Test #7) Deleting a song removes it and pulls it from playlists', async () => {
    const user = await dbManager.createUser({
        firstName: 'Saad',
        lastName: 'Mannan',
        username: 'saadmannan',
        email: 'saad@mannan.com',
        passwordHash: '$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu',
        avatar: 'avatar7'
    });

    const song = await dbManager.createSong({
        ownerId: user._id,
        title: 'Les',
        artist: 'Donald Glover',
        year: 2011,
        youTubeId: 'L8gGHqPBuZM'
    });

    const playlist = await dbManager.createPlaylist({
        ownerId: user._id,
        name: 'chill playlist',
        songs: [song._id]
    });

    expect(playlist.songs.length).toBe(1);
    expect(playlist.songs[0].toString()).toBe(song._id.toString());

    const result = await dbManager.deleteSong({
        ownerId: user._id,
        songId: song._id
    });

    expect(result.ok).toBe(true);

    const deleted = await Song.findById(song._id).exec();
    expect(deleted).toBeNull();

    const updatedPlaylist = await Playlist.findById(playlist._id).exec();
    expect(updatedPlaylist.songs).toBeDefined();
    expect(updatedPlaylist.songs.length).toBe(0);
});