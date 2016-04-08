var test = require('tape')
var abstractBlobTests = require('abstract-blob-store/tests')
var ipfsBlobStore = require('../src')
var ipfsd = require('ipfsd-ctl')

ipfsd.disposable({
  apiAddr: '/ip4/127.0.0.1/tcp/13000',
  init: true
}, (err, node) => {
  if (err) {
    throw err
  }
  node.startDaemon((err) => {
    if (err) {
      throw err
    }
    abstractBlobTests(test, common)
    // quick hack to stop the deamon
    // TODO clean up later
    setTimeout(function () {
      node.stopDaemon(() => {})
    }, 5000)
  })
})

var common = {
  setup: function (t, cb) {
    var options = {
      baseDir: '/tests/',
      port: 13000
    }
    var store = ipfsBlobStore(options)

    store.ipfsCtl.files.mkdir(options.baseDir, { p: true }, function (err) {
      if (err) {
        return console.error(err)
      }
      cb(null, store)
    })
  },
  teardown: function (t, store, blob, cb) {
    store.ipfsCtl.files.rm(store.baseDir, { 'recursive': true }, function (err) {
      if (err) {
        return cb(err)
      }
      cb()
    })
  }
}
