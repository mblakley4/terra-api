module.exports = {
  PORT: process.env.PORT || 4050,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://michaelblakley@localhost/terra',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://michaelblakley@localhost/terra-test',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'https://terra-app.mblakley4.now.sh'
}
