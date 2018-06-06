const callContract = require('./index')

/**
 调用合约，往合约写数据
 @params {Object}
 	@field {String} func 	合约函数
	@field {Array} 	args 	参数，如 ["astring", 123] //等
	@field {Number} value	合约的数额
*/
callContract({func:"charge"})
	.then( result=>console.log('调用成功',result))
	.catch(e=>console.log('外层业务捕获失败信息',e))