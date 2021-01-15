import * as SmartWeaveSdk from 'smartweave']


const input = { function: 'propose' }


//main manual call
const state = await smartweave.interactRead(arweave, wallet, contract.id, input);
