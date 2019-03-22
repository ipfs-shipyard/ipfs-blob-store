'use strict'

const IPFS = require('ipfs')
const remote = require('ipfs-http-client')
const mfs = require('./mfs')
const log = require('debug')('ipfs:blob-store:create')
const defaultOptions = {
  ipfs: null,
  flush: true,
  baseDir: '/'
}

module.exports = async (opts) => {
  const options = Object.assign({}, defaultOptions, opts)

  if (options.ipfs) {
    log('Using pre-configured IPFS instance')
    return mfs(options)
  }

  if (options.host && options.port) {
    log(`Connecting to remote IPFS at ${options.host}:${options.port}`)
    options.ipfs = remote(options.host, options.port)

    return mfs(options)
  }

  log(`Starting an IPFS instance`)

  options.ipfs = await getIPFSReadyNode()
  return mfs(options)
}

function getIPFSReadyNode () {
  return new Promise((resolve, reject) => {
    const ipfs = new IPFS()
    ipfs.once('ready', () => resolve(ipfs))
    ipfs.once('error', reject)
  })
}
