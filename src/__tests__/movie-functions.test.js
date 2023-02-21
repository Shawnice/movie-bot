const movie = require('../movie-functions');
const path = require("path");
var mysql = require('mysql2');
const { GenericContainer, Wait } = require("testcontainers");
require('dotenv').config();

const buildContext = path.resolve(__dirname);


jest.setTimeout(30000);

describe("Query movie data", () => {
    let startedContainer;
    let conn;

    beforeAll(async () => {

        startedContainer = await new GenericContainer("movie-bot/mysql-testing")
            .withExposedPorts(3307)
            .withWaitStrategy(Wait.forLogMessage("port: 3307"))
            .start();
        console.log("Start docker container...");

        conn = mysql.createConnection({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            port: 3307,
        });
        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
        });
        console.log("Connect to MySQL...")
    });

    afterAll(async () => {
        await startedContainer.stop();
    });

    test.each([
        [['1', '3'], 3, "The Shawshank Redemption"],
        [['1st', '3rd'], 3, "The Shawshank Redemption"],
        [["first"], 1, "The Shawshank Redemption"],
        [["top", "1"], 1, "The Shawshank Redemption"],
    ])("QueryRank", async (entities, recordCount, movieName) => {
        movie.mappingFunc["movie_rank"](entities, conn, function (result) {
            expect(result.length).toEqual(recordCount);
            expect(result[0].name).toEqual(movieName);
        });
    });


    test("QueryYear", async () => {
        var entities = ['GodFather', 'The Dark Knight']
        movie.mappingFunc["movie_year"](entities, conn, function (result) {
            expect(result.length).toEqual(2);
            expect(result[0].year).toEqual(2008);
        });
    });

    test("queryActors", async () => {
        var entities = ['GodFather', 'The Dark Knight']
        movie.mappingFunc["movie_actors"](entities, conn, function (result) {
            expect(result.length).toEqual(2);
            expect(result[0].actors[0]).toEqual("Marlon Brando");
        });
    });

    test("queryDirector", async () => {
        var entities = ['GodFather', 'The Dark Knight']
        movie.mappingFunc["movie_director"](entities, conn, function (result) {
            expect(result.length).toEqual(2);
            expect(result[0].director).toEqual("Christopher Nolan");
        });
    });

    test("queryRating", async () => {
        var entities = ['GodFather', 'The Dark Knight']
        movie.mappingFunc["movie_rating"](entities, conn, function (result) {
            expect(result.length).toEqual(2);
            expect(result[0].rating).toBeLessThanOrEqual(9.2);
        });
    });

    test("queryGenre", async () => {
        var entities = ['action']
        movie.mappingFunc["movie_genre"](entities, conn, function (result) {
            expect(result.length).toEqual(1);
            expect(result[0].name).toEqual("The Dark Knight");
        });
    });

    test("queryDirectorMovies", async () => {
        var entities = ['Christopher Nolan']
        movie.mappingFunc["direct_movies"](entities, conn, function (result) {
            expect(result.length).toEqual(1);
            expect(result[0].name).toEqual("The Dark Knight");
        });
    });

});

