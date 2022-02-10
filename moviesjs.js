"use strict";
(() => {
// Target URL for Glitch
    const URL = "https://ancient-juicy-balloon.glitch.me/movies";
// OMDB URL
    const OMDB_URL = "http://www.omdbapi.com/";

// FETCH REQUEST
// Get the array of movie objects and send to the render function
    const getmovies = () => {
        return fetch(URL)
            .then(resp => resp.json())
            .then(data => {
                rendermovies(data);
                console.log(data);
            })
            .catch(err => console.error(err));
    }
// Initial Fetch Request that retreives the data and renders it is Delayed in order to show off our loading animation
// This setTimeout is instructor approved without tears
    setTimeout(getmovies, 4000);

// RENDER FUNCTION
// Take each movie (object) and turn each attribute into HTML Elements for display
    const rendermovies = (movies) => {
        // Empty the HTML String on each call
        let moviesHTML = "";
        // Iterate through each movie
        for (let movie of movies) {
            // Create a new "Movie" Div, with nested divs for each listed attribute
            moviesHTML += '<div class="movie">' +
                '<div class="title">' + movie.title + '</div>' +
                '<img class="poster" src="' + movie.poster + '" alt="a movie poster">' +
                '<div class="year"> Released: ' + movie.year + '</div>' +
                '<div class="director"> Directed by ' + movie.director + '</div>' +
                '<div class="rating"> Rating: ' + movie.rating + '</div>' +
                '<div class="genre"> Genre: ' + movie.genre + '</div>' +
                '<div class="actors"> Starring: ' + movie.actors + '</div>' +
                '<div class="plot">' + movie.plot + '</div>' +
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
    $('#add-movie').click(function (e) {
        e.preventDefault();
        // Takes the form values of the title and rating
        let title = $('#add-title').val();
        let rating = $('#add-rating').val();
        console.log(title)
        // GET Request from the OMDB API searching by our input title
        fetch(`http://www.omdbapi.com/?i=${title}&apikey=`)
            .then(resp => resp.json())
            .then(data => {
                // Parsing through the returned attributes to match them to our Movie database attributes
                console.log(data);

                let title = data.Title;
                let year = data.Year;
                let director = data.Director;
                let poster = data.Poster;
                let plot = data.Plot;
                let genre = data.Genre;
                let actors = data.Actors;
                // Creating a new movie object with the desired attributes
                let newMovie = {title, poster, rating, year, director, genre, actors, plot};
                // calling the POST function with the new movie
                createMovie(newMovie);
            })
            .catch(err => console.error(err));
    });
// FORM POPULATE: EDIT FUNCTION
// Takes the movie ID from an edit-button and populates the edit form with the current data for that movie
    const populateEdit = (movieID) => {
        // First, get the information for that movie ID
        fetch(`${URL}/${movieID}`)
            .then(resp => resp.json())
            // Take the movie attributes and set the values within the edit form to match the value of each attribute
            .then(movie => {
                $('#edit-title').val(movie.title);
                $('#edit-release').val(movie.year);
                $('#edit-director').val(movie.director);
                $('#edit-rating').val(movie.rating);
                $('#edit-actors').val(movie.actors);
                $('#edit-genre').val(movie.genre);
                $('#edit-plot').val(movie.plot);
                $('#movie-id').val(movieID);
            })
            .catch(err => console.error(err));
    }
// FORM SUBMISSION: EDIT FUNCTION
// On click of "Apply" Button, will create an object with the inputs on the edit form and send to the editMovie() function
    $('#edit-apply').click(function (e) {
        e.preventDefault();
        let title = $('#edit-title').val();
        let rating = $('#edit-rating').val();
        let year = $('#edit-release').val();
        let director = $('#edit-director').val();
        let actors = $('#edit-actors').val();
        let genre = $('#edit-genre').val();
        let plot = $('#edit-plot').val();
        let id = $('#movie-id').val();
        let editedMovie = {id, title, rating, year, genre, director, actors, plot};
        console.log(editedMovie);
        editMovie(editedMovie);
    });
// POST REQUEST
// Takes in the new movie and uses POST to add it to the JSON file
    const createMovie = (movie) => {
        let options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(movie)
        }
        // after posting, getMovies is called again to update the list
        fetch(URL, options).then(resp => resp.json()).then(getmovies).catch(err => console.error(err));
    }
// PATCH REQUEST
// Takes the movie from the Edit Form and uses PATCH to change the values of it's attributes in the JSON file
    const editMovie = (movie) => {
        let options = {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(movie)
        }
        return fetch(`${URL}/${movie.id}`, options).then(resp => resp.json()).then(getmovies).catch(err => console.error(err));
    }
// DELETE REQUEST
// Takes the movie ID from a delete-button and uses DELETE to to remove it from the JSON file
    const deleteMovie = (movieID) => {
        let options = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        }
        return fetch(`${URL}/${movieID}`, options).then(getmovies).catch(err => console.error(err));
    }
})();

