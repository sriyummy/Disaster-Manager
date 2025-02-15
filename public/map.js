document.addEventListener("DOMContentLoaded", () => {
    const socket = io("http://localhost:3000", { transports: ["websocket"] });

    const map = L.map("map").setView([21.2514, 81.6296], 12);
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

    const localities = [
        { name: "Pandri", lat: 21.2800, lng: 81.68, count: 0 },
        { name: "Naya Raipur", lat: 21.2100, lng: 81.6000, count: 0 },
        { name: "Aranya", lat: 21.2300, lng: 81.6600, count: 0 },
        { name: "Civil Lines", lat: 21.275, lng: 81.59, count: 0 }
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

    function updateLocalityDisplay() {
        const container = document.getElementById("locality-counters");
        container.innerHTML = "";
        let maxCount = Math.max(...localities.map(l => l.count));
        localities.forEach(locality => {
            const div = document.createElement("div");
            div.textContent = `${locality.name}: ${locality.count}`;
            if (locality.count === maxCount && maxCount > 0) {
                div.style.fontWeight = "bold";
                div.style.color = "red";
            }
            container.appendChild(div);
        });
    }

    function updateLocalityMarkers() {
        let maxCount = Math.max(...localities.map(l => l.count));
        localities.forEach(locality => {
            const marker = localityMarkers[locality.name];
            if (locality.count === maxCount && maxCount > 0) {
                marker.setStyle({ color: "red", fillColor: "red", fillOpacity: 0.8 });
                marker.bindPopup(`${locality.name} is most affected! Count: ${locality.count}`);
            } else {
                marker.setStyle({ color: "gray", fillColor: "gray", fillOpacity: 0.5 });
                marker.bindPopup(`${locality.name}: ${locality.count}`);
            }
        });
    }

    socket.on("new-disaster", (report) => {
        const marker = L.marker([report.location.latitude, report.location.longitude]).addTo(map);
        marker.bindPopup(
            `<b>Victim:</b> ${report.victimName}<br>
             <b>Severity:</b> <span class="severity-${report.severity.toLowerCase()}">${report.severity}</span><br>
             <b>Needs:</b> ${report.needs.join(", ")}<br>
             <b>Reported At:</b> ${report.reportTime}`
        );

        let closest = null;
        let minDistance = Infinity;
        localities.forEach(locality => {
            const lat1 = locality.lat;
            const lat2 = report.location.latitude;
            const lon1 = locality.lng;
            const lon2 = report.location.longitude;
            const distance = Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1))*6371;
            if (distance < minDistance) {
                minDistance = distance;
                closest = locality;
            }
        });
        if (closest) {
            closest.count += 1;
        }
        updateLocalityDisplay();
        updateLocalityMarkers();

        const reportList = document.getElementById("report-list");
        const reportItem = document.createElement("div");
        reportItem.className = "report-item";
        reportItem.innerHTML = `<b>Victim:</b> ${report.victimName}<br>
         <b>Location:</b> (${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)})<br>
         <b>Severity:</b> <span class="severity-${report.severity.toLowerCase()}">${report.severity}</span>`;
        reportList.prepend(reportItem);
    });
});
