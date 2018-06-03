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

export const today = ( t )=>{
	let now = t||new Date()
	return [now.getFullYear(), toDateNumString(now.getMonth()+1), toDateNumString(now.getDate())].join('-')
}

export const toDateNumString = (num)=>('000'+num).substr(-2)

export const formatTime = (date, needTime=false)=>{
	date = new Date(date) || new Date
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()

	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()

	if( needTime === true){
		return [year, ...[month, day].map(toDateNumString)].join('-') + ' ' + [hour, minute].map(toDateNumString).join(':')		
	}
	return [year, ...[month, day].map(toDateNumString)].join('-')
}

export const isWechat = ()=>{
  var ua = window.navigator.userAgent.toLowerCase();
  //通过正则表达式匹配ua中是否含有MicroMessenger字符串
  return ua.match(/MicroMessenger/i) == 'micromessenger'
}