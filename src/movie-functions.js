function _processRankStr(rankStr) {
    if (rankStr.toLowerCase() === "top" || rankStr.toLowerCase() === "first") {
        return "1"
    }
    return rankStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
}

async function queryRank(ranks, conn) {
    if (ranks.length === 1) {
        condition = "= " + _processRankStr(ranks[0]);
    } else {
        condition = "BETWEEN " + _processRankStr(ranks[0]) + " AND " + _processRankStr(ranks[1]);
    }
    sql = `select name, year from imdb where rank_ ${condition}`
    return new Promise(async (resolve, reject) => {
        const result = await conn.execute(sql);
        let queryResults = []
        result.forEach(item => {
            queryResults.push(
                {
                    name: item.name,
                    year: item.year
                }
            );
        });
        resolve(queryResults);
    });
};


async function queryYear(movie_names, conn) {
    conditions = []
    movie_names.forEach(item => {
        conditions.push("LOWER(imdb.name) LIKE '%" + item.toLowerCase() + "%'");
    });
    sql = `select name, year from imdb where ${conditions.join(" OR ")}`
    return new Promise(async (resolve) => {
        const result = await conn.execute(sql);
        let queryResults = []
        result.forEach(item => {
            queryResults.push(
                {
                    name: item.name,
                    year: item.year
                }
            );
        });
        resolve(queryResults);
    });
}

async function queryActors(movie_names, conn) {
    conditions = []
    movie_names.forEach(item => {
        conditions.push("LOWER(imdb.name) LIKE '%" + item.toLowerCase() + "%'");
    });
    sql = `select name, actors from imdb where ${conditions.join(" OR ")}`
    return new Promise(async (resolve) => {
        const result = await conn.execute(sql);
        let queryResults = []
        result.forEach(item => {
            queryResults.push(
                { name: item.name, actors: item.actors }
            );
        });
        resolve(queryResults);
    })
}

async function queryDirector(movie_names, conn) {
    conditions = []
    movie_names.forEach(item => {
        conditions.push("LOWER(imdb.name) LIKE '%" + item.toLowerCase() + "%'");
    });
    sql = `select name, director from imdb where ${conditions.join(" OR ")}`
    return new Promise(async (resolve) => {
        result = await conn.execute(sql);
        queryResults = []
        result.forEach(item => {
            queryResults.push(
                { name: item.name, director: item.director }
            );
        });
        resolve(queryResults);
    })
}

async function queryRating(movie_names, conn) {
    conditions = []
    movie_names.forEach(item => {
        conditions.push("LOWER(imdb.name) LIKE '%" + item.toLowerCase() + "%'");
    });
    sql = `select name, rating from imdb where ${conditions.join(" OR ")}`
    return new Promise(async (resolve) => {
        const result = await conn.execute(sql);
        let queryResults = []
        result.forEach(item => {
            queryResults.push(
                { name: item.name, rating: item.rating }
            );
        });
        resolve(queryResults);
    })
}

async function queryGenre(movie_genre, conn) {
    conditions = []
    movie_genre.forEach(item => {
        conditions.push("LOWER(imdb.genre) LIKE '%" + item.toLowerCase() + "%'");
    });
    sql = `select name, year, rating from imdb where ${conditions.join(" OR ")}`
    console.log(`sql = ${sql}`);
    return new Promise(async (resolve) => {
        const result = await conn.execute(sql);
        let queryResults = []
        result.forEach(item => {
            queryResults.push(
                {
                    name: item.name,
                    year: item.year,
                    rating: item.rating
                }
            )
        });
        resolve(queryResults);
    })
}


async function queryDirectorMovies(director_names, conn) {
    conditions = []
    director_names.forEach(item => {
        conditions.push("LOWER(imdb.director) LIKE '%" + item.toLowerCase() + "%'");
    });
    sql = `select name, year, director from imdb where ${conditions.join(" OR ")}`
    return new Promise(async (resolve) => {
        const result = await conn.execute(sql);
        let queryResults = []
        result.forEach(item => {
            queryResults.push(
                {
                    name: item.name,
                    year: item.year,
                    director: item.director
                }
            )
        });
        resolve(queryResults);
    })
}


mappingFunc = {
    movie_rank: queryRank,
    movie_year: queryYear,
    movie_actors: queryActors,
    movie_director: queryDirector,
    movie_rating: queryRating,
    movie_genre: queryGenre,
    direct_movies: queryDirectorMovies,
}

module.exports = { mappingFunc };