/**
 * Simulated notification "sending" for hive alerts.
 *
 * This is a hackathon prototype: it does NOT send any real email or
 * WhatsApp message, and it does not use any external API or paid
 * service. It just logs what WOULD be sent, and records which
 * channels were "notified" on the alert record, so the UI can show
 * a realistic "📧 Email sent" / "💬 WhatsApp sent" indicator.
 *
 * In a real deployment, this function would call an actual email
 * provider (e.g. SendGrid) and the WhatsApp Business API instead.
 */
const pool = require('../config/db');

async function simulateNotifyAlert(alert, beekeeperEmail) {
  const channels = ['email', 'whatsapp'];

  console.log('\n📧 [SIMULATED EMAIL] To:', beekeeperEmail);
  console.log(`   Subject: HoneyChain Alert — ${alert.hive_number || 'Hive'} needs attention`);
  console.log(`   Body: ${alert.message}`);
  console.log(`   Recommended action: ${alert.recommendation}\n`);

  console.log('💬 [SIMULATED WHATSAPP] To: beekeeper\'s registered number');
  console.log(`   🚨 HoneyChain Alert: ${alert.message}\n`);

  await pool.query('UPDATE alerts SET notified_channels = $1 WHERE id = $2', [channels, alert.id]);

  return channels;
}

module.exports = { simulateNotifyAlert };
