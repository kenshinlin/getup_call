const TransactionSender = require('transaction-sender')
const keystore = require('./keystore')  //replace your keystore file
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
	logPath: path.join(__dirname, 'transaction-sender.log')
})

sender.call({
  contract:{function:"charge"},
	to: 'n1r6mc5iP6DKYwQ1vSLK7DqSry9b6tA5Mac'
})