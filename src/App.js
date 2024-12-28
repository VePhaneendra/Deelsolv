import React, { useState, useEffect } from 'react';
import './App.css';

const PokemonApp = () => {
  const [pokemonData, setPokemonData] = useState([]); // State to store Pokémon list
  const [searchQuery, setSearchQuery] = useState(''); // State to store search input
  const [selectedPokemon, setSelectedPokemon] = useState(null); // State to store details of selected Pokémon
  const [favorites, setFavorites] = useState([]); // State to store favorites
  const [types, setTypes] = useState([]); // State to store available Pokémon types
  const [selectedType, setSelectedType] = useState(''); // State to store selected Pokémon type for filtering

  // Fetch the initial list of Pokémon and types from the API
  useEffect(() => {
    const fetchPokemonData = async () => {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100');
      const data = await response.json();
      const pokemonDetails = await Promise.all(data.results.map(async (pokemon) => {
        const detailRes = await fetch(pokemon.url);
        const detailData = await detailRes.json();
        return {
          name: detailData.name,
          id: detailData.id,
          url: pokemon.url,
        };
      }));
      setPokemonData(pokemonDetails);
    };

    const fetchPokemonTypes = async () => {
      const response = await fetch('https://pokeapi.co/api/v2/type');
      const data = await response.json();
      setTypes(data.results); // Store available Pokémon types
    };

    fetchPokemonData();
    fetchPokemonTypes();

    // Load favorites from localStorage on component mount
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  // Handle search input change
  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Fetch details of the selected Pokémon (including types, abilities, and stats)
  const handleSelectPokemon = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    setSelectedPokemon(data);
  };

  // Toggle Pokémon as favorite and save to localStorage
  const handleFavoriteToggle = (pokemon) => {
    let updatedFavorites = [...favorites];
    const existingIndex = updatedFavorites.findIndex(fav => fav.name === pokemon.name);
    if (existingIndex === -1) {
      updatedFavorites.push(pokemon); // Add to favorites
    } else {
      updatedFavorites.splice(existingIndex, 1); // Remove from favorites
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save to localStorage
  };

  // Filter Pokémon based on search query and type
  const filteredPokemon = pokemonData.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchQuery) &&
    (selectedType ? pokemon.url.includes(selectedType) : true) // Filter by type if selected
  );

  return (
    <div className="App">
      <h1>Pokédex</h1>
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search Pokémon"
        onChange={handleSearch}
      />

      {/* Filter by Type */}
      <select onChange={(e) => setSelectedType(e.target.value)} value={selectedType}>
        <option value="">All Types</option>
        {types.map(type => (
          <option key={type.name} value={type.url}>{type.name}</option>
        ))}
      </select>

      {/* Pokémon List */}
      <div className="pokemon-list">
        {filteredPokemon.map(pokemon => (
          <div
            className="pokemon-item"
            key={pokemon.name}
            onClick={() => handleSelectPokemon(pokemon.url)}
          >
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
              alt={pokemon.name}
            />
            <h3>{pokemon.name}</h3>
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent the card from being clicked
                handleFavoriteToggle(pokemon);
              }}
            >
              {favorites.some(fav => fav.name === pokemon.name) ? 'Unfavorite' : 'Favorite'}
            </button>
          </div>
        ))}
      </div>

      {/* Show selected Pokémon details */}
      {selectedPokemon && (
        <div className="pokemon-details">
          <h2>{selectedPokemon.name}</h2>
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`}
            alt={selectedPokemon.name}
          />
          <h3>Types:</h3>
          <ul>
            {selectedPokemon.types.map(type => (
              <li key={type.type.name}>{type.type.name}</li>
            ))}
          </ul>
          <h3>Abilities:</h3>
          <ul>
            {selectedPokemon.abilities.map(ability => (
              <li key={ability.ability.name}>{ability.ability.name}</li>
            ))}
          </ul>
          <h3>Stats:</h3>
          <ul>
            {selectedPokemon.stats.map(stat => (
              <li key={stat.stat.name}>{stat.stat.name}: {stat.base_stat}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Favorite Pokémon List */}
      <div className="favorite-pokemon">
        <h2>Your Favorite Pokémon</h2>
        {favorites.length === 0 ? (
          <p>No favorite Pokémon yet!</p>
        ) : (
          <div className="pokemon-list">
            {favorites.map(pokemon => (
              <div
                className="pokemon-item"
                key={pokemon.name}
                onClick={() => handleSelectPokemon(pokemon.url)}
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  alt={pokemon.name}
                />
                <h3>{pokemon.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonApp;
