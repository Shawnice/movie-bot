// Third-party
const path = require("path");
var mysql = require('mysql2');
const { DockerComposeEnvironment } = require("testcontainers");
require('dotenv').config();

// Internal
const movie = require('../movie-functions');
const DBConnection= require('../db');


const buildContext = path.resolve(__dirname);
jest.setTimeout(30000);

describe("Query movie data", () => {
    let environment;
    let conn;

    beforeAll(async () => {

        const composeFile = "docker-compose.yml";
    
        environment = await new DockerComposeEnvironment(buildContext, "docker-compose.yml").up();
        let startedContainer = environment.getContainer("mysql-testing");
        console.log("Start docker container...");

        const sqlClient = mysql.createConnection({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            port: 3307,
        });
        conn = new DBConnection(sqlClient);

        console.log("Connect to DB...")
    });

    afterAll(async () => {
        await environment.down();
    });

    test.each([
        [['1', '3'], 3, "The Shawshank Redemption"],
        [['1st', '3rd'], 3, "The Shawshank Redemption"],
        [["first"], 1, "The Shawshank Redemption"],
        [["top", "1"], 1, "The Shawshank Redemption"],
    ])("QueryRank", async (entities, recordCount, movieName) => {
        result = await movie.mappingFunc["movie_rank"](entities, conn)
        expect(result.length).toEqual(recordCount);
        expect(result[0].name).toEqual(movieName);
    });


    test("QueryYear", async () => {
        var entities = ['GodFather', 'The Dark Knight']
        result = await movie.mappingFunc["movie_year"](entities, conn)
        expect(result.length).toEqual(2);
        expect(result[0].year).toEqual(2008);
    });

    test("queryActors", async () => {
        var entities = ['GodFather', 'The Dark Knight']
        result = await movie.mappingFunc["movie_actors"](entities, conn)
        expect(result.length).toEqual(2);
        expect(result[0].actors[0]).toEqual("Marlon Brando");
    });

    test("queryDirector", async () => {
        var entities = ['GodFather', 'The Dark Knight']
        result = await movie.mappingFunc["movie_director"](entities, conn)
        expect(result.length).toEqual(2);
        expect(result[0].director).toEqual("Christopher Nolan");
    });

    test("queryRating", async () => {
        var entities = ['GodFather', 'The Dark Knight']
        result = await movie.mappingFunc["movie_rating"](entities, conn)
        expect(result.length).toEqual(2);
        expect(result[0].rating).toBeLessThanOrEqual(9.2);
    });

    test("queryGenre", async () => {
        var entities = ['action']
        result = await movie.mappingFunc["movie_genre"](entities, conn)
        expect(result.length).toEqual(1);
        expect(result[0].name).toEqual("The Dark Knight");
    })

    test("queryDirectorMovies", async () => {
        var entities = ['Christopher Nolan']
        result = await movie.mappingFunc["direct_movies"](entities, conn)
        expect(result.length).toEqual(1);
        expect(result[0].name).toEqual("The Dark Knight");
    });
});


