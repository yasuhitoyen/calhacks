// ---------- server.js ----------
const express = require('express');
const fs      = require('fs');
const csv     = require('csv-parser');

const app  = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:8080' }));
let csvData = [];

/* ---------- middleware ---------- */
app.use(express.json());   // parses JSON bodies

/* ---------- load your CSV once at startup ---------- */
fs.createReadStream('./final_all_with_preferences.csv')
  .pipe(csv())
  .on('data', (row) => csvData.push(row))
  .on('end', ()  => console.log(`Loaded ${csvData.length} rows from CSV`));

/* ---------- POST /api/all ---------- */
app.post('/api/all', (req, res) => {
  console.log('GOT A CALL')
  // Expecting body = [1, 2, 3, …]
  console.log(req.body[0])
  console.log(req.headers['x-zip-code'])
  const prefCodes = Array.isArray(req.body)
    ? req.body.map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 6)
    : [];

  // Optionally filter by zip code from header
  const zipCode = req.headers['x-zip-code'];

  let results = csvData;

  // Filter by zip if provided
  if (zipCode) {
    results = results.filter(r => String(r.zip_code) === String(zipCode));
  }

  // Filter by preference codes (any overlap counts as a match)
  if (prefCodes.length) {
    results = results.filter(r => {
      if (!r.preference_code) return false;
      const rowCodes = r.preference_code.toString().split(',')
                        .map(c => parseInt(c.trim(), 10));
      return prefCodes.some(code => rowCodes.includes(code));
    });
  }

  res.json({ data: results });
});

/* ---------- start the server ---------- */
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
