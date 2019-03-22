'use strict'

var ipfsBlobStore = require('../src')

ipfsBlobStore().then(store => {
  /*
  process.stdin.pipe(store.createWriteStream('test/2/3/4', function (err, metadata) {
    if (err) {
      // console.log(err)
    }

    console.log(metadata)
  }))
  */
  store.createReadStream('test/2/3/4').pipe(process.stdout)
})
