const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const markersFile = path.join(__dirname, 'public','markers.json');

app.use(express.json());

//find the files from public dir
app.use(express.static(path.join(__dirname, 'public')));

// open the html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// find markers from public/markers.json
app.get('/markers', (req, res) => {
  fs.readFile(markersFile, (err, data) => {
    if (err) {
      console.error('Error reading markers data:', err);
      return res.status(500).send('Error reading markers data.');
    }
    res.json(JSON.parse(data));
  });
});

//IF IF IF the user asks to put a new marker
app.post('/markers', (req, res) => {
  const newMarker = req.body;
  fs.readFile(markersFile, (err, data) => {
    if (err) {
      console.error('Error reading markers data:', err);
      return res.status(500).send('Error reading markers data.');
    }
    const markers = JSON.parse(data);
    markers.push(newMarker);
    fs.writeFile(markersFile, JSON.stringify(markers, null, 2), (err) => {
      if (err) {
        console.error('Error saving marker:', err);
        return res.status(500).send('Error saving marker.');
      }
      res.status(201).send('Marker added.');
    });
  });
});

//console log shit idk
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
