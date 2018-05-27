export function formatTime(date, needTime=false) {
	date = new Date(date) || new Date
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()

	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()

	if( needTime === true){
		return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')		
	}
	return [year, month, day].map(formatNumber).join('-')
}

export function showErrorMsg(msg) {
	wx.showModal({
    	title: '提示',
    	content: msg,
    	showCancel: false
  	})
}

export function showSuccMsg(msg) {
	wx.showToast({
	  	title: msg,
	  	icon: 'success',
	  	duration: 1000
	})
}

export function confirm({
		title='提示', 
		content, 
		cancelText='取消', 
		confirmText='确定',
		onOK,
		onNO
	}) {

	wx.showModal({
		title,
		content,
		cancelText,
		confirmText,
		success:res=>{
			if( res.confirm ){
				onOK()
			}else if( res.cancel ){
				onNO && onNO()
			}
		}
	})
}

export function formatNumber(n) {
	n = n.toString()
	return n[1] ? n : '0' + n
}

export function fixedNumber(num) {
	if( isNaN(num) ){
		return '--'
	}
	return Math.round(num*100)/100
}

export const autoIncrementID = (() => {
	let _id = 0
	return () => ++_id
})()


let host = 'https://stu.kenniu.top/'
let urlPrefix = host + 'nahuo_'

function wxAlert(msg){

    showErrorMsg(msg)
}

function request(options, app) {
	let g = app.globalData

	options.noShowLoading !== true && wx.showLoading()

	let {header={}} = g

	wx.request({

		url: urlPrefix + options.url +'?sid='+ app.globalData.sid,

		data: Object.assign({
			openid: app.globalData.openid
		}, options.data),

		header:{
			// Cookie: header.Cookie
		},

		method: options.method,

		success: res => {
			wx.hideLoading()
			
			if (res.statusCode != 200) return wxAlert('请求失败');

			let data = res.data;

			let {header={}} = app.globalData
			header.Cookie = res.header['set-cookie']||data.sid

			app.globalData.sid = data.sid

			if( header.Cookie ){
				app.globalData.header = header
			}

			// 正确
			if (data.code == 0) {
				options.success(data.data)
				if( options.successTip ){
					wx.showToast({
					  	title: options.successTip,
					  	icon: 'success',
					  	duration: 1000
					})
				}
			} else {
				if (options.error) {
					options.error(data.msg || '请求失败', data.code)
				} else {
					wxAlert(data.msg || '请求失败')
				}
			}
		},
		fail: function(data) {
			wx.hideLoading()

			if (options.error) {
				options.error('请求失败')
			} else {
				wxAlert('请求失败')
			}
		},
		complete: e => {
			options.complete && options.complete()
		}
	})
}


export const http = {
	get: function(options, app) {
		 return request( Object.assign({},options, {method:'GET'}), app)
	},

	post: function(options, app) {
		 return request( Object.assign({},options, {method:'POST'}), app)
	},

	upload: function(options) {
		let t = wx.uploadFile({
			url: urlPrefix + 'upload/fileupload',
			filePath: options.filePath,
			name: 'upfile',
			success: res => {
				let data = res.data

				if (typeof data == 'string') {
					try {
						data = JSON.parse(data)
					} catch (e) {
						return options.error(e)
					}
				}

				data.url = host + data.url

				options.success(data)
			},
			error: err => {}
		})

		return t.onProgressUpdate((res) => {
			options.progress(res)
				// console.log('上传进度', res.progress)
				// console.log('已经上传的数据长度', res.totalBytesSent)
				// console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
		})
	}
}