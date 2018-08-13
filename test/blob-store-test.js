'use strict'

const test = require('tape')
const abstractBlobTests = require('abstract-blob-store/tests')
const ipfsBlobStore = require('../')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()
const which = require('which')

which('ipfs', (error, ipfs) => {
  if (error) {
    throw error
  }

  df.spawn({
    disposable: true,
    args: ['--api=/ip4/127.0.0.1/tcp/13000'],
    exec: ipfs
  }, (err, node) => {
    if (err) {
      throw err
    }

    abstractBlobTests(test, common)
    // quick hack to stop the deamon
    // TODO clean up later
    setTimeout(function () {
      node.stop(() => {})
    }, 5000)
  })
})

let store
const options = {
  baseDir: '/tests/',
  port: 13000,
  host: '127.0.0.1'
}
const common = {
  setup: async (t, cb) => {
    store = await ipfsBlobStore(options)
    await store.ipfs.files.mkdir(options.baseDir, { p: true })
    cb(null, store)
  },

  teardown: async (t, store, blob, cb) => {
    await store.ipfs.files.rm(options.baseDir, { recursive: true })
    cb()
  }
}
