/**
 * Simulated IoT sensor data generator.
 * Designed so a real sensor gateway can later POST to the same
 * /api/hives/:hiveId/sensor-data endpoint shape without any API changes.
 */

function rand(min, max, decimals = 2) {
  return +(Math.random() * (max - min) + min).toFixed(decimals);
}

function generateReading({ abnormal = false } = {}) {
  if (abnormal) {
    // Anomaly signature: temperature spike, humidity up, weight drop, acoustic/colony drop
    return {
      temperature: rand(37.5, 40),
      humidity: rand(75, 90),
      weight: rand(25, 35),
      acoustic_level: rand(10, 35),
      colony_strength: rand(15, 40),
    };
  }
  return {
    temperature: rand(30, 36),
    humidity: rand(40, 70),
    weight: rand(35, 60),
    acoustic_level: rand(55, 100),
    colony_strength: rand(60, 100),
  };
}

module.exports = { generateReading };
