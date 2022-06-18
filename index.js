const searchTermInput = document.getElementById("searchTerm")
const searchSubmitBtn = document.getElementById("searchButton")
const movieTitleContainer = document.getElementById("movie-title-container")
const watchlistBtn = document.getElementsByClassName("movie-button")
const watchlistMovieTitleContainer = document.getElementById("watchlist-movie-title-container")
const pickForMeBtn = document.getElementById("pick-for-me-btn")
const popup = document.getElementById("popup")
const popupContents = document.getElementById("popup-contents")

//search button on index.html
if(searchSubmitBtn){
    searchSubmitBtn.addEventListener("click", getMovieSearch)
    searchTermInput.addEventListener("keypress", function(event){
        if(event.key === "Enter"){
            event.preventDefault()
            searchSubmitBtn.click()
        }
    })
}

//pick for me button on watchlist.html
if(pickForMeBtn){
    if(window.localStorage.length == 0){
        pickForMeBtn.style.display = 'none'
    } else {
        pickForMeBtn.style.display = 'flex'
    }
    pickForMeBtn.addEventListener("click", pickRandomMovie)
}

async function getMovieSearch(){
    //get search list from api
    const movieTitleSearch = searchTermInput.value.toLowerCase().split(" ").join("_")
    const searchListRes = await fetch(`http://www.omdbapi.com/?apikey=6f50b1e3&s=${movieTitleSearch}`)
    const searchListData = await searchListRes.json()

    //return either error message or movies
    if(searchListData.Response === "False"){
        movieList = `<div>Unable to find what you're looking for. Please try another search.</div>`
    } else {
        movieList = "";
        for(let index = 0; index < searchListData.Search.length; index++){
            //fetch movie data
            let movieId = searchListData.Search[index].imdbID
            const titleResponse = await fetch(`http://www.omdbapi.com/?apikey=6f50b1e3&i=${movieId}`)
            const movieData = await titleResponse.json()

            createMovieDivs(movieData)
        }
    }
    movieTitleContainer.innerHTML = movieList
}

async function getMovieData(key){
    const titleResponse = await fetch(`http://www.omdbapi.com/?apikey=6f50b1e3&i=${key}`)
    const movieData = await titleResponse.json()
    return movieData
}

function createMovieDivs(movieData) {
    //creating movie divs
    //checking to only add movies and tv shows
    if(movieData.Response === "True" && (movieData.Type == "movie" || movieData.Type == "series")){
        //declare the key as imdbID
        let key = movieData.imdbID
                    
        //check for rating
        let rating = (movieData.Ratings.length ? `${movieData.Ratings[0].Value}` : "0/10")

        //check for which button to display
        button = buttonDisplay(key)
        
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
                        <div class="movie-button-container" id="button-container${movieData.imdbID}">
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

function buttonDisplay(key){
    return window.localStorage.getItem(`${key}`)
        ? `<button class="movie-button" onclick="removeSearched('${key}')"><i class="fa-solid fa-circle-minus"> Remove</i></button>`
        : `<button class="movie-button" id="${key}btn" onclick="addToWatchlist('${key}')"><i class="fa-solid fa-circle-plus"> Watchlist</i></button>`
}

async function addToWatchlist(key) {
    movieData = await getMovieData(key)
    window.localStorage.setItem(`${key}`, JSON.stringify(movieData))
    document.getElementById(`button-container${key}`).innerHTML = buttonDisplay(key)
}

async function removeSearched(key) {
    window.localStorage.removeItem(key)
    document.getElementById(`button-container${key}`).innerHTML = buttonDisplay(key)
}

function renderWatchlist() {
    movieList = ""

    if(window.localStorage.length == 0){
        movieList = `
            <div class="icon-text">Your watchlist looks a little empty...</div>
            <a href="index.html" class="placeholder-subtext"><i class="fa-solid fa-circle-plus"> Let's add some movies!</i></a>
            `
    } else {
        const keys = Object.keys(localStorage);
        for (let key of keys) {
            let currentKey = JSON.parse(localStorage.getItem(key))
            createMovieDivs(currentKey)
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

        popupContents.innerHTML = `
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