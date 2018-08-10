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

var common = {
  setup: async function (t, cb) {
    var options = {
      baseDir: '/tests/',
      port: 13000,
      host: '127.0.0.1'
    }
    var store = await ipfsBlobStore(options)

    store.ipfs.files.mkdir(options.baseDir, { p: true }, (err) => {
      if (err) {
        return console.error(err)
      }
      cb(null, store)
    })
  },
  teardown: function (t, store, blob, cb) {
    store.ipfs.files.rm(store.baseDir, { recursive: true }, (err) => {
      if (err) {
        return cb(err)
      }
      cb()
    })
  }
}
