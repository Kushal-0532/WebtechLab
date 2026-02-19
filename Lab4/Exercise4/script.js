/**
 * Weather Dashboard - AJAX Weather Information
 * Lab 4 - Exercise 4
 * Uses OpenWeather API to fetch live weather data
 */

// ============================================
// CONFIGURATION
// ============================================

// OpenWeather API Configuration
// Get your free API key at: https://openweathermap.org/api
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeather API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ============================================
// STATE MANAGEMENT
// ============================================

// Cache storage for last searched city
let cachedWeatherData = null;
let lastSearchedCity = '';

// ============================================
// DOM ELEMENTS
// ============================================

const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const loadingEl = document.getElementById('loading');
const errorMessageEl = document.getElementById('error-message');
const errorTextEl = document.getElementById('error-text');
const retryBtn = document.getElementById('retry-btn');
const weatherCard = document.getElementById('weather-card');
const initialState = document.getElementById('initial-state');
const cachedInfoEl = document.getElementById('cached-info');

// Weather display elements
const weatherIcon = document.getElementById('weather-icon');
const weatherCondition = document.getElementById('weather-condition');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feels-like');
const cityName = document.getElementById('city-name');
const country = document.getElementById('country');
const dateTime = document.getElementById('date-time');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkApiKey();
  loadCachedData();
});

function setupEventListeners() {
  searchForm.addEventListener('submit', handleSearch);
  retryBtn.addEventListener('click', () => {
    if (lastSearchedCity) {
      fetchWeather(lastSearchedCity);
    }
  });
}

function checkApiKey() {
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️ Please replace API_KEY with your OpenWeather API key');
    console.info('Get your free API key at: https://openweathermap.org/api');
  }
}

function loadCachedData() {
  // Check if there's cached data from previous session (using sessionStorage)
  const cached = sessionStorage.getItem('weatherCache');
  if (cached) {
    const data = JSON.parse(cached);
    cachedWeatherData = data.weatherData;
    lastSearchedCity = data.city;
    updateCacheInfo();
  }
}

// ============================================
// SEARCH HANDLER
// ============================================

async function handleSearch(e) {
  e.preventDefault();
  
  const city = cityInput.value.trim();
  
  if (!city) {
    showError('Please enter a city name');
    return;
  }

  // Check if searching for same city and cache exists
  if (city.toLowerCase() === lastSearchedCity.toLowerCase() && cachedWeatherData) {
    displayWeather(cachedWeatherData);
    updateCacheInfo('Showing cached result');
    return;
  }

  await fetchWeather(city);
}

// ============================================
// AJAX REQUEST - FETCH API IMPLEMENTATION
// ============================================

async function fetchWeather(city) {
  // Show loading state
  showLoading(true);
  hideError();
  hideWeatherCard();
  hideInitialState();

  try {
    // Build URL with query parameters
    const url = buildApiUrl(city);
    
    // Make AJAX GET request using Fetch API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Handle HTTP status codes
    if (!response.ok) {
      await handleHttpError(response);
      return;
    }

    // Parse JSON response
    const data = await response.json();

    // Cache the result
    cacheWeatherData(city, data);

    // Display weather data
    displayWeather(data);
    updateCacheInfo();

  } catch (error) {
    handleError(error);
  } finally {
    showLoading(false);
  }
}

/**
 * Build API URL with query parameters
 */
function buildApiUrl(city) {
  const params = new URLSearchParams({
    q: city,           // City name
    appid: API_KEY,    // API key
    units: 'metric'    // Temperature in Celsius
  });

  return `${API_BASE_URL}?${params.toString()}`;
}

/**
 * Handle HTTP error responses
 */
async function handleHttpError(response) {
  showLoading(false);

  switch (response.status) {
    case 401:
      showError('Invalid API key. Please check your OpenWeather API key.');
      console.error('401 Unauthorized: Invalid API key');
      break;
    
    case 404:
      showError('City not found. Please check the city name and try again.');
      console.error('404 Not Found: City not found');
      break;
    
    case 429:
      showError('Too many requests. Please wait a moment and try again.');
      console.error('429 Too Many Requests: Rate limit exceeded');
      break;
    
    case 500:
      showError('Server error. Please try again later.');
      console.error('500 Internal Server Error');
      break;
    
    case 502:
    case 503:
    case 504:
      showError('Service temporarily unavailable. Please try again later.');
      console.error(`${response.status}: Service unavailable`);
      break;
    
    default:
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || 'An unexpected error occurred';
      showError(message);
      console.error(`HTTP ${response.status}: ${message}`);
  }
}

/**
 * Handle general errors (network, parsing, etc.)
 */
function handleError(error) {
  showLoading(false);

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    showError('Network error. Please check your internet connection.');
    console.error('Network Error:', error);
  } else if (error.name === 'SyntaxError') {
    showError('Error parsing response data.');
    console.error('JSON Parse Error:', error);
  } else {
    showError(error.message || 'An unexpected error occurred');
    console.error('Error:', error);
  }
}

// ============================================
// CACHE MANAGEMENT
// ============================================

function cacheWeatherData(city, data) {
  cachedWeatherData = data;
  lastSearchedCity = city;

  // Store in sessionStorage for persistence
  sessionStorage.setItem('weatherCache', JSON.stringify({
    city: city,
    weatherData: data,
    timestamp: Date.now()
  }));
}

function updateCacheInfo(customMessage = null) {
  if (customMessage) {
    cachedInfoEl.textContent = customMessage;
  } else if (lastSearchedCity) {
    cachedInfoEl.textContent = `Last searched: ${lastSearchedCity}`;
  } else {
    cachedInfoEl.textContent = '';
  }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displayWeather(data) {
  // Parse weather data from API response
  const weather = {
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    visibility: data.visibility,
    condition: data.weather[0].main,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    city: data.name,
    country: data.sys.country,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timezone: data.timezone
  };

  // Update UI elements
  weatherIcon.src = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;
  weatherIcon.alt = weather.description;
  weatherCondition.textContent = weather.description;
  temperature.textContent = `${weather.temp}°C`;
  feelsLike.textContent = `Feels like ${weather.feelsLike}°C`;
  cityName.textContent = weather.city;
  country.textContent = getCountryName(weather.country);
  dateTime.textContent = formatDateTime(weather.timezone);
  humidity.textContent = `${weather.humidity}%`;
  windSpeed.textContent = `${weather.windSpeed} m/s`;
  visibility.textContent = `${(weather.visibility / 1000).toFixed(1)} km`;
  pressure.textContent = `${weather.pressure} hPa`;
  sunrise.textContent = formatTime(weather.sunrise, weather.timezone);
  sunset.textContent = formatTime(weather.sunset, weather.timezone);

  // Show weather card
  showWeatherCard();
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

function showLoading(show) {
  loadingEl.style.display = show ? 'flex' : 'none';
}

function showError(message) {
  errorTextEl.textContent = message;
  errorMessageEl.style.display = 'flex';
  hideWeatherCard();
  hideInitialState();
}

function hideError() {
  errorMessageEl.style.display = 'none';
}

function showWeatherCard() {
  weatherCard.style.display = 'block';
  hideError();
  hideInitialState();
}

function hideWeatherCard() {
  weatherCard.style.display = 'none';
}

function hideInitialState() {
  initialState.style.display = 'none';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format Unix timestamp to local time
 */
function formatTime(unixTimestamp, timezone) {
  const date = new Date((unixTimestamp + timezone) * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });
}

/**
 * Format current date and time with timezone offset
 */
function formatDateTime(timezone) {
  const now = new Date();
  const localTime = new Date(now.getTime() + (timezone * 1000) + (now.getTimezoneOffset() * 60000));
  
  return localTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get country name from country code
 */
function getCountryName(code) {
  const countries = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'IN': 'India',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CN': 'China',
    'BR': 'Brazil',
    'NP': 'Nepal',
    'RU': 'Russia',
    'IT': 'Italy',
    'ES': 'Spain',
    'MX': 'Mexico',
    'KR': 'South Korea',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PL': 'Poland',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'BE': 'Belgium',
    'NZ': 'New Zealand',
    'SG': 'Singapore',
    'AE': 'United Arab Emirates',
    'ZA': 'South Africa',
    'EG': 'Egypt'
  };

  return countries[code] || code;
}

// ============================================
// ALTERNATIVE: XMLHttpRequest Implementation
// ============================================

/**
 * Fetch weather using XMLHttpRequest (alternative to Fetch API)
 * Uncomment to use XMLHttpRequest instead
 */
/*
function fetchWeatherXHR(city) {
  showLoading(true);
  hideError();
  hideWeatherCard();
  hideInitialState();

  const url = buildApiUrl(city);
  const xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.timeout = 10000; // 10 second timeout

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      showLoading(false);

      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          cacheWeatherData(city, data);
          displayWeather(data);
          updateCacheInfo();
        } catch (e) {
          showError('Error parsing weather data');
          console.error('JSON Parse Error:', e);
        }
      } else if (xhr.status === 404) {
        showError('City not found. Please check the city name and try again.');
      } else if (xhr.status === 401) {
        showError('Invalid API key. Please check your OpenWeather API key.');
      } else if (xhr.status === 500) {
        showError('Server error. Please try again later.');
      } else if (xhr.status === 0) {
        showError('Network error. Please check your internet connection.');
      } else {
        showError(`Error: ${xhr.status} - ${xhr.statusText}`);
      }
    }
  };

  xhr.ontimeout = function() {
    showLoading(false);
    showError('Request timed out. Please try again.');
  };

  xhr.onerror = function() {
    showLoading(false);
    showError('Network error. Please check your internet connection.');
  };

  xhr.send();
}
*/
