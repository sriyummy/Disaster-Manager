import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { faker } from "@faker-js/faker";

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const low = 1000;
const high = 3000;

const cityBounds = {
    minLat: 21.20,
    maxLat: 21.30,
    minLng: 81.55,
    maxLng: 81.70
};

const generateFakeReport = () => {
    const lat = faker.number.float({ min: cityBounds.minLat, max: cityBounds.maxLat, precision: 0.0001 });
    const lng = faker.number.float({ min: cityBounds.minLng, max: cityBounds.maxLng, precision: 0.0001 });
    return {
         id: faker.string.uuid(),
         victimName: faker.person.fullName(),
         contact: faker.phone.number(),
         location: { latitude: lat, longitude: lng },
         severity: faker.helpers.weightedArrayElement([{weight:7, value:"Low"}, {weight:5, value:"Moderate"}, {weight:3, value:"High"}, {weight:1, value:"Critical"}]),
         reportTime: new Date().toLocaleTimeString(),
         needs: faker.helpers.arrayElements(["Food", "Water", "Shelter", "Medical Aid"], 2)
    };
};

// setInterval(() => {
//     const newReport = generateFakeReport();
//     const num = genReportTime();
//     io.emit("new-disaster", newReport);
//     console.log("Sent:", newReport);
// }, 1000);

(function loop() {
    var rann = Math.round(Math.random() * (high - low)) + low;
    setTimeout(function() {
        const newReport = generateFakeReport();
        io.emit("new-disaster", newReport);
        console.log("Sent:", newReport, "Time taken:", rann);
        loop();
    }, rann);
}());

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`WebSocket Server running on http://localhost:${PORT}`);
});
