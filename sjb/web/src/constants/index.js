import NebPay from 'nebpay.js'

export const CONTRACT_ADDR = "n1xhprRdsm3xj6pHzt9G5WqD5eHEhAjPMCV" //合约地址

export const BROKEN_RAGE = 5

let netHost = "https://testnet.nebulas.io"
let callbackUrl = NebPay.config.testnetUrl

if( process.env.NODE_ENV === 'production' ){
  netHost = "https://mainnet.nebulas.io"
  callbackUrl = NebPay.config.mainnetUrl
}
export const NET_HOST = netHost
export const CALLBACK_URL = callbackUrl
export const IMG_HOST = "//kk.kenniu.top"


