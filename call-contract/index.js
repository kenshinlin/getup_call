const Nebulas = require('nebulas')
const log4js = require('log4js')
const config = require('./config')
const path = require('path')

let {Account, Neb, Transaction, HttpRequest} = Nebulas

function TransactionSender(options){
	options = {
		...config,
		...options
	}

	checkParmas(options)
	this.logger = setupLog(options)
	this.neb = setupNeb(options)
	this.account = setupAccount(options)
}

TransactionSender.prototype = {
	call,
	transfer,
	signTransaction,
	sendTX,
	queryTX
}

/**
 调用合约
 @params {Object}
	@field {String} to	 合约地址，或交易对手方地址
	@field {Object} contract 全约参数
				contract.function 调用合约函数名 如 charge
				contract.args 调用合约函数参数	如 ["astring", 123] //等
	@field {Number} value	交易数额
 @return Promise 实例
*/
function call({contract, to, value=0}){
	let {logger, account, neb } = this

	logger.info('开始，当前时间', new Date() )
	logger.info('请求最新 nonce ...')

	if( !to ){
		throw 'options.to is required'
	}

	const address = account.getAddressString()
	return neb.api.getAccountState({address})
		.then(({nonce})=>this.signTransaction({contract, to, value, nonce}))
		.then(txHash=>this.sendTX(txHash))
		.catch(e=>{
			logger.error('捕捉执行失败，',e)
			throw e //交失败再抛出到外层
		})
}


/**
 * 转账
 * @param {String} to 交易对手方
 */
function transfer({to, value}){
	return this.call({to, value})
}

function signTransaction({contract, to, value, nonce}) {
	let {logger, account, neb } = this

	logger.info('得到nonce，进行交易签名', nonce)

	let options = {
			chainID: 1,
     	from: account,
     	to,
     	value,
     	nonce: nonce*1+1,
     	gasPrice: 1000000,
     	gasLimit: 2000000
    }

	if( contract && contract.function ){
		try{
			options.contract = {
				function: contract.function,
				args: JSON.stringify(args)
			}
		}catch(e){
			throw 'JSON.stringify contract.args error， plear make sure it is JSON object'
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
	let {logger, account, neb } = this

	logger.info('向主网发起交易请求...')
	return neb.api.sendRawTransaction({data:tx.toProtoString()})
		.then(({txhash})=>{
			logger.info(`交易请求发送成功，得到 txhash 为 ${txhash} ，请等待交易结果...`)
			return this.queryTX( txhash )
		})	
}

function queryTX(txHashString) {
	let {logger, account, neb } = this

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


function setupLog(options){
	if( options.logger ==='console' ){
		logger = console
	}else{
		log4js.configure({
			appenders: { cheese: { type: 'file', filename: options.logPath } },
			categories: { default: { appenders: ['cheese'], level: 'DEBUG' } }
		})
		logger = log4js.getLogger('cheese')
	}
}

function checkParmas(options){
	let keyConf = options.keystore
	let {keystore, password} = keyConf

	if( keyConf ){
		throw 'keystore is required'
	}

	if( !keyConf.keystore ){
		throw 'keystore.keystore is required'
	}
}

function setupNeb(options){
	let neb = new Neb()
	const netUrl = options.netUrl||"https://mainnet.nebulas.io"
	neb.setRequest(new HttpRequest(netUrl))
	return neb
}

function setupAccount(options){
	let {keystore, password} = options.keystore
	let account = Account.NewAccount()
	account.fromKey(keystore, password)
	return account
}

module.exports = TransactionSender
