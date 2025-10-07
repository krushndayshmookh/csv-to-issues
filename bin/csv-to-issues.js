#!/usr/bin/env node

const { main } = require('../lib/csv-to-issues')

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error.message)
    process.exit(1)
  })
