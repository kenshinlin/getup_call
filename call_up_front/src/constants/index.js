import NebPay from 'nebpay.js'

// export const CONTRACT_ADDR = "n1iXfMNAsrerKzHFZjYXJUATtZpo6zLqEau" //测试网地址
export const CONTRACT_ADDR = "n1iybdLgDFffysHKY1JYyW6L8jiaaVACNTy" //合约地址

let depositAmount = 0.0001 //保证金
let brokenRangeAmount = 0.00001 //提成

let netHost = "https://testnet.nebulas.io"
let callbackUrl = NebPay.config.testnetUrl
let callEndHour = 11
let callStartHour = 6

if( true||process.env.NODE_ENV === 'production' ){
  netHost = "https://mainnet.nebulas.io"
  callbackUrl = NebPay.config.mainnetUrl
  depositAmount = 0.02
  brokenRangeAmount = 0.002
  callEndHour = 9
}
export const CALL_START_HOUR = callStartHour
export const CALL_END_HOUR = callEndHour
export const DEPOSIT_AMOUNT = depositAmount
export const BROKEN_RAGE_AMOUNT = brokenRangeAmount
export const NET_HOST = netHost

export const CALLBACK_URL = callbackUrl

export const IMG_HOST = "//kk.kenniu.top"


