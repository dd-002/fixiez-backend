import  axios from 'axios'

// Use environment variables for your key!
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 1. Endpoint for Autocomplete Suggestions
const autocomplete = async (req, res) => {
  try {
    const { input } = req.query;
    
    // Using Google Places New API
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:autocomplete',
      { input: input },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
        }
      }
    );


    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

// 2. Endpoint to convert Place ID to Lat/Lng (Geocoding)
const geocode = async (req, res) => {
  try {
    const { placeId } = req.query;
    
    // Fetching location (lat/lng) and displayName
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        params: {
          fields: 'location,displayName',
          key: GOOGLE_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
};

export {
    autocomplete,
    geocode
}