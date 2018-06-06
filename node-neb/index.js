const Nebulas = require('nebulas')
const keyConf = require('../keystore/keystore')
const log4js = require('log4js')
const config = require('./config')
const path = require('path')

let {Account, Neb, Transaction, HttpRequest} = Nebulas
let {keystore, password} = keyConf
let logger

if( config.logger ==='console' ){
	logger = console
}else{
	log4js.configure({
	  appenders: { cheese: { type: 'file', filename:  path.join( __dirname, 'cheese.log') } },
	  categories: { default: { appenders: ['cheese'], level: 'DEBUG' } }
	})
	logger = log4js.getLogger('cheese')
}

const contractAddress = config.contractAddress

const neb = new Neb()
const netUrl = config.netUrl||"https://mainnet.nebulas.io"
neb.setRequest(new HttpRequest(netUrl))

const account = Account.NewAccount()
account.fromKey(keystore, password)
const address = account.getAddressString()

/**
 调用合约
 @params {Object}
 	@field {String} func 	合约函数
	@field {Array} 	args 	参数，如 ["astring", 123] //等
	@field {Number} value	合约的数额
 @return Promise 实例
*/
function callContract({func, args=[], value=0}){
	return neb.api.getAccountState({address})
		.then(({nonce})=>signTransaction({func, args, value, nonce}))
		.then(txHash=>sendTX(txHash))
}

function signTransaction({func, args, value, nonce}) {
	logger.info('得到nonce，进行交易签名', nonce)

	let options = {
		chainID: 1,
     	from: account,
     	to: contractAddress,
     	value: value,
     	nonce: nonce*1+1,
     	gasPrice: 1000000,
     	gasLimit: 2000000
    }

	if( func ){
		options.contract = {
			function: func,
			args: JSON.stringify(args)
		}
	}

	// return Promise.all([
	// 	neb.api.gasPrice(),
	// 	neb.api.estimateGas( options )
	// ]).then(result=>{
	// 	logger.info('result', result)

	// 	let {gas_price} = result[0]
	// 	let {gas} = result[1]

	// 	options.gasPrice = gas_price
	// 	options.gasLimit = gas
		let tx = new Transaction(options)
		logger.info('交易已签名')
	    tx.signTransaction()
	    return tx
	// })
}

function sendTX(tx) {
	logger.info('向主网发起交易请求...')
	return neb.api.sendRawTransaction({data:tx.toProtoString()})
		.then(({txhash})=>{
			logger.info(`交易请求发送成功，得到 txhash 为 ${txhash} ，请等待交易结果...`)
			return queryTX( txhash )
		})	
}

function queryTX(txHashString) {
	function q(txHashString, retry=0, resolve, reject ) {
		if( retry > 10 ){
			logger.info('重试超过10次，仍没有结果，可能已经失败，请检查')
			return reject({msg:'重试超过10次，仍没有结果，可能已经失败，请检查'})
		}

		setTimeout(()=>{
			neb.api.getTransactionReceipt({hash:txHashString})
				.then(result=>{
					let {status, execute_result, execute_error} = result
					// 0 failed, 1 success, 2 pending.
					if( status == 0 ){
						logger.error('交易失败', new Date(), execute_error, execute_result)
						reject({execute_error, execute_result})
					}else if( status == 1){
						logger.info('交易成功', new Date())
						resolve(result)
					}else{
						logger.info('pengding，继续查询...')
						return q(txHashString, ++retry, resolve, reject)
					}
				})
				.catch(e=>{
					logger.warn('warn: 查询失败，正在重试中，失败信息：', e)
					q(txHashString, ++retry, resolve, reject)
				})	
		}, 6000)
	}

	return new Promise((resolve, reject)=>q( txHashString, 0, resolve, reject ))
}



function init( options ) {
	logger.info('开始，当前时间', new Date() )
	logger.info('请求最新 nonce ...')
	return callContract(options)
		.catch(e=>{
			logger.error('捕捉执行失败，',e)
			throw e //交失败再抛出到外层
		})
}

module.exports = init
