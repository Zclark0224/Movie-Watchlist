const searchTermInput = document.getElementById("searchTerm")
const searchSubmitBtn = document.getElementById("searchButton")
const movieTitleContainer = document.getElementById("movie-title-container")
const watchlistBtn = document.getElementsByClassName("movie-button")
const watchlistMovieTitleContainer = document.getElementById("watchlist-movie-title-container")
const pickForMeBtn = document.getElementById("pick-for-me-btn")
const popup = document.querySelector(".popup")
const closePopup = document.querySelector(".close-popup")

//global variable for all searched movies
let movieIds = []
let watchlistMovies = []

if(searchSubmitBtn){
    searchSubmitBtn.addEventListener("click", getMovieData)
    searchTermInput.addEventListener("keypress", function(event){
        if(event.key === "Enter"){
            event.preventDefault()
            searchSubmitBtn.click()
        }
    })
}

if(pickForMeBtn){
    if(window.localStorage.length == 0){
        pickForMeBtn.style.display = 'none'
    } else {
        pickForMeBtn.style.display = 'flex'
    }
    pickForMeBtn.addEventListener("click", pickRandomMovie)
}

async function getMovieData(){
    movieIds = []

    //get search list
    const movieTitle = searchTermInput.value.toLowerCase().split(" ").join("_")
    const searchListRes = await fetch(`http://www.omdbapi.com/?apikey=6f50b1e3&s=${movieTitle}`)
    const searchListData = await searchListRes.json()

    if(searchListData.Response === "False"){
        movieList = `<div>Unable to find what you're looking for. Please try another search.</div>`
    } else {

        //Move this into it's own function?
        movieList = "";
        for(let index = 0; index < searchListData.Search.length; index++){
            //fetch movie data
            let movieId = searchListData.Search[index].imdbID
            const titleResponse = await fetch(`http://www.omdbapi.com/?apikey=6f50b1e3&i=${movieId}`)
            const movieData = await titleResponse.json()

            movieIds.push(movieData)

            //creating movie divs
            if(movieData.Response === "True" && (movieData.Type == "movie" || movieData.Type == "series")){
                
                //no rating placeholder
                let rating = ""
                if(movieData.Ratings.length === 0){
                    rating = "0/10"
                } else {
                    rating = `${movieData.Ratings[0].Value}`
                }

                let button = ``
                if(window.localStorage.getItem(`${movieData.imdbID}`)){
                    button = `
                        <button class="movie-button" onclick="removeSearched('${movieData.Title}', ${index})"><i class="fa-solid fa-circle-minus"> Remove</i></button>
                        `
                } else {
                    button = `
                        <button class="movie-button" id="${index}btn" onclick="addToWatchlist(${index})"><i class="fa-solid fa-circle-plus"> Watchlist</i></button>
                        `
                }

                movieList += `
                    <div class="movie">
                        <img src="${movieData.Poster}">
                        <div class="movie-info-container">
                            <div class="movie-title-container">
                                <p class="movie-title">${movieData.Title}</p>
                                <p class="movie-stars">⭐${rating}</p>
                            </div>
                            <div class="movie-subtext-container">
                                <p class="movie-runtime">${movieData.Runtime}</p>
                                <p class="movie-genre">${movieData.Genre}</p>
                                <div class="movie-button-container" id="button-container${index}">
                                    ${button}
                                </div>
                            </div>
                            <p class="movie-plot">${movieData.Plot}</p>
                        </div>
                    </div>
                    <hr>
                    `
            }
        }
    }
    movieTitleContainer.innerHTML = movieList
}

function addToWatchlist(index) {
    let key = movieIds[index].imdbID
    window.localStorage.setItem(`${key}`, JSON.stringify(movieIds[index]))
    document.getElementById(`button-container${index}`).innerHTML = `
        <button class="movie-button" onclick="removeSearched('${key}', ${index})"><i class="fa-solid fa-circle-minus"> Remove</i></button>
        `
}

function removeSearched(key, index) {
    window.localStorage.removeItem(key)
    document.getElementById(`button-container${index}`).innerHTML = `
        <button class="movie-button" id="${index}btn" onclick="addToWatchlist(${index})"><i class="fa-solid fa-circle-plus"> Watchlist</i></button>
        `
}

function renderWatchlist() {
    let movieList = ""

    if(window.localStorage.length == 0){
        movieList = `
            <div class="icon-text">Your watchlist looks a little empty...</div>
            <a href="index.html" class="placeholder-subtext"><i class="fa-solid fa-circle-plus"> Let's add some movies!</i></a>
            `
    } else {
        const keys = Object.keys(localStorage);
        for (let key of keys) {
            let currentKey = JSON.parse(localStorage.getItem(key))
            movieList += `
                <div class="movie">
                    <img src="${currentKey.Poster}">
                    <div class="movie-info-container">
                        <div class="movie-title-container">
                            <p class="movie-title">${currentKey.Title}</p>
                            <p class="movie-stars">⭐${currentKey.Ratings[0].Value}</p>
                        </div>
                        <div class="movie-subtext-container">
                            <p class="movie-runtime">${currentKey.Runtime}</p>
                            <p class="movie-genre">${currentKey.Genre}</p>
                            <div class="movie-button-container" id="button-container}">
                                <button class="movie-button" onclick="removeFromWatchlist('${key}')"><i class="fa-solid fa-circle-minus"> Remove</i></button>
                            </div>
                        </div>
                        <p class="movie-plot">${currentKey.Plot}</p>
                    </div>
                </div>
                <hr>
                `
        }
    }
    watchlistMovieTitleContainer.innerHTML = movieList
}

function removeFromWatchlist(key){
    window.localStorage.removeItem(key)
    renderWatchlist()
}

function pickRandomMovie(){
        pickForMeBtn.disabled = false;
        let keys = Object.keys(localStorage)
        let randomKey = keys[Math.floor(Math.random() * keys.length)]
        let currentMovie = JSON.parse(localStorage.getItem(randomKey))
        popup.style.display = "block"
    
        document.getElementById("popup-contents").innerHTML = `
            <div class="movie">
            <img class="popup-img" src="${currentMovie.Poster}">
            <div class="movie-info-container">
                <div class="movie-title-container">
                    <p class="movie-title">${currentMovie.Title}</p>
                </div>
                <div class="movie-subtext-container">
                    <p class="movie-runtime">${currentMovie.Runtime}</p>
                    <p class="movie-genre">${currentMovie.Genre}</p>
                </div>
                <p class="movie-plot">${currentMovie.Plot}</p>
                <div class="random-movie-button-container">
                    <button id="watched-button" onclick="hideAndRemove('${currentMovie.imdbID}')">Watched <span>(remove from list)</span></button>
                    <button id="repick-button" onclick="pickRandomMovie()">Pick again!</button>
                </div>
            </div>
        </div>
        `
}

function hidePopup(){
    popup.style.display = "none"
}

function hideAndRemove(key){
    hidePopup()
    removeFromWatchlist(key)
}