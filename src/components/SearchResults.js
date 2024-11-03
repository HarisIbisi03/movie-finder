import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const query = searchParams.get("query");
  const [savedMovies, setSavedMovies] = useState([]);

  const API_KEY = process.env.REACT_APP_TMDB_KEY;
  const API_URL = "https://api.themoviedb.org/3";

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/search/movie`, {
          params: {
            api_key: API_KEY,
            query: query,
          },
        });
        setSearchResults(response.data.results);
      } catch (error) {
        console.error("Error searching movies:", error);
        setSearchResults([]);
      }
      setIsLoading(false);
    };

    const loadSavedMovies = () => {
      const savedMovies = JSON.parse(localStorage.getItem("saved")) || [];
      setSavedMovies(savedMovies);
    };

    loadSavedMovies();
    if (query) {
      fetchSearchResults();
    }
  }, [query, API_KEY]);

  const saveMovie = (movie) => {
    const existingSavedMovies = JSON.parse(localStorage.getItem("saved")) || [];
    const isAlreadySaved = existingSavedMovies.some(
      (savedMovie) => savedMovie.id === movie.id
    );

    if (!isAlreadySaved) {
      const updateSavedMovies = [...existingSavedMovies, movie];
      localStorage.setItem("saved", JSON.stringify(updateSavedMovies));
      alert(`${movie.title} has been added to your list!`);
      setSavedMovies(updateSavedMovies);
    } else {
      const updatedSavedMovies = existingSavedMovies.filter(
        (savedMovie) => savedMovie.id !== movie.id
      );
      localStorage.setItem("saved", JSON.stringify(updatedSavedMovies));
      alert(`${movie.title} has been removed from your list!`);
      setSavedMovies(updatedSavedMovies);
    }
  };

  const isMovieSaved = (movieId) => {
    return savedMovies.some((movie) => movie.id === movieId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="search-results-page">
      <h2>Search Results for "{query}"</h2>
      <div className="movie-grid">
        {searchResults.length > 0 ? (
          searchResults.map((movie) => (
            <div>
              <Link
                to={`/movie/${movie.id}`}
                key={movie.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="movie-card">
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "path-to-placeholder-image"
                    }
                    alt={movie.title}
                  />
                  <h3>{movie.title}</h3>
                  <p>{movie.release_date}</p>
                </div>
              </Link>
              <button
                className="save-movie-button"
                onClick={(e) => {
                  e.stopPropagation();
                  saveMovie(movie);
                }}
              >
                {isMovieSaved(movie.id) ? "Remove from List" : "Save to List"}
              </button>
            </div>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
