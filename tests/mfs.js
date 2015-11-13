var test = require('tape')
var abstractBlobTests = require('abstract-blob-store/tests')
var ipfsBlobStore = require('../index.js')

var common = {
  setup: function (t, cb) {
    var store = ipfsBlobStore().mfs

    store.baseDir = '/tests/'

    store.node.files.mkdir(store.baseDir, { p: true }, function (err) {
      if (err) {
        return console.error(err)
      }
      cb(null, store)
    })
  },
  teardown: function (t, store, blob, cb) {
    store.node.files.rm(store.baseDir, { 'r': true }, function (err) {
      if (err) {
        return cb(err)
      }
      cb()
    })
  }
}

abstractBlobTests(test, common)
