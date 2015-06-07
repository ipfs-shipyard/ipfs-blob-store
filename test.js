var test = require('tape')
var abstractBlobTests = require('abstract-blob-store/tests')
var blobs = require('./')
var ipfsd = require('ipfsd-ctl')

var common = {
  node: undefined,
  setup: function (t, cb) {
    ipfsd.disposable(function(err, node) {
      if(err) return cb(err)
      this.node = node
      var store = blobs({
        host: node.opts['Addresses.API']
      })
      cb(null, store)
    }.bind(this))
  },
  teardown: function (t, store, blob, cb) {
    this.node.stop(cb)
  }
}

abstractBlobTests(test, common)
