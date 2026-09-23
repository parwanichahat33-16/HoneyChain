/**
 * HoneyChain demo data seeder.
 * Populates: 5+ beekeepers, 10+ apiaries, 30+ hives, sensor readings,
 * batches with full traceability, and one intentionally abnormal hive (H017).
 *
 * Run: node database/seed/seed.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

const isNeon = /neon\.tech/.test(process.env.DATABASE_URL || '');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const CLUSTERS = ['Ahmedabad', 'Rajkot', 'Junagadh', 'Banaskantha'];
const CLUSTER_CODE = { Ahmedabad: 'AHM', Rajkot: 'RAJ', Junagadh: 'JUN', Banaskantha: 'BAN' };

const CLUSTER_COORDS = {
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Rajkot: { lat: 22.3039, lng: 70.8022 },
  Junagadh: { lat: 21.5222, lng: 70.4579 },
  Banaskantha: { lat: 24.1719, lng: 72.4384 },
};

function rand(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

function jitter(base, spread = 0.15) {
  return +(base + (Math.random() - 0.5) * spread).toFixed(6);
}

function randomSensorReading({ abnormal = false } = {}) {
  if (abnormal) {
    // Simulates disease/stress signature: temp up, weight down, acoustic down
    return {
      temperature: rand(37.5, 39.5),
      humidity: rand(75, 88),
      weight: rand(28, 36),
      acoustic_level: rand(15, 40),
      colony_strength: rand(20, 45),
    };
  }
  return {
    temperature: rand(31, 36),
    humidity: rand(45, 70),
    weight: rand(38, 58),
    acoustic_level: rand(60, 95),
    colony_strength: rand(65, 95),
  };
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Clearing existing demo data...');
    await client.query(
      'TRUNCATE alerts, predictions, traceability_events, batches, sensor_data, hives, apiaries, users RESTART IDENTITY CASCADE'
    );

    // --- Admin user ---
    const adminPass = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'admin')`,
      ['KVIC Admin', 'admin@honeychain.gov.in', adminPass]
    );

    // --- Beekeepers ---
    const beekeeperNames = [
      'Rajesh Patel', 'Suresh Vaghela', 'Meena Chaudhary',
      'Anil Rathod', 'Kavita Solanki', 'Vikram Desai',
    ];
    const beekeeperIds = [];
    const pass = await bcrypt.hash('password123', 10);
    for (const name of beekeeperNames) {
      const email = name.toLowerCase().replace(/ /g, '.') + '@honeychain.in';
      const res = await client.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'beekeeper') RETURNING id`,
        [name, email, pass]
      );
      beekeeperIds.push(res.rows[0].id);
    }

    // --- Apiaries (10+) across clusters ---
    const apiaryIds = [];
    let apiaryCount = 0;
    for (const cluster of CLUSTERS) {
      const numApiaries = cluster === 'Ahmedabad' ? 4 : cluster === 'Rajkot' ? 3 : 2;
      for (let i = 1; i <= numApiiaries(numApiaries); i++) {
        apiaryCount++;
        const beekeeperId = beekeeperIds[apiaryCount % beekeeperIds.length];
        const coords = CLUSTER_COORDS[cluster];
        const res = await client.query(
          `INSERT INTO apiaries (name, location, cluster, latitude, longitude, beekeeper_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          [`${cluster} Apiary ${i}`, `${cluster}, Gujarat`, cluster, jitter(coords.lat), jitter(coords.lng), beekeeperId]
        );
        apiaryIds.push(res.rows[0].id);
      }
    }

    // --- Hives (30+) ---
    let hiveCount = 0;
    const hiveIds = [];
    for (const apiaryId of apiaryIds) {
      const numHives = 3; // 12 apiaries * 3 = 36 hives
      for (let i = 0; i < numHives; i++) {
        hiveCount++;
        const hiveNumber = 'H' + String(hiveCount).padStart(3, '0');
        const isAbnormal = hiveNumber === 'H017'; // intentionally abnormal demo hive
        const status = isAbnormal ? 'high_risk' : 'healthy';
        const res = await client.query(
          `INSERT INTO hives (hive_number, apiary_id, installation_date, status)
           VALUES ($1,$2, NOW() - INTERVAL '${rand(30, 400) | 0} days', $3) RETURNING id`,
          [hiveNumber, apiaryId, status]
        );
        hiveIds.push({ id: res.rows[0].id, hiveNumber, isAbnormal });
      }
    }

    // --- Sensor data + predictions per hive ---
    for (const hive of hiveIds) {
      // 24 historical readings (simulate past readings, one every few hours)
      for (let h = 24; h >= 0; h--) {
        const reading = randomSensorReading({ abnormal: hive.isAbnormal && h < 6 });
        await client.query(
          `INSERT INTO sensor_data (hive_id, temperature, humidity, weight, acoustic_level, colony_strength, timestamp)
           VALUES ($1,$2,$3,$4,$5,$6, NOW() - INTERVAL '${h} hours')`,
          [hive.id, reading.temperature, reading.humidity, reading.weight, reading.acoustic_level, reading.colony_strength]
        );
      }

      const risk = hive.isAbnormal ? rand(75, 90) : rand(3, 25);
      const healthStatus = risk > 70 ? 'high_risk' : risk > 35 ? 'medium_risk' : 'healthy';
      const predictedYield = hive.isAbnormal ? rand(2, 4) : rand(6, 12);
      const recommendation = hive.isAbnormal
        ? 'Inspect hive within 24 hours. Temperature anomaly and weight decrease detected.'
        : 'Environmental conditions are favorable. Continue routine monitoring.';

      await client.query(
        `INSERT INTO predictions (hive_id, disease_risk, health_status, predicted_yield, recommendation)
         VALUES ($1,$2,$3,$4,$5)`,
        [hive.id, risk, healthStatus, predictedYield, recommendation]
      );

      if (hive.isAbnormal) {
        await client.query(
          `INSERT INTO alerts (hive_id, severity, message, recommendation, notified_channels)
           VALUES ($1,'high',$2,$3,$4)`,
          [
            hive.id,
            `Hive ${hive.hiveNumber} shows abnormal conditions: temperature increased, weight decreased, acoustic activity decreased.`,
            'Physical hive inspection recommended within 24 hours.',
            ['email', 'whatsapp'],
          ]
        );
      }
    }

    // --- Honey batches with full traceability (10+) ---
    const eventFlow = ['HARVESTED', 'EXTRACTED', 'PROCESSED', 'PACKAGED', 'DISTRIBUTED'];
    for (let i = 1; i <= 12; i++) {
      const hive = hiveIds[i % hiveIds.length];
      const clusterIdx = i % CLUSTERS.length;
      const cluster = CLUSTERS[clusterIdx];
      const code = CLUSTER_CODE[cluster];
      const batchId = `HC-2026-${code}-${String(i).padStart(4, '0')}`;
      const beekeeperId = beekeeperIds[i % beekeeperIds.length];
      const quantity = rand(5, 15);
      const verifyUrl = `${FRONTEND_URL}/verify/${batchId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl);

      await client.query(
        `INSERT INTO batches (batch_id, hive_id, beekeeper_id, harvest_date, quantity, honey_type, location, status, blockchain_hash, qr_code)
         VALUES ($1,$2,$3, NOW() - INTERVAL '${(12 - i) * 3} days', $4, 'Raw Wildflower Honey', $5, $6, $7, $8)`,
        [
          batchId,
          hive.id,
          beekeeperId,
          quantity,
          `${cluster}, Gujarat`,
          eventFlow[Math.min(i % eventFlow.length, eventFlow.length - 1)].toLowerCase(),
          '0x' + require('crypto').randomBytes(32).toString('hex'),
          qrDataUrl,
        ]
      );

      const stepsToInsert = eventFlow.slice(0, (i % eventFlow.length) + 1);
      for (let s = 0; s < stepsToInsert.length; s++) {
        await client.query(
          `INSERT INTO traceability_events (batch_id, event_type, location, blockchain_tx, timestamp)
           VALUES ($1,$2,$3,$4, NOW() - INTERVAL '${(12 - i) * 3 - s} days')`,
          [batchId, stepsToInsert[s], `${cluster}, Gujarat`, '0x' + require('crypto').randomBytes(32).toString('hex')]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Seed complete:', {
      beekeepers: beekeeperIds.length,
      apiaries: apiaryIds.length,
      hives: hiveIds.length,
      batches: 12,
      abnormalHive: 'H017',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// small helper kept local to avoid an extra dependency
function numApiiaries(n) { return n; }

seed();
