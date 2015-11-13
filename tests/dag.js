var test = require('tape')
var abstractBlobTests = require('abstract-blob-store/tests')
var ipfsBlobStore = require('../index.js')

var common = {
  node: undefined,
  setup: function (t, cb) {
    var store = ipfsBlobStore().dag
    cb(null, store)
  },
  teardown: function (t, store, blob, cb) {
    this.node.stop(cb)
  }
}

abstractBlobTests(test, common)
