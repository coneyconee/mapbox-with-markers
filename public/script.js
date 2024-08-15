mapboxgl.accessToken = 'api key from mapbox';


const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [103.773357, 1.313538],
  zoom: 17,
  pitch: 60,
  bearing: -20
});

const existingMarkers = [];
const distanceThreshold = 100;

map.addControl(
  new mapboxgl.GeolocateControl({
      positionOptions: {
          enableHighAccuracy: false
      },
      trackUserLocation: true,
      showUserHeading: true
  })
);

//calculating dist
function calculateDistance(coord1, coord2) {
  const R = 6371e3; // Radius of the Earth in meters
  const rad = Math.PI / 180;
  const lat1 = coord1.lat * rad;
  const lat2 = coord2.lat * rad;
  const deltaLat = (coord2.lat - coord1.lat) * rad;
  const deltaLng = (coord2.lng - coord1.lng) * rad;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = 5 * (R * c);
  return distance;
}

//existingn markers
fetch('/markers')
  .then(response => response.json())
  .then(markers => {
    markers.forEach(marker => {
      addMarker(marker);
      existingMarkers.push(marker.coordinates);
    });
  });


//adding a new markwer
map.on('style.load', function() {
  map.on('click', function(e) {
    var coordinates = e.lngLat;

    //dist check
    const tooClose = existingMarkers.some(marker => calculateDistance(marker, coordinates) < distanceThreshold);

    if (tooClose) {
      //alert('maskrer is too close to an existing marker');
      return;
    }

    //promts
    let title = '';
    let description = '';
    let goodbad = '';

    //validation
    while (!title) {
      title = prompt("Enter the title for the marker:");
      if (!title) {
        alert("Title cannot be empty. Please enter a title.");
      }
    }

    while (!description) {
      description = prompt("Enter the description for the marker:");
      if (!description) {
        alert("Description cannot be empty. Please enter a description.");
      }
    }

    while (!goodbad) {
      goodbad = prompt("Is this place accessible?:");
      if (!goodbad) {
        alert("Field cannot be empty. Please enter 'yes' or 'no'.");
      }
    }
    while (goodbad !== 'yes' && goodbad !== 'no') {
      goodbad = prompt("Please enter 'yes' or 'no'.")
      if (goodbad !== 'yes' && goodbad !== 'no') {
        alert('Invalid input. Must be "yes" or "no".');
      }
    }
  

    //templaye for adding new sillies
    const newMarker = {
      coordinates: coordinates,
      properties: {
        title: title,
        description: description,
        goodbad: goodbad
      }
    };

    //ping the server and give it the new coords n title n desc
    //edited to add error logs
    fetch('/markers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMarker)
    })
    .then(response => {
      if (response.ok) {
        addMarker(newMarker);
        existingMarkers.push(coordinates);
      } else {
        response.text().then(text => alert('Error saving marker: ' + text));
      }
    })
    .catch(error => {
      alert('Error saving marker: ' + error.message);
    });
  });
});

//html to add actual markers on the map
function addMarker(marker) {
  const el = document.createElement('div');
  el.className = 'marker';
  el.classList.add(marker.properties.goodbad === 'yes' ? 'green' : 'red');


  new mapboxgl.Marker(el)
    .setLngLat(marker.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(
          `<h3>${marker.properties.title}</h3><p>${marker.properties.description}</p>`
        )
    )
    .addTo(map);
}
