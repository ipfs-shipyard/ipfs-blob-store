var stream = require('stream')
var async = require('async')

var Node = function () {
  this.Links = []
  this.Data = new Buffer('')
}

var Link = function () {
  this.Hash = ''
  this.Size = 0
  this.Name = ''
}

module.exports = function (node) {
  var store = {}
  var root = new Node()
  var root_hash = ''
  var map = {}

  store.createWriteStream = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (typeof opts === 'function') return store.createWriteStream(null, opts)
    if (typeof opts === 'undefined' || opts === null) opts = {}

    var bufferStream = new stream.PassThrough()
    var buffer

    bufferStream.on('data', function (chunk) {
      if (!buffer) buffer = chunk
      else {
        buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length)
      }
    })

    bufferStream.on('end', function () {
      var blob = new Node()
      blob.Data = buffer.toString()
      async.waterfall([
        function (callback) {
          var raw = new Buffer(JSON.stringify(blob))
          node.object.put(raw, 'json', callback)
        },
        function (res, callback) {
          node.object.stat(res.Hash, function (err, stat) {
            callback(err, res, stat)
          })
        },
        function (res, stat, callback) {
          var link = new Link()

          link.Hash = res.Hash
          link.Size = stat.CumulativeSize
          link.Name = opts.key || res.Hash

          root.Links = root.Links.filter(function (item) {
            return item.Name !== opts.key
          })

          root.Links.push(link)

          root.Data = root_hash
          var raw = new Buffer(JSON.stringify(root))
          node.object.put(raw, 'json', function (err, new_root) {
            callback(err, link, new_root)
          })
        }, function (link, new_root, callback) {
          map[opts.key] = true

          callback(null, {
            key: link.Name,
            root: new_root.Hash,
            hash: link.Hash,
            size: link.Size
          })

          root_hash = new_root.Hash
        }
      ], function (err, meta) {
        if (err) return cb(err)
        cb(null, meta)
      })
    })

    return bufferStream
  }

  store.createReadStream = function (opts) {
    if (typeof opts === 'string') {
      opts = {key: opts}
    }

    var bufferStream = new stream.PassThrough()
    node.object.data((opts.root || root_hash) + '/' + opts.key, function (err, stream) {
      if (err && !stream) return bufferStream.emit('error', err)
      stream.pipe(bufferStream)
    })

    return bufferStream
  }

  store.exists = function (opts, cb) {
    if (typeof opts === 'string') {
      opts = {key: opts}
    }
    if (!root_hash) {
      return cb(null, false)
    }

    node.object.stat((opts.root || root_hash) + '/' + opts.key, function (err, stat) {
      if (err) {
        cb(null, false)
      } else {
        cb(null, true)
      }
    })
  }

  store.remove = function (opts, cb) {
    async.waterfall([
      function (callback) {
        root.Links = root.Links.filter(function (item) {
          return item.Name !== opts.key
        })

        root.Data = root_hash
        var raw = new Buffer(JSON.stringify(root))
        node.object.put(raw, 'json', function (err, new_root) {
          callback(err, new_root)
        })
      },
      function (new_root, callback) {
        map[opts.key] = false

        callback(null, true)

        root_hash = new_root.Hash
      }
    ], function (err, meta) {
      if (err) {
        return cb(err, false)
      }
      cb(null, meta)
    })
  }

  return store
}
