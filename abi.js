const nodeAbi = require('node-abi')
 
console.log(nodeAbi.getAbi('10.15.1', 'node'))
// '51'
console.log(nodeAbi.getAbi('7.1.9', 'electron'))