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
        // console.log('callContract', resp)
        // if( resp.txhash ){
        //   queryTxResult(resp.txhash, options.success, options.error)
        // }else{
        //   options.error(resp)
        // }
      }
  }
  console.log('contract config', config, NebPay.config.mainnetUrl)
  let serialNumber= nebPay.call(to, value, callFunction, callArgs, config);
  setTimeout(()=>queryPayInfo( serialNumber, options.success, options.error, options.onRefetch ), 6000)
}

const queryPayInfo = (serialNumber, success, errCB, onRefetch, fetchCount=0 )=>{

  // 重试50次，没有返回认为失败，约2分钟
  if( ++fetchCount > 20 ){
    console.log('fetchCount', fetchCount)
    return errCB('提交区块链失败')
  }
  onRefetch( fetchCount )
  nebPay.queryPayInfo(serialNumber)   //search transaction result from server (result upload to server by app)
    .then( resp=>{
        console.log("tx result: " + resp)   //resp is a JSON string
        var respObject = JSON.parse(resp)
        if(respObject.code === 0){
            //The transaction is successful 
          let data = respObject.data
          if( data.from ){
            Cookies.set('nas_wallet_address', data.from, 365 ) //一年有效的cookie
          }
          if( data.status === 1 ){
            success&&success(data)
          }else if( data.status === 2){
            window.setTimeout(()=>queryPayInfo( serialNumber, success, errCB, onRefetch, fetchCount), 6000)
          }else{
            errCB&&errCB( data.execute_result )
          }
        }else {
          if( respObject.msg.indexOf('does not exist')>0 ){
            window.setTimeout(()=>queryPayInfo( serialNumber, success, errCB,onRefetch,fetchCount), 6000)
          }else{
            errCB&&errCB( respObject.msg )
          }
        }
    })
    .catch(err=>{
        console.log(err)
    });
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

export const formatTime = (date, needTime=false, needYear=true)=>{
	date = new Date(date) || new Date
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()

	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()

  var ret
	if( needTime === true){
		ret = [year, ...[month, day].map(toDateNumString)].join('-') + ' ' + [hour, minute].map(toDateNumString).join(':')		
	}else{
    ret= [year, ...[month, day].map(toDateNumString)].join('-')
  }
  return needYear? ret :ret.replace(year+'-', '')
}

export const isWechat = ()=>{
  var ua = window.navigator.userAgent.toLowerCase();
  //通过正则表达式匹配ua中是否含有MicroMessenger字符串
  return ua.match(/MicroMessenger/i) == 'micromessenger'
}

export function fixedNumber(num){
  return Math.round( num * 10000 )/10000
}