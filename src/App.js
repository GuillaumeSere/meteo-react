import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import Search from './components/search/search';
import CurrentWeather from './components/current-weather/current-weather';
import Forecast from './components/forecast/forecast';
import { WEATHER_API_URL, WEATHER_API_KEY } from './api';

const FAVORITES_STORAGE_KEY = 'meteo-react-favorite-cities';

const FEATURED_CITIES = [
  { name: 'Tokyo', country: 'Japon', value: '35.6762 139.6503', tone: '#f4c430' },
  { name: 'Delhi', country: 'Inde', value: '28.6139 77.2090', tone: '#ff7a59' },
  { name: 'Shanghai', country: 'Chine', value: '31.2304 121.4737', tone: '#6fd6ff' },
  { name: 'Sao Paulo', country: 'Bresil', value: '-23.5505 -46.6333', tone: '#57d68d' },
  { name: 'Mexico', country: 'Mexique', value: '19.4326 -99.1332', tone: '#f06ea9' },
  { name: 'Le Caire', country: 'Egypte', value: '30.0444 31.2357', tone: '#e8b15a' },
  { name: 'New York', country: 'Etats-Unis', value: '40.7128 -74.0060', tone: '#78a6ff' },
  { name: 'Paris', country: 'France', value: '48.8566 2.3522', tone: '#c8ff7a' },
];

const parseCoords = (value) => {
  const [lat, lon] = value.split(' ');
  return { lat, lon };
};

const getCityLabel = (location) => {
  if (location.label) {
    return location.label;
  }

  return `${location.name}, ${location.country}`;
};

const normalizeLocation = (location) => {
  const label = getCityLabel(location);
  const [name, fallbackCountry] = label.split(', ');

  return {
    id: location.value,
    label,
    name: location.name || name,
    country: location.country || fallbackCountry || 'Ville favorite',
    value: location.value,
    tone: location.tone || '#f4c430',
  };
};

const getStoredFavorites = () => {
  try {
    const storedFavorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY));
    return Array.isArray(storedFavorites) ? storedFavorites : [];
  } catch (error) {
    return [];
  }
};

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [activeCity, setActiveCity] = useState(normalizeLocation(FEATURED_CITIES[7]));
  const [favorites, setFavorites] = useState(getStoredFavorites);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const apiReady = useMemo(() => Boolean(WEATHER_API_KEY), []);
  const activeCityIsFavorite = useMemo(() => (
    Boolean(activeCity && favorites.some((favorite) => favorite.id === activeCity.id))
  ), [activeCity, favorites]);

  const fetchWeatherForLocation = useCallback(async (location) => {
    if (!WEATHER_API_KEY) {
      setError('Ajoute REACT_APP_OPENWEATHER_API_KEY dans ton fichier .env pour afficher la meteo.');
      return;
    }

    const normalizedLocation = normalizeLocation(location);
    const { lat, lon } = parseCoords(normalizedLocation.value);

    setIsLoading(true);
    setError('');
    setActiveCity(normalizedLocation);

    try {
      const query = `lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`;
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`${WEATHER_API_URL}/weather?${query}`),
        fetch(`${WEATHER_API_URL}/forecast?${query}`),
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Impossible de recuperer les donnees meteo pour cette ville.');
      }

      const weatherResponse = await currentResponse.json();
      const forecastResponseData = await forecastResponse.json();

      setCurrentWeather({ city: normalizedLocation.label, ...weatherResponse });
      setForecast({ city: normalizedLocation.label, ...forecastResponseData });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherForLocation(FEATURED_CITIES[7]);
  }, [fetchWeatherForLocation]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const handleSearchChange = (searchData) => {
    fetchWeatherForLocation(searchData);
  };

  const toggleFavorite = () => {
    if (!activeCity) {
      return;
    }

    setFavorites((currentFavorites) => {
      const alreadySaved = currentFavorites.some((favorite) => favorite.id === activeCity.id);

      if (alreadySaved) {
        return currentFavorites.filter((favorite) => favorite.id !== activeCity.id);
      }

      return [activeCity, ...currentFavorites];
    });
  };

  const removeFavorite = (cityId) => {
    setFavorites((currentFavorites) => currentFavorites.filter((favorite) => favorite.id !== cityId));
  };

  const currentYear = new Date().getFullYear();

  return (
    <main className="weather-app">
      <section className="command-panel" aria-label="Recherche meteo">
        <div className="brand-block">
          <div>
            <p className="overline">Climatlas live</p>
            <h1>Grandes villes, ciel en direct</h1>
          </div>
        </div>

        <div className="search-zone">
          <Search onSearchChange={handleSearchChange} isDisabled={!apiReady} />
          <p className="helper-text">Recherche une ville ou explore les metropoles les plus peuplees.</p>
        </div>
      </section>

      <section className="featured-cities" aria-label="Grandes villes mises en avant">
        {FEATURED_CITIES.map((city) => {
          const isActive = activeCity?.value === city.value;

          return (
            <button
              className={`city-chip ${isActive ? 'is-active' : ''}`}
              key={city.name}
              onClick={() => fetchWeatherForLocation(city)}
              style={{ '--city-tone': city.tone }}
              type="button"
            >
              <span>{city.name}</span>
              <small>{city.country}</small>
            </button>
          );
        })}
      </section>

      <section className="favorites-panel" aria-label="Villes favorites">
        <div className="favorites-heading">
          <div>
            <p className="overline">Favoris</p>
            <h2>Ton radar perso</h2>
          </div>

          <button
            className={`favorite-action ${activeCityIsFavorite ? 'is-saved' : ''}`}
            disabled={!activeCity}
            onClick={toggleFavorite}
            type="button"
          >
            {activeCityIsFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          </button>
        </div>

        {favorites.length > 0 ? (
          <div className="favorites-list">
            {favorites.map((city) => (
              <article className="favorite-card" key={city.id}>
                <button
                  className="favorite-open"
                  onClick={() => fetchWeatherForLocation(city)}
                  type="button"
                >
                  <span>{city.name}</span>
                  <small>{city.country}</small>
                </button>
                <button
                  aria-label={`Retirer ${city.name} des favoris`}
                  className="favorite-remove"
                  onClick={() => removeFavorite(city.id)}
                  type="button"
                >
                  Retirer
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="favorites-empty">Aucune ville favorite pour le moment. Ouvre une ville, puis ajoute-la ici.</p>
        )}
      </section>

      {error && <div className="status-message" role="alert">{error}</div>}

      {isLoading && !currentWeather && (
        <div className="loading-panel" aria-live="polite">
          <span className="loading-pulse" />
          Connexion aux satellites meteo...
        </div>
      )}

      {currentWeather && (
        <section className="dashboard-section" aria-label="Tableau meteo">
          <div className="dashboard-heading">
            <div>
              <p className="overline">Observation active</p>
              <h2>{activeCity?.label || currentWeather.city}</h2>
            </div>
            <span className="live-pill">Live</span>
          </div>

          <div className={`dashboard-grid ${isLoading ? 'is-refreshing' : ''}`} aria-busy={isLoading}>
            <CurrentWeather data={currentWeather} />
            {forecast && <Forecast data={forecast} />}
          </div>
        </section>
      )}

      <footer className="site-footer">
        <span>Climatlas</span>
        <p>Copyright {currentYear} - Guillaume SERE. Tous droits reserves.</p>
      </footer>
    </main>
  );
}

export default App;
