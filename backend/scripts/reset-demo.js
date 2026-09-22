/**
 * Full demo reset: re-seeds the database with fresh demo data.
 * Use this right before a live demo so every batch/QR code points
 * to your machine's CURRENT network address and IDs never collide.
 *
 * Run: npm run demo:reset   (from the backend/ folder)
 *
 * NOTE: if your Hardhat blockchain node was also restarted since the
 * last demo, the smart contract needs to be redeployed too — this
 * script only resets the database, not the chain.
 */
const path = require('path');

// Make sure the seed script (which lives outside backend/) can see
// backend's installed node_modules (pg, bcryptjs, qrcode, dotenv),
// no matter which folder this command is run from.
process.env.NODE_PATH = path.join(__dirname, '..', 'node_modules');
require('module').Module._initPaths();

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🐝 HoneyChain demo reset');
console.log('-------------------------');
console.log('Re-seeding database with fresh demo data...\n');

require('../../database/seed/seed.js');