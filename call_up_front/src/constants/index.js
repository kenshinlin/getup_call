import NebPay from 'nebpay.js'

// export const CONTRACT_ADDR = "n1kHXqxyD8Ea6WVCMsZREGngeJpjLSD6NZ2" //测试网地址
export const CONTRACT_ADDR = "n1jSSu2fzu2CuXvmc4U4ZdnFfp5GtXeKDo9" //合约地址

let depositAmount = 0.01 //保证金
let brokenRangeAmount = 0.001 //提成

let netHost = "https://testnet.nebulas.io"
let callbackUrl = NebPay.config.testnetUrl
let callEndHour = 8
let callStartHour = 6

if( process.env.NODE_ENV === 'production' ){
  netHost = "https://mainnet.nebulas.io"
  callbackUrl = NebPay.config.mainnetUrl
  depositAmount = 0.01
  brokenRangeAmount = 0.001
  callEndHour = 8
}
export const CALL_START_HOUR = callStartHour
export const CALL_END_HOUR = callEndHour
export const DEPOSIT_AMOUNT = depositAmount
export const BROKEN_RAGE_AMOUNT = brokenRangeAmount
export const NET_HOST = netHost

export const CALLBACK_URL = callbackUrl

export const IMG_HOST = "//kk.kenniu.top"


