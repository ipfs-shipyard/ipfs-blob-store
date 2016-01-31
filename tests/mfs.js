var test = require('tape')
var abstractBlobTests = require('abstract-blob-store/tests')
var ipfsBlobStore = require('../src')

var common = {
  setup: function (t, cb) {
    var options = {
      baseDir: '/tests/'
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

abstractBlobTests(test, common)
