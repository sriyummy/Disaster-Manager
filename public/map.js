document.addEventListener("DOMContentLoaded", () => {
    var truckTime = 0;
    const sendTruckEvery = 75;
    setInterval(() => {
      truckTime += 1;
    }, 100);
  
    function pause(time) {
      return new Promise((resolve) => {
        setTimeout(resolve, time);
      });
    }
  
    const map = L.map("map").setView([21.2514, 81.6296], 12.4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);
  
    const raipurBoundary = [
      [21.20, 81.55],
      [21.20, 81.70],
      [21.30, 81.70],
      [21.30, 81.55]
    ];
    L.polygon(raipurBoundary, {
      color: "blue",
      opacity: 0.2,
      fillColor: "blue",
      fillOpacity: 0.1
    }).addTo(map);
  
    // Define major localities with an initial report count and an empty marker array.
    const localities = [
      { name: "Pandri", lat: 21.2800, lng: 81.68, count: 0, imp: 0, markers: [] },
      { name: "Naya Raipur", lat: 21.2100, lng: 81.6000, count: 0, imp: 0, markers: [] },
      { name: "Aranya", lat: 21.2300, lng: 81.6600, count: 0, imp: 0, markers: [] },
      { name: "Civil Lines", lat: 21.2750, lng: 81.59, count: 0, imp: 0, markers: [] }
    ];
  
    let localityMarkers = {};
    localities.forEach(locality => {
      const marker = L.circleMarker([locality.lat, locality.lng], {
        radius: 8,
        color: "gray",
        fillColor: "gray",
        fillOpacity: 0.5
      }).addTo(map);
      marker.bindPopup(`${locality.name}: ${locality.count}`);
      localityMarkers[locality.name] = marker;
    });
  
    const warehouseLocation = [21.2514, 81.6296];
    const warehouseIcon = L.divIcon({
      html: '<div style="width:20px; height:20px; background-color: grey; border:2px solid black;"></div>',
      className: "",
      iconSize: [20, 20]
    });
    const warehouseMarker = L.marker(warehouseLocation, { icon: warehouseIcon }).addTo(map);
  
    let currentHighlightedLocality = null;
    let warehouseToLocalityLine = null;
  
    // Global variable for truck destination.
    let currentTruckDestination = null;
  
    async function startAnim(coords) {
      var coordinateArray = coords;
      var myPolyline = L.polyline(coordinateArray, {
        color: "red",
        opacity: 0.6
      }).addTo(map);
      // Use the AnimatedMarker plugin (ensure it’s loaded in your HTML).
      var myMovingMarker = new L.AnimatedMarker(coordinateArray, {
        interval: 1000,
        autostart: true
      });
      map.addLayer(myMovingMarker);
  
      console.log('Truck started along route.');
      await pause(25000);
      console.log('Truck reached destination.');
      map.removeLayer(myPolyline);
      map.removeLayer(myMovingMarker);
  
      // When truck reaches the red marker, remove the 5 closest points from that locality.
      if (currentHighlightedLocality) {
        const localityCenter = L.latLng(currentHighlightedLocality.lat, currentHighlightedLocality.lng);
        let markers = currentHighlightedLocality.markers || [];
        if (markers.length > 0) {
          // Sort the markers by distance from the locality center.
          let sortedMarkers = markers.slice().sort((a, b) => {
            let da = a.getLatLng().distanceTo(localityCenter);
            let db = b.getLatLng().distanceTo(localityCenter);
            return da - db;
          });
          // Get the closest 5 markers (or all if fewer than 5).
          let markersToRemove = sortedMarkers.slice(0, 5);
          markersToRemove.forEach(marker => {
            console.log("Removing marker at", marker.getLatLng());
            marker.remove();
          });
          // Update the locality's markers array.
          currentHighlightedLocality.markers = markers.filter(m => !markersToRemove.includes(m));
          // Update the count.
          currentHighlightedLocality.count -= markersToRemove.length;
          if (currentHighlightedLocality.count < 0) {
            currentHighlightedLocality.count = 0;
          }
          updateLocalityDisplay();
          updateLocalityMarkers();
        }
      }
    }
  
    async function updateWarehouseToLocalityPath(locality) {
      let x = 4;
      while (warehouseToLocalityLine && x > 0) {
        map.removeLayer(warehouseToLocalityLine);
        x = x - 3;
      }
      const result = await getRouteData(warehouseLocation[0], warehouseLocation[1], locality.lat, locality.lng);
      if (result) {
        // Convert OSRM coordinates ([lon, lat]) to [lat, lon] for Leaflet.
        const routeCoordinates = result.geometry.map(coord => [coord[1], coord[0]]);
        warehouseToLocalityLine = L.polyline(routeCoordinates, {
          color: "blue",
          weight: 3,
          opacity: 0.3
        }).addTo(map);
  
        if (routeCoordinates && truckTime > sendTruckEvery) {
          // Set truck destination as the last coordinate.
          currentTruckDestination = routeCoordinates[routeCoordinates.length - 1];
          startAnim(routeCoordinates);
          truckTime = 0;
        }
      }
    }
  
    function updateLocalityDisplay() {
      const container = document.getElementById("locality-counters");
      if (container) {
        container.innerHTML = "";
        localities.forEach(locality => {
          const div = document.createElement("div");
          div.textContent = `${locality.name}: ${locality.count}`;
          container.appendChild(div);
        });
      }
    }
  
    function updateLocalityMarkers() {
      let maxCount = Math.max(...localities.map(l => l.count));
      localities.forEach(locality => {
        const marker = localityMarkers[locality.name];
        if (locality.count === maxCount && maxCount > 0) {
          marker.setStyle({ color: "red", fillColor: "red", fillOpacity: 0.8 });
          marker.bindPopup(`${locality.name} is most affected! Count: ${locality.count}`);
          if (!currentHighlightedLocality || currentHighlightedLocality.name !== locality.name) {
            currentHighlightedLocality = locality;
            updateWarehouseToLocalityPath(locality);
          }
        } else {
          marker.setStyle({ color: "gray", fillColor: "gray", fillOpacity: 0.5 });
          marker.bindPopup(`${locality.name}: ${locality.count}`);
        }
      });
    }
  
    function heuristic(dist, sev) {
      let hoo;
      switch (sev.toLowerCase()) {
        case 'low': hoo = 1; break;
        case 'medium': hoo = 2; break;
        case 'high': hoo = 3; break;
        case 'critical': hoo = 4; break;
      }
      return dist * hoo;
    }
  
    async function getRouteData(lat1, lon1, lat2, lon2) {
      const url = `https://router.project-osrm.org/route/v1/car/${lon1},${lat1};${lon2},${lat2}?steps=true&geometries=geojson`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === "Ok" && data.routes.length > 0) {
          const route = data.routes[0];
          const geometry = route.geometry.coordinates;
          const distance = route.distance;
          return { geometry, distance };
        } else {
          throw new Error("No valid routes found");
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        return null;
      }
    }
  
    const socket = io("http://localhost:3000", { transports: ["websocket"] });
    socket.on("new-disaster", (report) => {
      const reportMarker = L.circleMarker([report.location.latitude, report.location.longitude], {
        radius: 5,
        color: "#000",
        fillColor: "#f00",
        fillOpacity: 0.7,
        weight: 1,
        opacity: 0.8
      }).addTo(map);
      reportMarker.bindPopup(
        `Victim: ${report.victimName}<br>
         Severity: ${report.severity}<br>
         Needs: ${report.needs.join(", ")}<br>
         Reported At: ${report.reportTime}`
      );
  
      // Find the nearest locality using a basic distance check.
      let closest = null;
      let minDistance = Infinity;
      localities.forEach(locality => {
        const dx = locality.lat - report.location.latitude;
        const dy = locality.lng - report.location.longitude;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          closest = locality;
        }
      });
  
      if (closest) {
        // Draw a faint dashed line from the report point to the nearest locality.
        L.polyline([
          [report.location.latitude, report.location.longitude],
          [closest.lat, closest.lng]
        ], {
          color: "#aaa",
          weight: 1,
          opacity: 0.85,
          dashArray: "5,5"
        }).addTo(map);
  
        // Increase the count for that locality.
        closest.count += 1;
        // Also store this report marker in the locality's marker array.
        closest.markers.push(reportMarker);
  
        console.log(heuristic(minDistance, report.severity));
        setInterval(() => {
          updateLocalityDisplay();
        }, 1000);
        updateLocalityMarkers();
      }
  
      const reportList = document.getElementById("report-list");
      const reportItem = document.createElement("div");
      reportItem.className = "report-item";
      reportItem.innerHTML = `<b>Victim:</b> ${report.victimName}<br>
       <b>Location:</b> (${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)})<br>
       <b>Severity:</b> <span class="severity-${report.severity.toLowerCase()}">${report.severity}</span>`;
      reportList.prepend(reportItem);
    });
  });