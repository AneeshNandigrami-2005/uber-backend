const axios = require("axios");
const captainModel = require("../models/captain.model");

const apiKey = process.env.ORS_API_KEY;

// -----------------------------
// Get coordinates from address
// -----------------------------
async function getAddressCoordinate(address) {
  const response = await axios.get(
    "https://api.openrouteservice.org/geocode/search",
    {
      params: {
        api_key: apiKey,
        text: address,
      },
    }
  );

  const coords = response.data.features[0].geometry.coordinates;

  return {
    lng: coords[0],
    lat: coords[1],
  };
}

// -----------------------------
// Distance + time
// -----------------------------
async function getDistanceTime(origin, destination) {
  const start = await getAddressCoordinate(origin);
  const end = await getAddressCoordinate(destination);

  const response = await axios.post(
    "https://api.openrouteservice.org/v2/directions/driving-car",
    {
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
    },
    {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
    }
  );

  const summary = response.data.routes[0].summary;

  return {
    distance: {
      text: `${(summary.distance / 1000).toFixed(2)} km`,
      value: summary.distance,
    },
    duration: {
      text: `${Math.round(summary.duration / 60)} mins`,
      value: summary.duration,
    },
  };
}

// -----------------------------
// Autocomplete suggestions
// -----------------------------
async function getAutoCompleteSuggestions(input) {
  const response = await axios.get(
    "https://api.openrouteservice.org/geocode/autocomplete",
    {
      params: {
        api_key: apiKey,
        text: input,
        size: 10,
      },
    }
  );

  return response.data.features.map((place) => ({
    name: place.properties.label,
    coordinates: {
      lng: place.geometry.coordinates[0],
      lat: place.geometry.coordinates[1],
    },
  }));
}

// -----------------------------
// Calculate distance between coords (Haversine formula)
// -----------------------------
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// -----------------------------
// Find captains in radius (simple calculation)
// -----------------------------
async function getCaptainsInTheRadius(lng, lat, radiusInKm) {
  const captains = await captainModel.find({
    location: {
      $exists: true,
    },
  });

  return captains.filter((captain) => {
    if (!captain.location || captain.location.lat === undefined || captain.location.lng === undefined) {
      return false;
    }
    const distance = calculateDistance(
      lat,
      lng,
      captain.location.lat,
      captain.location.lng
    );
    return distance <= radiusInKm;
  });
}

// -----------------------------
// EXPORTS
// -----------------------------
module.exports = {
  getAddressCoordinate,
  getDistanceTime,
  getAutoCompleteSuggestions,
  getCaptainsInTheRadius,
};