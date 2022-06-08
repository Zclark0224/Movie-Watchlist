const searchTermInput = document.getElementById("searchTerm")
const searchSubmitBtn = document.getElementById("searchButton")
const movieTitleContainer = document.getElementById("movie-title-container")

searchSubmitBtn.addEventListener("click", getMovieData)
searchTermInput.addEventListener("keypress", function(event){
    if(event.key === "Enter"){
        event.preventDefault()
        searchSubmitBtn.click()
    }
})

async function getMovieData(){
    //get search list
    const movieTitle = searchTermInput.value.toLowerCase().split(" ").join("_")
    const searchListRes = await fetch(`http://www.omdbapi.com/?apikey=6f50b1e3&s=${movieTitle}`)
    const searchListData = await searchListRes.json()

    //Move this into it's own function?
    movieList = "";
    for(let index = 0; index < searchListData.Search.length; index++){
        //fetch movie data
        let title = searchListData.Search[index].Title
        const titleResponse = await fetch(`http://www.omdbapi.com/?apikey=6f50b1e3&t=${title}`)
        const movieData = await titleResponse.json()
        console.log(movieData)

        //creating movie divs
        movieList += `
            <div class="movie">
                <img src="${movieData.Poster}">
                <h3 class="movie-title">${movieData.Title}</h3>
                <h5 class="movie-title">${movieData.Runtime}</h5>
                <h5 class="movie-title">⭐${movieData.Ratings[0].Value}</h5>
                <h5 class="movie-title">${movieData.Genre}</h5>
                <button id="movie${index}"><i class="fa-solid fa-circle-plus">Watchlist</i></button>
                <p class="movie-title">${movieData.Plot}</p>
            </div>
            `
    }
    movieTitleContainer.innerHTML = movieList
}