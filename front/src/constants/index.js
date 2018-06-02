import NebPay from 'nebpay.js'

export const CONTRACT_ADDR = "n1vxpUMj6kKVJH8GtoCnR5MK2kCXFtjrM4r" //合约地址
export const DEPOSIT_AMOUNT = 0.0001 //保证金
export const BROKEN_RAGE_AMOUNT = 0.00001 //提成

let netHost = "https://testnet.nebulas.io"
let callbackUrl = NebPay.config.testnetUrl

if( process.env.NODE_ENV === 'production' ){
  netHost = "https://mainnet.nebulas.io"
  callbackUrl = NebPay.config.mainnetUrl
}
export const NET_HOST = netHost

export const CALLBACK_URL = callbackUrl

