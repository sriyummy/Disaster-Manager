document.addEventListener("DOMContentLoaded", () => {
    var truckTime = 0;
    const sendTruckEvery = 100;
    const remPoints = 4;
    const truckInt = 450;
    setInterval(() => {
      truckTime += 1;
    }, 100);
  
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
  
    // Define localities with initial report count and empty marker array
    const localities = [
      { name: "Pandri", lat: 21.2800, lng: 81.68, count: 0, imp: 0, markers: [], importances: [] },
      { name: "Naya Raipur", lat: 21.2100, lng: 81.6000, count: 0, imp: 0, markers: [], importances: [] },
      { name: "Aranya", lat: 21.2300, lng: 81.6600, count: 0, imp: 0, markers: [], importances: [] },
      { name: "Civil Lines", lat: 21.2750, lng: 81.59, count: 0, imp: 0, markers: [], importances: [] }
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
    // coords for truck
    let currentRouteCoordinates = null;
    let currentTruckDestination = null;
  
    async function startAnim(coords) {
      var coordinateArray = coords;
      var myPolyline = L.polyline(coordinateArray, {
        color: "red",
        opacity: 0.6
      }).addTo(map);


      var myMovingMarker = new L.AnimatedMarker(coordinateArray, {
        interval: truckInt,
        autostart: true,
        onEnd: (()=>{
          map.removeLayer(myPolyline);
          map.removeLayer(myMovingMarker);

          // remove the 5 closest points from that locality.
          if (currentHighlightedLocality) {
            const localityCenter = L.latLng(currentHighlightedLocality.lat, currentHighlightedLocality.lng);
            let markers = currentHighlightedLocality.markers || [];
            if (markers.length > 0) {
              // Sort the markers by distance 
              let sortedMarkers = markers.slice().sort((a, b) => {
                let da = a.getLatLng().distanceTo(localityCenter);
                let db = b.getLatLng().distanceTo(localityCenter);
                return da - db;
              });
              // Get the closest 5 markers
              let markersToRemove = sortedMarkers.slice(0, remPoints);
              markersToRemove.forEach(marker => {
                console.log("Removing marker at", marker.getLatLng());
                marker.remove();
                console.log(marker);
              });

              currentHighlightedLocality.markers = markers.filter(m => !markersToRemove.includes(m));

              currentHighlightedLocality.count -= markersToRemove.length;
              if (currentHighlightedLocality.count < 0) {
                currentHighlightedLocality.count = 0;
              }

              // In max-first fashion subtract the highest importance values corresponding to the removed markers.
              if (currentHighlightedLocality.importances && currentHighlightedLocality.importances.length > 0) {
                // Sort importance values in descending order.
                currentHighlightedLocality.importances.sort((a, b) => b - a);
                const numToRemove = Math.min(remPoints, currentHighlightedLocality.importances.length);
                let totalRemovedImp = 0;
                for (let i = 0; i < numToRemove; i++) {
                  totalRemovedImp += currentHighlightedLocality.importances[i];
                }
                // Remove highest importance values
                currentHighlightedLocality.importances.splice(0, numToRemove);
                // Subtract from overall importance
                currentHighlightedLocality.imp -= totalRemovedImp;
                if (currentHighlightedLocality.imp < 0) {
                  currentHighlightedLocality.imp = 0;
                }
              }

            }
          }
          console.log('Truck reached destination.');
          updateLocalityMarkers();
        })
      });
      console.log('Truck started along route.');
      map.addLayer(myMovingMarker);
    }
  
    async function updateWarehouseToLocalityPath(locality) {
      if (warehouseToLocalityLine) {
        map.removeLayer(warehouseToLocalityLine);
      }
      const result = await getRouteData(warehouseLocation[0], warehouseLocation[1], locality.lat, locality.lng);
      if (result) {
        // Convert OSRM coordinates ([lon, lat]) to [lat, lon] for Leaflet.
        currentRouteCoordinates  = result.geometry.map(coord => [coord[1], coord[0]]);
        warehouseToLocalityLine = L.polyline(currentRouteCoordinates , {
          color: "blue",
          weight: 3,
          opacity: 0.3
        }).addTo(map);
  
          currentTruckDestination = currentRouteCoordinates[currentRouteCoordinates.length - 1];
          console.log('updated warehouse path')
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
      let highlightedLocality = 0;
      let highlightName = '';
      localities.forEach(locality => {
        if (locality.imp > highlightedLocality) {
          highlightedLocality = locality.imp;
          highlightName = locality.name;
        }
      });
      localities.forEach(locality => {
        const marker = localityMarkers[locality.name];
        if (locality.name === highlightName) {
            console.log(highlightedLocality);
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
        // L.polyline([
        //   [report.location.latitude, report.location.longitude],
        //   [closest.lat, closest.lng]
        // ], {
        //   color: "#aaa",
        //   weight: 1,
        //   opacity: 0.85,
        //   dashArray: "5,5"
        // }).addTo(map);
  
        closest.count += 1;
        // store this report marker in the locality's marker array && add custom heuristic
        closest.markers.push(reportMarker);

        var add = heuristic(minDistance, report.severity);
        if(add){
            closest.imp += add;
            closest.importances.push(add);
            console.log(add);
        }
  
        console.log(heuristic(minDistance, report.severity));
        updateLocalityDisplay();

        setInterval(()=>{
          updateLocalityMarkers();
        }, 2000);
      }

      function periodicTruckDispatch() {
        if (currentRouteCoordinates && truckTime > sendTruckEvery){
          console.log("Time elapsed and route available. Dispatching truck...");
          startAnim(currentRouteCoordinates);
          truckTime = 0; // reset the timer after dispatch
        }
        }
      setInterval(periodicTruckDispatch, 1000);
  
      const reportList = document.getElementById("report-list");
      const reportItem = document.createElement("div");
      reportItem.className = "report-item";
      reportItem.innerHTML = `<b>Victim:</b> ${report.victimName}<br>
       <b>Location:</b> (${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)})<br>
       <b>Severity:</b> <span class="severity-${report.severity.toLowerCase()}">${report.severity}</span>`;
      reportList.prepend(reportItem);
    });
  });