'use strict'

const stream = require('stream')
const path = require('path')
const log = require('debug')('ipfs:blob-store:mfs')

module.exports = function (options) {
  const store = {}
  store.baseDir = options.baseDir || '/'

  if (!store.baseDir.endsWith('/')) {
    store.baseDir += '/'
  }

  const ipfs = options.ipfs
  store.ipfs = ipfs
  if (typeof options.flush === 'boolean' && options.flush === false) {
    // let it as it is
  } else {
    options.flush = true
  }

  store.createWriteStream = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name
    if (!cb) cb = noop

    const writePath = normalisePath(store.baseDir + opts.key)
    const bufferStream = new stream.PassThrough()

    let size = 0

    bufferStream.on('data', (buffer) => {
      size += buffer.length
    })

    ipfs.files.write(writePath, bufferStream, {
      create: true,
      parents: true,
      flush: options.flush
    })
      .then(() => {
        cb(null, {
          key: opts.key,
          size: size,
          name: path.basename(writePath)
        })
      })
      .catch(error => {
        cb(error)
      })

    return bufferStream
  }

  store.createReadStream = function (opts) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name

    const readPath = normalisePath(store.baseDir + opts.key)

    log(`read ${readPath}`)
    const readableStream = ipfs.files.readReadableStream(readPath)

    readableStream.on('error', (error) => {
      if (error.toString().indexOf('does not exist') > -1 || error.toString().indexOf('Not a directory') > -1) {
        error.notFound = true
      }
    })

    return readableStream
  }

  store.exists = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name
    if (!cb) cb = noop

    const statPath = normalisePath(store.baseDir + opts.key)

    log(`stat ${statPath}`)
    ipfs.files.stat(statPath, {}, (error) => {
      if (error) {
        if (error.toString().indexOf('does not exist') > -1 || error.toString().indexOf('Not a directory') > -1) {
          return cb(null, false)
        }

        return cb(error)
      }

      cb(null, true)
    })
  }

  store.remove = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name
    if (!cb) cb = noop

    const rmPath = normalisePath(store.baseDir + opts.key)

    log(`rm ${rmPath}`)
    ipfs.files.rm(rmPath, cb)
  }

  return store
}

function noop () {}

function normalisePath (path) {
  return path.replace(/\/(\/)+/g, '/')
}
