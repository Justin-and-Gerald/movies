{
    const OMDB_URL = `https://www.omdbapi.com/`;
    const glitch = "https://lightning-swift-girl.glitch.me/movies";
    $(document).ready(() => {
        //--- Content for Main tab
        function getPoster(title) {
            return fetch(`https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&query=${title}`)
                .then(response => response.json())
                .then(movie => {
                    let posterPath = movie.results[0].poster_path
                    return "http://image.tmdb.org/t/p/w500" + posterPath
                })
                .catch(error => console.error(error))
        }

//
        function ourMovies() {
            fetch(glitch)
                .then(response => response.json())
                .then(movies => {
                    let promises = [];
                    for (let movie of movies) {
                        let {
                            title,
                            rating,
                            id,
                            release_date,
                            director,
                            genre,
                            actors,
                            overview
                        } = movie;
                        $('#main').append(`
                            <div id="${title}" class="card  my-2" style="width: 18rem;">
                                <img class="card-img-top" data- src="" alt="movie poster">
                                <div id="${id}" class="card-body d-flex flex-column">
                                    <h3>${title}</h3>
<!--                                    <p class="rating fas fa-star">  Rating: ${rating}</p>-->
                                    <p class="released fas fa-star">   Released: ${release_date}</i></p>
<!--                                    <p class="director fas fa-star">   Directed by: ${director}</p>-->
<!--                                    <p class="genre fas fa-star">  Genre: ${genre}</p>-->
<!--                                    <p class="starring fas fa-star">  Starring: ${actors}</p>-->
                                    <p class="plot fas fa-star">  Plot: ${overview}</p>
                                    <div class="mt-auto d-flex justify-content-around">
                                        <button data-movieid="${id}" data-movietitle="${title}" data-rating="${rating}" class="edit btn btn-dark">Edit</button>
                                        <button data-movieid="${id}" class="deletion btn btn-dark">Delete</button>
                                    </div>
                              </div>
                              </div>
                            </div>

                        `);
                        promises.push(getPoster(title))
                    }

                    Promise.all(promises)
                        .then(function (movieUrls) {
                            let images = $('img');
                            for (let i = 0; i < movieUrls.length; i++) {
                                images[i].src = movieUrls[i];
                            }
                        })
                        .then(gatherEditDeleteButtons())
                })

                .catch(error => console.error(error))
        }

        //Initial call to populate Main tab
        ourMovies();
        fetch(glitch)
            .then(response => response.json())
            .then(json => console.log(json))

        //---- Add a Movie Tab
        let getSearchPoster = function () {
            let film = $('#term').val();
            // Check for blank entry
            if (film === '') {
                $('#poster').html('<div class="alert"><strong>Oops!</strong> Try adding something into the search field.</div>');
            } else {
                $('#poster').html('<div class="alert"><strong>Loading...</strong></div>');
                // https://imdb-api.com/en/API/SearchMovie/k_lutmd2x6/inception 2010
                $.getJSON(`https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&query=${film}&callback=?`,
                    function (json) {
                        console.log(json.results);
                        //Found Title
                        if (json !== "Nothing found.") {
                            console.log(json.results);
                            //Show user result
                            $('#poster').html(
                                '<div class="card-body">' +
                                '<p class="text-white">You have added: ' +
                                '<strong>' + json.results[0].title + '</strong>' +
                                '</p>' +
                                '</div>' +
                                '<div class="card" style="width: 18rem;">' +
                                '<img class="card-img-top" src=\"http://image.tmdb.org/t/p/w500/' + json.results[0].poster_path + '\" class=\"img-responsive\" alt="movie poster">' +
                                '<div id="${id}" class="card-body">' +
                                '<h3>' + json.results[0].title + '</h3>' +
                                // '<p class="rating fas fa-star">' + 'Rating:' + json.results[0].rating + '</p>' +
                                '<p class="released fas fa-star">' + 'Released:' + json.results[0].release_date + '</i></p>' +
                                // '<p class="director fas fa-star">' + 'Directed by:' + json.results[0].director + '</p>' +
                                // '<p class="genre fas fa-star">' + 'Genre:' + json.results[0].genre + '</p>' +
                                // '<p class="starring fas fa-star">' + "Starring:" + json.results[0] + '</p>' +
                                '<p class="plot fas fa-star">' + "Plot:" + json.results[0].overview + '</p>' +
                                '<div class="d-flex justify-content-around">' +
                                '<button data-movieid="${id}" data-movietitle="${title}" data-rating="${rating}" class="edit btn btn-dark">Edit</button>' +
                                ' <button data-movieid="${id}" class="deletion btn btn-dark">Delete</button>' +
                                '</div>' +
                                '</div>' +
                                '</div>');
                            console.log(json.results);
                            //Show alternate response when title not found
                        } else {
                            $.getJSON(`https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&query=${film}`,
                                function (json) {

                                    $('#poster').html('<div class="alert"><p>We\'re afraid nothing was found for that search.</p></div>' +
                                        '<p>Perhaps you were looking for The Goonies?</p><img alt="movie poster" id="thePoster" src=\"http://image.tmdb.org/t/p/'
                                        + json.results[0].poster_path + '\" class="img-responsive">');
                                });
                        }
                        console.log(json.results[0]);
                        let newMovie = {

                            title: json.results[0].title,
                            // rating: json.results[0].rating,
                            // director: json.results[0].director,
                            released: json.results[0].released,
                            // genre: json.results[0].genre,
                            // starring: json.results[0].actors,
                            plot: json.results[0].plot

                        }

                        function addMovie(newMovie) {
                            return fetch(glitch, {
                                method: "POST",
                                headers: {"Content-Type": "application/json"},
                                body: JSON.stringify(newMovie)
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log(newMovie)
                                    return data;
                                })
                                .catch(console.error);
                        }

                        addMovie(newMovie).then(() => {
                            return fetch(`https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&query=${film}&callback=?`)
                                .then(response => response.json())
                                .then($('#main').empty())
                                .then(getPoster())
                                // .then (ourMovies())
                                .catch(console.error);
                        })


                    });
            }
            return false;
        }

        $('#search').click(function () {
            getSearchPoster()
        });
        $('#term').keyup(function (event) {
            if (event.keyCode === 13) {
                getSearchPoster();

            }
        });// --- End of Add a Movie tab

        //----Edit Movie
        function editCard(movieIdNumber, newTitle, newRating, newReleaseDate, newDirector, newGenre, newActors, newPlot) {
            let editedTitle = newTitle.replace(/\w\S*/g, function (txt)
                // let editedReleaseDate= newReleaseDate.replace(/\w\S*/g, function(txt)
            {
                if (txt.match(/^(e|y|de|lo|los|la|las|do|dos|da|das|del|van|von|bin|le)$/gi)) return txt.toLowerCase();
                else return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
            $(`#${movieIdNumber} h3`).replaceWith(`<h3>${editedTitle}</h3>`);
            $(`#${movieIdNumber} .rating fas fa-star`).replaceWith(`<p>${newRating} <i class="rating fas fa-star"></i></p>`);
            $(`#${movieIdNumber} .released fas fa-star`).replaceWith(`<p>${newReleaseDate} <i class="released fas fa-star"></i></p>`);
            $(`#${movieIdNumber} .director fas fa-star`).replaceWith(`<p>${newDirector} <i class="director fas fa-star"></i></p>`);
            $(`#${movieIdNumber} .genre fas fa-star`).replaceWith(`<p>   ${newGenre} <i class="fas fa-star"></i></p>`);
            $(`#${movieIdNumber} .starring fas fa-star`).replaceWith(`<p>   ${newActors} <i class="fas fa-star"></i></p>`);
            $(`#${movieIdNumber} .plot fas fa-star`).replaceWith(`<p>   ${newPlot} <i class="fas fa-star"></i></p>`);

        }

        function editMovie(movieIdNumber, newTitle, newRating, newReleaseDate, newDirector, newGenre, newActors, newPlot) {
            editCard(movieIdNumber, newTitle, newRating, newReleaseDate, newDirector, newGenre, newActors, newPlot);
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            let raw = JSON.stringify({
                "title": newTitle,
                "rating": newRating,
                "id": movieIdNumber,
                "year": newReleaseDate,
                "director": newDirector,
                "genre": newGenre,
                "actors": newActors,
                "plot": newPlot
            });
            const requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            let targetUrl = glitch + '/' + movieIdNumber;
            return fetch(targetUrl, requestOptions)
        }

        //----Delete Movie
        function deleteMovie(movieIdNumber) {
            const requestOptions = {
                method: 'DELETE',
                redirect: 'follow'
            };
            let targetUrl = glitch + '/' + movieIdNumber;
            // console.log(targetUrl)
            return fetch(targetUrl, requestOptions)
        }

        //---- Gather all of the Edit and Delete buttons
        function gatherEditDeleteButtons() {
            const editButtons = document.querySelectorAll(".edit");
            const deleteButtons = document.querySelectorAll(".deletion")

            // Add listeners to the selected buttons
            editButtons.forEach((editButton, key) => {
                editButton.addEventListener("click", (e) => {
                    let selectedMovie = e.target.dataset['movieid'];
                    // console.log(selectedMovie);
                    let modal = document.getElementById("myModal");
                    $("#new-movie-title").attr("placeholder", e.target.dataset['title']);
                    $("#new-rating").attr("placeholder", e.target.dataset['rating']);
                    $("#new-release-date").attr("placeholder", e.target.dataset['released']);
                    $("#new-director").attr("placeholder", e.target.dataset['director']);
                    $("#new-genre").attr("placeholder", e.target.dataset['genre']);
                    $("#new-actors").attr("placeholder", e.target.dataset['actors']);
                    $("#new-plot").attr("placeholder", e.target.dataset['plot']);
                    modal.style.display = "block";

                    let newTitle = '';
                    let newRating = '';
                    let newReleaseDate = '';
                    let newDirector = '';
                    let newGenre = '';
                    let newActors = '';
                    let newPlot = '';
                    //---- Get newTitle and newRating from Modal window
                    $('#submit').click(function () {
                        newTitle = $('#new-movie-title').val()
                        newReleaseDate = $('#new-release-date').val()
                        newRating = $('#new-rating').val()
                        newDirector = $('#new-director').val()
                        newGenre = $('#new-genre').val()
                        newActors = $('#new-actors').val()
                        newPlot = $('#new-plot').val()
                        // console.log(newTitle, newRating, selectedMovie)
                        modal.style.display = "none"
                        return editMovie(selectedMovie, newTitle, newRating, newReleaseDate, newDirector, newGenre, newActors, newPlot)
                            .then(response => response.json())
                            // .then(console.log)
                            .catch(console.error);
                    })
                })
            });
//
            //---- Close modal window if user clicks "cancel"
            $('#cancel').on("click", (e) => {
                let modal = document.getElementById("myModal");
                modal.style.display = "none";
            })

            deleteButtons.forEach((deleteButton, key) => {
                deleteButton.addEventListener("click", (e) => {
                    let selectedMovie = e.target.dataset['movieid'];
                    // console.log(e.target.dataset);
                    // console.log(selectedMovie);
                    deleteMovie(selectedMovie)
                        .then(response => response.json())

                        .then($('#main').empty())
                        .then(ourMovies())
                        .catch(console.error);

                })

            });

        }

//
        // RENDER FUNCTION
// Take each movie (object) and turn each attribute into HTML Elements for display
        const rendermovies = (movies) => {
            // Empty the HTML String on each call
            let moviesHTML = "";
            // Iterate through each movie
            for (let movie of movies) {
                // Create a new "Movie" Div, with nested divs for each listed attribute
                moviesHTML += '<div class="movie">' +
                    +
                        // EDIT & DELETE BUTTONS
                        // Rendered with the particular movie ID, this allows targeting of the class "edit-btn" or "delete-btn"
                        // for simplified event function, while still allowing *this* particular movie to be targeted to PATCH or DELETE
                        '<button class="edit-btn"  data-id="' + movie.id + '">Edit</button>' +
                    '<button class="delete-btn" data-id="' + movie.id + '">Delete</button>' +
                    // Closing individual "movie" div
                    '</div>'
            }
            // Set the HTML of the target to the given string of elements & data.
            $('#movies').html(moviesHTML);
            // EDIT CLICK FUNCTION
            $('.edit-btn').click(function () {
                populateEdit($(this).data("id"));
            });
            // DELETE CLICK FUNCTION
            $('.delete-btn').click(function () {
                deleteMovie($(this).data("id"));
            });
        }
// SUB-NAVIGATION: FORM CONTROL
// Each Tab toggles its given form, as well as the tab's icon for a left or right arrow.
        $('#search-tab').click(() => {
            $('#search-form').toggleClass('hide');
            $('#search-right').toggleClass('hide');
            $('#search-left').toggleClass('hide');
        });
        $('#add-tab').click(() => {
            $('#add-form').toggleClass('hide');
            $('#add-right').toggleClass('hide');
            $('#add-left').toggleClass('hide');
        });
        $('#edit-tab').click(() => {
            $('#edit-form').toggleClass('hide');
            $('#edit-right').toggleClass('hide');
            $('#edit-left').toggleClass('hide');
        });
// FORM SUBMISSION: ADD FUNCTION
// On click of "Add" Button, will create a new movie object from the return of the OMDB API
// and send the new object to the createMovie() function, which posts it to our db
//         $('#add-movie').click(function (e) {
//             e.preventDefault();
//             // Takes the form values of the title and rating
//             let title = $('#add-title').val();
//             let rating = $('#add-rating').val();
        // GET Request from the OMDB API searching by our input title
        // fetch(`${OMDB_URL}?t=${(title).toLowerCase()}&apikey=${OMDB_API}`)
        //     .then(resp => resp.json())
        //     .then(data => {
        //         // Parsing through the returned attributes to match them to our Movie database attributes
        //         let title = data.Title;
        //         let year = data.Year;
        //         let director = data.Director;
        //         let poster = data.Poster;
        //         let plot = data.Plot;
        //         let genre = data.Genre;
        //         let actors = data.Actors;
        //         // Creating a new movie object with the desired attributes
        //         let newMovie = {title, poster, rating, year, director, genre, actors, plot};
        //
        //         // calling the POST function with the new movie
        //         function addMovie(newMovie){}
        //
        //     )
//                 .catch(err => console.error(err));
// //         });

        //---- Loading Animation

        $(window).load(function () {
            setTimeout(function () {
                $('.preloader').fadeOut('slow');
            }, 3000);
        });
    })
}
;


// research patch vs put





