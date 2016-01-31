ipfs-blob-store
===============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
![Build Status](https://travis-ci.org/ipfs/ipfs-blob-store.svg?style=flat-square)](https://travis-ci.org/ipfs/ipfs-blob-store)
![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square)
[![Dependency Status](https://david-dm.org/ipfs/ipfs-blob-store.svg?style=flat-square)](https://david-dm.org/ipfs/ipfs-blob-store)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Implements the [abstract-blob-store](https://github.com/maxogden/abstract-blob-store) API, built on top of IPFS.

![](https://github.com/maxogden/abstract-blob-store/raw/master/badge.png)

# Usage

```JavaScript
var ipfsBlobStore = require('ipfs-blob-store')

var options = {
  port: 5001,   // default value
  host: '127.0.0.1' // default value
  baseDir: '/', // default value
  flush: true  // default value
}

var store = ipfsBlobStore(options)
// then use abstract-blob-store interface
```
