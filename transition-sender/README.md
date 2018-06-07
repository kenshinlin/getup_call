1. 保存keystore，其相对于 main.js 的位置是 ../keystore/keystore，内容如下
```
	const keystore = {/*你的keystore内容*/}
	const password = 'your password'
	module.exports = {keystore, password}
```
2. 修改 config.js 配置项
3. 执行 npm install（如果执行太久，可以试试 npm install --registry=https://registry.npm.taobao.org）
4. 执行 npm run test