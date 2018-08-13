/* eslint-env mocha */
'use strict'

const {
  fork
} = require('child_process')

describe('ipfs-blob-store', () => {
  it('runs abstract-blob-store tests', function (done) {
    this.timeout(60000)

    const proc = fork(`${__dirname}/blob-store-test`)

    proc.on('close', (code) => {
      done(code === 0 ? null : new Error('Tests failed!'))
    })
  })
})
