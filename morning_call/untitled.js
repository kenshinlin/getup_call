
'use strict';

var NAS_CELL = 1000000000000000000;
var DEPOSIT_AMOUNT = 0.0001; // 0.05NAS
var DEPOSIT = new BigNumber(DEPOSIT_AMOUNT * NAS_CELL);
var BROKEN_RAGE_AMOUNT = 0.00001; //提成0.01NAS
var BROKEN_RAGE = new BigNumber(BROKEN_RAGE_AMOUNT * NAS_CELL);

var CALL_START_HOUR = 6; // 开始打卡时间
var CALL_END_HOUR = 8;	 //打卡结束时间
var CHARGE_DELAY = 20*60*1000; //每天清算时间，相对于打卡结束时间的时延

function toDate( dateStr ){
	return !!dateStr?new Date(dateStr):0
}

function today(){
	var now = new Date()
	return [now.getFullYear(), toDateNumString(now.getMonth()+1), toDateNumString(now.getDate())].join('-')
}

function toDateNumString(num){
	return ('000'+num).substr(-2);
}

var User = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;  
        this.balance = obj.balance;						//账户余额  	
        this.avatar = obj.avatar;
        this.username = obj.username;	
        this.openid = obj.openid;	
        this.callRecords = obj.callRecords;					//打卡次数
        this.payRecords = obj.payRecords;					//支付次数
        this.callAt = toDate(obj.callAt); 				//打卡时间
        this.payDepositAt = toDate(obj.payDepositAt);	//支付保证金的时间
        this.createAt = toDate(obj.createAt);			//加入时间
    } else {
        this.address = "";
        this.avatar = "";
        this.openid = "";
        this.username = "";
        this.callRecords = [];
        this.payRecords = [];
        this.callAt = 0;
        this.payDepositAt = 0;
        this.balance = 0;
        this.createAt = new Date();
    }
};

User.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var MorningCall = function() {

	// 所有参加过挑战的用户
	LocalContractStorage.defineProperty(this, "userPoolSize");
	LocalContractStorage.defineMapProperty(this, 'userPoolArrayMap')
    LocalContractStorage.defineMapProperty(this, "userPool", {
        parse: function(jsonText) {
            return new User(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

MorningCall.prototype = {
    init: function() {
    	this.userPoolSize = 0;
    	this.adminAddress = 'n1UcTy4H1c8U1bsmdtjLLEszfvicxdUW6mL'
    },

    /**
     * 支付挑战金
     */
    payDeposit:function(username){
    	var from = Blockchain.transaction.from;
    	// var value = Blockchain.transaction.value;

    	// value = new BigNumber(value)

    	// if( !value.eq(DEPOSIT) ){
    	// 	throw new Error("挑战金金额不正确")
    	// }

    	// if( this._isUserInChallenge(from) ){
    	// 	throw new Error("参与挑战中，无需再支付")
    	// }

    	// var user = this.userPool.get(from);
    	var now = new Date();

    	// if( !user ){
    		var user = new User();
    		user.address = from;
    		user.username = username;
    		// user.openid = openid;
    		// user.avatar = avatar;
    		// throw new Error('用户不存在')
    	// }

		// user.payDepositAt = now;
		// user.payRecords.push(now);

		// 在打卡时间内，则自动打卡
		// if( this._inCallTime() ){
		// 	user.callAt = now;
  //       	user.callRecords.push({t:today()});
		// }

		// 在清算时间内，也自动打卡
		// if( this._inChargeTime() ){
		// 	var t = new Date();
		// 	t.setHours(CALL_END_HOUR);
		// 	t.setMinutes(0);
		// 	t.setSeconds(0);
		// 	t.setMilliseconds(0);

		// 	user.callAt = t;
		// 	user.callRecords.push({t:today()});
		// }

    	this._putUserPool(user);

    	// var ret = Blockchain.transfer(this.adminAddress, BROKEN_RAGE) //提成

    	// if (!ret) {
     //        Event.Trigger("payDepositBrokenrageError", {
     //            Transfer: {
     //                from: Blockchain.transaction.to,
     //                to: this.adminAddress,
     //                value: BROKEN_RAGE_AMOUNT
     //            }
     //        });
     //        // throw new Error("支付挑战金，提成扣款失败");
     //    }else{
     //    	Event.Trigger("payDepositBrokenrageSucc", {
     //            Transfer: {
     //                from: Blockchain.transaction.to,
     //                to: this.adminAddress,
     //                value: BROKEN_RAGE_AMOUNT
     //            }
     //        });
     //    }
    },
    

    userInfo:function(address){
    	var user = this.userPool.get(address)
    	return user
    },


    _putUserPool:function(user) {
        var isExist = false;

    	// 不存在该用户
    	if( !isExist ){
	    	var index = this.userPoolSize;
	    	this.userPoolArrayMap.set(index, user.address);
	    	this.userPool.put( user.address, user );
	    	this.userPoolSize++;
    	}else{
	    	this.userPool.set( user.address, user );
    	}

    }

};

module.exports = MorningCall;