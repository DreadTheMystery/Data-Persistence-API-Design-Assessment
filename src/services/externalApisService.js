const axios = require("axios");

const GENDERIZE_URL = "https://api.genderize.io";
const AGIFY_URL = "https://api.agify.io";
const NATIONALIZE_URL = "https://api.nationalize.io";

async function fetchGender(name) {
  const response = await axios.get(GENDERIZE_URL, {
    params: { name },
  });
  const data = response.data || {};

  if (data.gender === null || data.count === 0) {
    const error = new Error("Genderize returned an invalid response");
    error.statusCode = 502;
    error.externalApi = "Genderize";
    throw error;
  }

  return {
    gender: data.gender,
    gender_probability: data.probability,
    sample_size: data.count,
  };
}

async function fetchAge(name) {
  const response = await axios.get(AGIFY_URL, {
    params: { name },
  });
  const data = response.data || {};

  if (data.age === null || data.age === undefined) {
    const error = new Error("Agify returned an invalid response");
    error.statusCode = 502;
    error.externalApi = "Agify";
    throw error;
  }

  return {
    age: data.age,
  };
}

async function fetchNationality(name) {
  const response = await axios.get(NATIONALIZE_URL, {
    params: { name },
  });
  const data = response.data || {};

  const countries = Array.isArray(data.country) ? data.country : [];

  if (!countries.length) {
    const error = new Error("Nationalize returned an invalid response");
    error.statusCode = 502;
    error.externalApi = "Nationalize";
    throw error;
  }

  const top = countries.reduce((max, current) =>
    current.probability > max.probability ? current : max,
  );

  return {
    country_id: top.country_id,
    country_probability: top.probability,
  };
}

async function fetchProfileData(name) {
  try {
    const gender = await fetchGender(name);
    const age = await fetchAge(name);
    const nationality = await fetchNationality(name);

    return { ...gender, ...age, ...nationality };
  } catch (error) {
    if (error.statusCode === 502 && error.externalApi) {
      const wrapped = new Error(
        `${error.externalApi} returned an invalid response`,
      );
      wrapped.statusCode = 502;
      return Promise.reject(wrapped);
    }

    const generic = new Error("Upstream service failure");
    generic.statusCode = 502;
    return Promise.reject(generic);
  }
}

module.exports = {
  fetchProfileData,
};
