const { validationResult } = require("express-validator");
const mapsService = require("../Services/maps.service");

// Get coordinates
module.exports.getCoordinates = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { address } = req.query;

  try {
    const coordinates =
      await mapsService.getAddressCoordinate(address);

    res.status(200).json(coordinates);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get distance + time
module.exports.getDistanceTime = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array(),
      });
    }

    const { origin, destination } = req.query;

    const distanceTime =
      await mapsService.getDistanceTime(
        origin,
        destination
      );

    res.status(200).json(distanceTime);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Get autocomplete suggestions
module.exports.getAutoCompleteSuggestions = async (req, res) => {
  try {
    const { input } = req.query;

    const suggestions =
      await mapsService.getAutoCompleteSuggestions(input);

    res.status(200).json(suggestions);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};