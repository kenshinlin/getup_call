import {CONTRACT_ADDR, NET_HOST, DEPOSIT_AMOUNT, CALLBACK_URL} from '../constants/'
import {Account, Neb, HttpRequest} from "nebulas"
import NebPay from 'nebpay.js'
import Cookies from 'js-cookie'

const accountForFetch = Account.NewAccount()
const addressForFetch = accountForFetch.getAddressString()
const neb = new Neb()
const nebPay = new NebPay()

neb.setRequest(new HttpRequest(NET_HOST))

//发送交易(发起智能合约调用)
export const simulateCall = options=>
  neb.api.getAccountState({address:addressForFetch})
    .then(json=>{
      let nonce = (json.nonce*1)+1
      return neb.api.call({
        from: addressForFetch,
        to: CONTRACT_ADDR,
        value:0,
        nonce,
        gasPrice: 1000000,
        gasLimit: 2000000,
        contract:{
          function: options.function,
          args: JSON.stringify(options.args||[])
        }
      })
    }).then(res=>JSON.parse(res.result))


export const callContract = options=>{
  let to = CONTRACT_ADDR;   //Dapp的合约地址
  let value = options.value;
  let callFunction = options.function;
  let callArgs =  JSON.stringify(options.args||[]) 
  let config = {
      qrcode: {
        showQRCode: false
      },
      callback: CALLBACK_URL, 
      listener:(resp)=>{
        console.log('callContract', resp)
        if( resp.txhash ){
          queryTxResult(resp.txhash, options.success, options.error)
        }else{
          options.error(resp)
        }
      }
  }
  nebPay.call(to, value, callFunction, callArgs, config);
}

const queryTxResult = (hash, success, errCB)=>{
  neb.api.getTransactionReceipt({hash})
    .then(res=>{
      console.log('queryTxResult', res)
      let {status} = res
      if( res.from ){
        console.log('set cookie', res.from)
        Cookies.set('nas_wallet_address', res.from, 365 ) //一年有效的cookie
      }

      if( status == 0 ){
        return errCB&&errCB( res.execute_result )
      }else if(status == 1){
        success && success(res)
      }else if( status == 2 ){
        window.setTimeout( ()=>queryTxResult( hash, success, errCB), 6000 )//3秒后再查
      }
    })
}
    