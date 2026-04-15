const db = require("./db");

function mapRowToProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    gender_probability: row.gender_probability,
    sample_size: row.sample_size,
    age: row.age,
    age_group: row.age_group,
    country_id: row.country_id,
    country_probability: row.country_probability,
    created_at: row.created_at,
  };
}

function getAgeGroup(age) {
  if (age <= 12) return "child";
  if (age <= 19) return "teenager";
  if (age <= 59) return "adult";
  return "senior";
}

function findByName(name) {
  const stmt = db.prepare("SELECT * FROM profiles WHERE name = ?");
  const row = stmt.get(name);
  return mapRowToProfile(row);
}

function findById(id) {
  const stmt = db.prepare("SELECT * FROM profiles WHERE id = ?");
  const row = stmt.get(id);
  return mapRowToProfile(row);
}

function createProfile(id, name, data) {
  const age_group = getAgeGroup(data.age);
  const created_at = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO profiles (
      id,
      name,
      gender,
      gender_probability,
      sample_size,
      age,
      age_group,
      country_id,
      country_probability,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    name,
    data.gender,
    data.gender_probability,
    data.sample_size,
    data.age,
    age_group,
    data.country_id,
    data.country_probability,
    created_at,
  );

  return findById(id);
}

function listProfiles(filters) {
  const conditions = [];
  const params = [];

  if (filters.gender) {
    conditions.push("LOWER(gender) = LOWER(?)");
    params.push(filters.gender);
  }
  if (filters.country_id) {
    conditions.push("LOWER(country_id) = LOWER(?)");
    params.push(filters.country_id);
  }
  if (filters.age_group) {
    conditions.push("LOWER(age_group) = LOWER(?)");
    params.push(filters.age_group);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = db
    .prepare(`SELECT * FROM profiles ${where} ORDER BY created_at DESC`)
    .all(...params);

  return rows.map((row) => mapRowToProfile(row));
}

function deleteProfile(id) {
  const stmt = db.prepare("DELETE FROM profiles WHERE id = ?");
  const info = stmt.run(id);
  return info.changes > 0;
}

module.exports = {
  getAgeGroup,
  findByName,
  findById,
  createProfile,
  listProfiles,
  deleteProfile,
};
