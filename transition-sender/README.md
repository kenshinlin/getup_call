# 介绍 
通过transition-sender，你可以在安装了 Node 的机器调用智能合约，以及转账给其他账户


## 创建Sender实例
```
const TransactionSender = require('transition-sender')
const keystore = require('../keystore')  //replace your keystore file
const path = require('path')
/**
*	创建Sender实例
* 	@params {Object} keysore
*		keystore.keystore 你的密钥
*		keystore.password 你的密码
* @params {Object} contract
*	 	contract.function {String} 合约函数
*		contract.args {Array}	参数，如 ["astring", 123] //等
*	@params {String} logPath 日志地址, 默认在调起脚本的目录下
*	@params {String} logger  日志类型，默认file 枚举 console 或 file
*/
let sender = new TransactionSender({
	keystore,
	logPath: path.join(__dirname, 'contract.log')
})
```

## 调用合约
```
/**
* 调用合约 
*	@params {String} to	 合约地址，或交易对手方地址
*	@params {Object} contract 合约参数
*				contract.function 调用合约函数名 如 charge
*				contract.args 调用合约函数参数	如 ["astring", 123] //等
*	@field {Number} value	交易数额
* @return Promise 实例
*/
sender.call({
	contract:{
		function:"charge"
	},
	to: 'n1r6mc5iP6DKYwQ1vSLK7DqSry9b6tA5Mac'
})
.then( result=>console.log('调用成功',result))
.catch(e=>console.log('外层业务捕获调用失败信息',e))
```

## 转账
```
/**
* 转账
* @params {String} to	 合约地址，或交易对手方地址
*	@params {Number} value	交易数额
* @return Promise 实例
*/
sender.transfer({
	to: 'n1curAvehzbp9y2Lskts158u8aZdRSWycVV',
	value: 0.0001
}).then( result=>console.log('交易成功',result))
.catch(e=>console.log('外层业务捕获交易失败信息',e))
```

