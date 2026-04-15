const { v7: uuidv7 } = require("uuid");
const {
  findByName,
  findById,
  createProfile,
  listProfiles,
  deleteProfile,
  getAgeGroup,
} = require("../models/profileModel");
const { fetchProfileData } = require("../services/externalApisService");

function validateNameInput(name) {
  if (name === undefined || name === null || name === "") {
    return {
      isValid: false,
      statusCode: 400,
      message: "Missing or empty name",
    };
  }

  if (typeof name !== "string") {
    return {
      isValid: false,
      statusCode: 422,
      message: "Invalid type for name",
    };
  }

  const trimmed = name.trim();

  if (!trimmed) {
    return {
      isValid: false,
      statusCode: 400,
      message: "Missing or empty name",
    };
  }

  return {
    isValid: true,
    name: trimmed,
  };
}

async function createProfileHandler(req, res) {
  const validation = validateNameInput(req.body && req.body.name);

  if (!validation.isValid) {
    return res.status(validation.statusCode).json({
      status: "error",
      message: validation.message,
    });
  }

  const name = validation.name;

  try {
    const existing = findByName(name);
    if (existing) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existing,
      });
    }

    const data = await fetchProfileData(name);

    const id = uuidv7();
    const profile = createProfile(id, name, data);

    return res.status(201).json({
      status: "success",
      data: profile,
    });
  } catch (error) {
    if (error.statusCode === 502) {
      return res.status(502).json({
        status: "error",
        message: error.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Upstream or server failure",
    });
  }
}

function getSingleProfileHandler(req, res) {
  const { id } = req.params;
  const profile = findById(id);

  if (!profile) {
    return res.status(404).json({
      status: "error",
      message: "Profile not found",
    });
  }

  return res.status(200).json({
    status: "success",
    data: profile,
  });
}

function getAllProfilesHandler(req, res) {
  const { gender, country_id, age_group } = req.query;

  const profiles = listProfiles({ gender, country_id, age_group });

  const data = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    gender: p.gender,
    age: p.age,
    age_group: getAgeGroup(p.age),
    country_id: p.country_id,
  }));

  return res.status(200).json({
    status: "success",
    count: data.length,
    data,
  });
}

function deleteProfileHandler(req, res) {
  const { id } = req.params;

  const deleted = deleteProfile(id);

  if (!deleted) {
    return res.status(404).json({
      status: "error",
      message: "Profile not found",
    });
  }

  return res.status(204).send();
}

module.exports = {
  createProfileHandler,
  getSingleProfileHandler,
  getAllProfilesHandler,
  deleteProfileHandler,
};
