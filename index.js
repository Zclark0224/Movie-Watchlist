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
    console.log(searchListData)

    //Move this into it's own function?
    movieList = "";
    for(let index = 0; index < searchListData.Search.length; index++){
        //fetch movie data
        let title = searchListData.Search[index].Title
        const titleResponse = await fetch(`http://www.omdbapi.com/?apikey=6f50b1e3&t=${title}`)
        const movieData = await titleResponse.json()
        console.log(movieData)

        //creating movie divs
        if(movieData.Response === "True"){
            movieList += `
                <div class="movie">
                    <img src="${movieData.Poster}">
                    <div class="movie-info-container">
                        <div class="movie-title-container">
                            <p class="movie-title">${movieData.Title}</p>
                            <p class="movie-stars">⭐${movieData.Ratings[0].Value}</p>
                        </div>
                        <div class="movie-subtext-container">
                            <p class="movie-runtime">${movieData.Runtime}</p>
                            <p class="movie-genre">${movieData.Genre}</p>
                            <button class="movie-button" id="movie${index}"><i class="fa-solid fa-circle-plus"> Watchlist</i></button>
                        </div>
                        <p class="movie-plot">${movieData.Plot}</p>
                    </div>
                </div>
                <hr>
                `
        }
    }
    movieTitleContainer.innerHTML = movieList
}