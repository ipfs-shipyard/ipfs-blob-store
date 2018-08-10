# ipfs-blob-store

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square)
[![Dependency Status](https://david-dm.org/ipfs-shipyard/ipfs-blob-store.svg?style=flat-square)](https://david-dm.org/ipfs-shipyard/ipfs-blob-store)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![npm](https://img.shields.io/npm/v/ipfs-blob-store.svg?style=flat-square)](http://npmjs.com/package/ipfs-blob-store)

> An abstract-blob-store compatible implementation built using IPFS as the storage backend

Implements the [abstract-blob-store](https://github.com/maxogden/abstract-blob-store), using IPFS for storage.

![](https://github.com/maxogden/abstract-blob-store/raw/master/badge.png)

## Install

```js
npm install ipfs-blob-store
```

## Usage

`ipfs-blob-store` uses the [IPFS Files API](#) to create the abstraction of a mutable filesystem over snapshots of Merkle DAGs (per mutation). You'll need to use the Files API directly to get the `/ipfs/Qm...` address of the filesystem root so that other IPFS nodes can retrieve it.

It requires an IPFS node to run - you can either specify a host/port combination to connect to a remote daemon, pass an instance of [`ipfs`](https://www.npmjs.com/package/ipfs) or nothing at all to have the blob store manage it's own IPFS node.

### Self-managed IPFS node

```JavaScript
const ipfsBlobStore = require('ipfs-blob-store')

const store = await ipfsBlobStore()

store.exists('/my-file.txt', (error, exists) => {
  // ...
})
```

### Pre-configured IPFS node

```JavaScript
const ipfsBlobStore = require('ipfs-blob-store')
const IPFS = require('ipfs')

const node = new IPFS({
  // some config here
})

node.once('ready', () => {
  const store = await ipfsBlobStore({
    ipfs: node
  })

  store.exists('/my-file.txt', (error, exists) => {
    // ...
  })
})
```

### Remote IPFS daemon

```JavaScript
const ipfsBlobStore = require('ipfs-blob-store')

const store = await ipfsBlobStore({
  host: '127.0.0.1',
  port: 5001
})

store.exists('/my-file.txt', (error, exists) => {
  // ...
})
```

### Options

```JavaScript
var options = {
  ipfs: null, // an instance of ipfs or ipfs-api
  port: 5001,   // default value
  host: '127.0.0.1', // default value
  baseDir: '/', // default value
  flush: true  // default value
}

const store = await ipfsBlobStore(options)
```

### API

See [abstract-blob-store](https://www.npmjs.com/package/abstract-blob-store) for the blob store API.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/ipfs-blob-store/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT
