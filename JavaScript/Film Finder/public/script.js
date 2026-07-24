const tmdbKey = { // Task 1, key added with common headers required for access
    method: 'GET',
    headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NDc2Y2FhZDYzOWZjMmM0ODE0NmNiZWUzZGJlMDlkNiIsIm5iZiI6MTc4NDYwNjIxOS4zMiwic3ViIjoiNmE1ZWVlMGIyYTJkZGVmOWI3OTIyN2EwIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.kASCxt1Ipvn1SHoXnsqlPu6XMNfqJTLF7TZf5ahs4zg'
  }};
const tmdbBaseUrl = 'https://api.themoviedb.org/3/'; // Task 2
const playBtn = document.getElementById('playBtn');

const getGenres = async () => { // Task 6
  const genreRequestEndpoint = 'genre/movie/list?language=en'; // Task 3
  const requestParams = tmdbKey; //  Task 4, set to tmdbKey since query string functionality is not supported by the API presently
  const urlToFetch = tmdbBaseUrl+genreRequestEndpoint; // Task 5 except requestParams due to changed API functionality

  try { // Task 7
    const response = await fetch(urlToFetch, requestParams); // Task 8
    if(response.ok) { // Task 9
      const jsonResponse = await response.json(); // Task 10
      console.log(jsonResponse); // Task 11 log the variable steps for debugging and assign genres
      const genres = jsonResponse.genres; 
      console.log(genres); 
      return genres; // Task 12
    }
  } catch(error) {
    console.log(error);
  }
};

const getMovies = async () => { // Task 15 part a
  const selectedGenre = getSelectedGenre();
  const discoverMovieEndpoint = `discover/movie?include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc`; // Task 13
  const requestParams = tmdbKey; //  Task 14, set requestParams to tmdbKey and adjust urlToFetch accordingly. 
  const urlToFetch = tmdbBaseUrl+discoverMovieEndpoint+'&with_genres='+selectedGenre;
  
  try { // Task 15 part b
    const response = await fetch(urlToFetch, requestParams);
    if(response.ok) { // Task 16 part a
      const jsonResponse = await response.json(); // Task 16 part b
      console.log(jsonResponse); // Task 16 part c
      const randomPage = Math.floor(Math.random() * jsonResponse.total_pages); // Task 28 bullet 3
      jsonResponse.page = randomPage; // Task 28 bullet 3
      const movies = jsonResponse.results; // Task 17 part a
      console.log(movies); // Task 17 part b
      return movies; // Task 17 part c
    }
  } catch(error) {
    console.log(error);
  }
};

//getMovies(); // Task 16 part d and Task 17 part d

const getMovieInfo = async (movie) => { // Task 18 part a and Task 21 part a
  const movieId = movie.id; // Task 18 part b
  const movieEndpoint = `movie/${movieId}?language=en-US`; // Task 19
  const requestParams = tmdbKey; // Task 20 , set requestParams to tmdbKey and adjust urlToFetch accordingly. 
  const urlToFetch = `${tmdbBaseUrl}${movieEndpoint}`;
  
  try { // Task 21 part b
    const response = await fetch(urlToFetch, requestParams);
    if(response.ok) { // Task 22 part a
      const movieInfo = await response.json(); // Task 22 part b
      return movieInfo; // Task 23
    }
  } catch(error) { // Task 21 part c
    console.log(error);
  }
};

// Gets a list of movies and ultimately displays the info of a random movie from the list
const showRandomMovie = async () => { // Task 24 part a
  const movieInfo = document.getElementById('movieInfo');
  if (movieInfo.childNodes.length > 0) {
    clearCurrentMovie();
  };
  const movies = await getMovies(); // Task 24 part b
  const randomMovie = getRandomMovie(movies); // Task 25
  const info = await getMovieInfo(randomMovie); // Task 26
  displayMovie(info); // Task 27
};

const showRatings = async () => { // Task 28 part b
  const likeRatings = document.getElementById('likedMovies');
  const dislikeRatings = document.getElementById('dislikedMovies');
  if (likeRatings.childNodes.length > 0 || dislikeRatings.childNodes.length > 0) {
    likeRatings.innerHTML = '';
    dislikeRatings.innerHTML = '';
  };
  likeRatings.innerHTML = `Liked Movies: ${likedMoviesTitles}`;
  dislikeRatings.innerHTML = `Disliked Movies: ${dislikedMoviesTitles}`;
};

getGenres().then(populateGenreDropdown);
playBtn.onclick = showRandomMovie;
displayRatingsBtn.onclick = showRatings;