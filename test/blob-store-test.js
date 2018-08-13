'use strict'

const test = require('tape')
const abstractBlobTests = require('abstract-blob-store/tests')
const ipfsBlobStore = require('../')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()
const which = require('which')

which('jsipfs', (error, ipfs) => {
  if (error) {
    throw error
  }

  df.spawn({
    disposable: true,
    exec: ipfs
  }, async (err, node) => {
    if (err) {
      throw err
    }

    const options = {
      baseDir: '/tests/',
      ipfs: node.api
    }
    const store = await ipfsBlobStore(options)

    abstractBlobTests(test, {
      setup: async (t, cb) => {
        await store.ipfs.files.mkdir(options.baseDir, { p: true })
        cb(null, store)
      },
      teardown: async (t, store, blob, cb) => {
        await store.ipfs.files.rm(options.baseDir, { recursive: true })
        cb()
      }
    })

    // quick hack to stop the deamon
    // TODO clean up later
    setTimeout(function () {
      node.stop(() => {})
    }, 5000)
  })
})
