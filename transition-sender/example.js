const TransactionSender = require('./index')
const keystore = require('../keystore')  //replace your keystore file
const path = require('path')

/**
 调用合约，往合约写数据
 @params {Object}
 	@field {String} func 	合约函数
	@field {Array} 	args 	参数，如 ["astring", 123] //等
	@field {Number} value	合约的数额
	@field {String} contractAddress 合约地址
	@field {string} logPath 日志地址 
	#field {String} logger	日志类型，枚举 console 或 file
*/
let sender = new TransactionSender({
	keystore,
	logPath: path.join(__dirname, 'contract.log')
})



/**
 调用合约，或交易 
 @params {Object}
	@field {String} to	 合约地址，或交易对手方地址
	@field {Object} contract 全约参数
				contract.function 调用合约函数名 如 charge
				contract.args 调用合约函数参数	如 ["astring", 123] //等
	@field {Number} value	交易数额
 @return Promise 实例
*/
sender.call({
	contract:{
		function:"charge"
	},
	to: 'n1r6mc5iP6DKYwQ1vSLK7DqSry9b6tA5Mac'
}).then( result=>console.log('调用成功',result))
	.catch(e=>console.log('外层业务捕获调用失败信息',e))


// sender.transfer({
// 	to: 'n1curAvehzbp9y2Lskts158u8aZdRSWycVV',
// 	value: 0.0001
// }).then( result=>console.log('交易成功',result))
// .catch(e=>console.log('外层业务捕获交易失败信息',e))