const {
  getSidestreamTelemetryCollectorConfig,
  getSidestreamTelemetryDatabaseConfig,
  isLegacySupabaseTelemetryEnabled,
  isNeonConnectionString,
  recordPluginTelemetryBatch,
} = require('./supabase-db');

module.exports = {
  getSidestreamTelemetryCollectorConfig,
  getSidestreamTelemetryDatabaseConfig,
  isLegacySupabaseTelemetryEnabled,
  isNeonConnectionString,
  recordPluginTelemetryBatch,
};
