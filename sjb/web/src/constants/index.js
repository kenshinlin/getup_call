import NebPay from 'nebpay.js'

// 3233322bf92588c8449966c00a5552d1b8f0ae3152c075426a55cca790f8647e
// export const CONTRACT_ADDR = "n1gouQqP8F5jFY44GFEBobionEHdhXwPeua" //测试地址
export const CONTRACT_ADDR = "n1hk41vZnPgKHRchHS4pNXPrz2uc6YLARXZ" //生产地址

export const ADMIN_ADDR = "n1UcTy4H1c8U1bsmdtjLLEszfvicxdUW6mL" //管理员地址

export const BROKEN_RAGE = 5

let netHost = "https://testnet.nebulas.io"
let callbackUrl = NebPay.config.testnetUrl

if( true||process.env.NODE_ENV === 'production' ){
  netHost = "https://mainnet.nebulas.io"
  callbackUrl = NebPay.config.mainnetUrl
}
export const NET_HOST = netHost
export const CALLBACK_URL = callbackUrl
export const IMG_HOST = "//kk.kenniu.top"


