ipfs-blob-store
===============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
![Build Status](https://travis-ci.org/ipfs/ipfs-blob-store.svg?style=flat-square)](https://travis-ci.org/ipfs/ipfs-blob-store)
![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square)
[![Dependency Status](https://david-dm.org/ipfs/ipfs-blob-store.svg?style=flat-square)](https://david-dm.org/ipfs/ipfs-blob-store)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Implements the [abstract-blob-store](https://github.com/maxogden/abstract-blob-store), using IPFS for storage.

![](https://github.com/maxogden/abstract-blob-store/raw/master/badge.png)

# Caveats

`ipfs-blob-store` today requires a running [IPFS daemon](https://github.com/ipfs/go-ipfs/) to talk to over HTTP. This module will be able to be entirely self-contained once [js-ipfs](https://github.com/ipfs/js-ipfs) is complete.

`ipfs-blob-store` uses the [IPFS Files API](#) to create the abstraction of a mutable filesystem over snapshots of Merkle DAGs (per mutation). You'll need to use the Files API directly to get the `/ipfs/Qm...` address of the filesystem root so that other IPFS nodes can retrieve it.

# Usage

```JavaScript
var ipfsBlobStore = require('ipfs-blob-store')

var options = {
  port: 5001,   // default value
  host: '127.0.0.1', // default value
  baseDir: '/', // default value
  flush: true  // default value
}

var store = ipfsBlobStore(options)

var ws = store.createWriteStream({
  key: 'some/path/file.txt'
})

ws.write('hello world\n')
ws.end(function() {
  var rs = store.createReadStream({
    key: 'some/path/file.txt'
  })

  rs.pipe(process.stdout)
})
```
