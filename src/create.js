'use strict'

const promisify = require('promisify-es6')
const IPFS = require('ipfs')
const remote = require('ipfs-api')
const mfs = require('./mfs')
const log = require('debug')('ipfs:blob-store:create')
const defaultOptions = {
  ipfs: null,
  flush: true,
  baseDir: '/'
}

module.exports = promisify((opts, callback) => {
  if (typeof opts === 'function') {
    callback = opts
    opts = defaultOptions
  }

  const options = Object.assign({}, defaultOptions, opts)

  if (options.ipfs) {
    log('Using pre-configured IPFS instance')
    return setImmediate(() => callback(null, mfs(options)))
  }

  if (options.host && options.port) {
    log(`Connecting to remote IPFS at ${options.host}:${options.port}`)
    options.ipfs = remote(options.host, options.port)

    return setImmediate(() => callback(null, mfs(options)))
  }

  log(`Starting an IPFS instance`)
  callback = once(callback)

  options.ipfs = new IPFS()
  options.ipfs.once('ready', () => callback(null, mfs(options)))
  options.ipfs.once('error', (error) => callback(error))
})

function once (cb) {
  let called = false

  return function () {
    if (called) {
      return
    }

    called = true
    cb.apply(null, arguments)
  }
}
