var test = require('tape')
var abstractBlobTests = require('abstract-blob-store/tests')
var ipfsBlobStore = require('../index.js')

var common = {
  setup: function (t, cb) {
    var store = ipfsBlobStore().mfs
    cb(null, store)
  },
  teardown: function (t, store, blob, cb) {
    cb()
  }
}

abstractBlobTests(test, common)
