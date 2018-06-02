
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
	LocalContractStorage.defineProperty(this, "adminAddress");

    //正在挑战的用户
    LocalContractStorage.defineProperty(this, "challengeUserPoolSize");
	LocalContractStorage.defineMapProperty(this, 'challengeUserPoolArrayMap')
	LocalContractStorage.defineMapProperty(this, 'challengeUserPool');

	// 所有参加过挑战的用户
	LocalContractStorage.defineProperty(this, "userPoolSize");
	LocalContractStorage.defineMapProperty(this, 'userPoolArrayMap')
	LocalContractStorage.defineMapProperty(this, 'userOpenidArrayMap')
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
    	this.challengeUserPoolSize = 0;
    	this.userPoolSize = 0;
    	this.adminAddress = 'n1UcTy4H1c8U1bsmdtjLLEszfvicxdUW6mL'
    },

    /**
     * 新用户
     * @ignore
     * @param  {[type]} username [description]
     * @param  {[type]} avatar   [description]
     * @param  {[type]} openid   [description]
     */
    newUser:function( username, avatar, openid ){
    	var from = Blockchain.transaction.from;
    	var now = new Date();

    	user = new User();
		user.address = from;
		user.username = username;
		user.openid = openid;
		user.avatar = avatar;

		user.payDepositAt = now;
		user.payRecords.push(now);

		// 在打卡时间内，则自动打卡
		if( this._inCallTime() ){
			user.callAt = now;
        	user.callRecords.push({t:today()});
		}

		// 在清算时间内，也自动打卡
		if( this._inChargeTime() ){
			var t = new Date();
			t.setHours(CALL_END_HOUR);
			t.setMinutes(0);
			t.setSeconds(0);
			t.setMilliseconds(0);

			user.callAt = t;
			user.callRecords.push({t:today()});
		}

    	this._putUserPool(user);
    	this._putChallengeUserPool(user);
    },


    /**
     * 支付挑战金
     */
    payDeposit:function(username, avatar, openid){
    	var from = Blockchain.transaction.from;
    	var value = Blockchain.transaction.value;

    	value = new BigNumber(value)

    	if( !value.eq(DEPOSIT) ){
    		throw new Error("挑战金金额不正确")
    	}

    	if( this._isUserInChallenge(from) ){
    		throw new Error("参与挑战中，无需再支付")
    	}

    	var user = this.userPool.get(from);
    	var now = new Date();

    	if( !user ){
    		user = new User();
    		user.address = from;
    		user.username = username;
    		user.openid = openid;
    		user.avatar = avatar;
    		// throw new Error('用户不存在')
    	}

		user.payDepositAt = now;
		user.payRecords.push(now);

		// 在打卡时间内，则自动打卡
		if( this._inCallTime() ){
			user.callAt = now;
        	user.callRecords.push({t:today()});
		}

		// 在清算时间内，也自动打卡
		if( this._inChargeTime() ){
			var t = new Date();
			t.setHours(CALL_END_HOUR);
			t.setMinutes(0);
			t.setSeconds(0);
			t.setMilliseconds(0);

			user.callAt = t;
			user.callRecords.push({t:today()});
		}

    	this._putUserPool(user);
    	this._putChallengeUserPool(user);

    	var ret = Blockchain.transfer(this.adminAddress, BROKEN_RAGE) //提成


    	if (!ret) {
            Event.Trigger("payDepositBrokenrageError", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.adminAddress,
                    value: BROKEN_RAGE_AMOUNT
                }
            });
            // throw new Error("支付挑战金，提成扣款失败");
        }else{
        	Event.Trigger("payDepositBrokenrageSucc", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.adminAddress,
                    value: BROKEN_RAGE_AMOUNT
                }
            });
        }
    },


    /**
     * 打卡
     */
    doCall: function(address) {
        var value = Blockchain.transaction.value;
        var user = this.userPool.get(address)

        if (value != 0) {
            throw new Error("打卡无需支付任何NAS");
        }

        // if( !this._inCallTime() ){
        // 	throw new Error("请在上午6点到8点之间打卡")
        // }

        if ( !this._isUserInChallenge(address) ) {
            throw new Error("未支付挑战金，或挑战失败后未重新支付，不能打卡");
        }

        // if( this._inCallTime(user.callAt) ){
        // 	throw new Error("一天只能打卡一次");
        // }

        user.callAt = new Date();
        user.callRecords.push({t:today()});

        this.userPool.set(address, user);
    },

    /**
     * 结算
     */
    charge:function(){
    	var value = Blockchain.transaction.value;

        // if (value != 0) {
        //     throw new Error("结算无需支付任何NAS");
        // }

        // if( !this._inChargeTime() ){
        // 	throw new Error("不在结算时间内")
        // }

        var challengeFailUserList = [];
        var challengeSuccUserList = [];

        for(var i=0;i<this.challengeUserPoolSize;i++){
        	var fromUserAddr = this.challengeUserPoolArrayMap.get(i);
        	
        	if( fromUserAddr ){
	        	var user = this.userPool.get(fromUserAddr);
	        	// 今天未打卡
	        	if( !this._inCallTime( user.callAt ) ){
	        		challengeFailUserList.push( user.address );
	        		this.challengeUserPoolArrayMap.del(i);
	        		this.challengeUserPool.del(from);
	        	}else{
	        		challengeSuccUserList.push(user.address);
	        	}
        	}
        }

        // 转钱
        var totalPrice = DEPOSIT.minus(BROKEN_RAGE).times(challengeFailUserList.length);
        var pricePerUser = totalPrice.dividedBy(challengeSuccUserList.length)

        for( var i=0; i<challengeSuccUserList.length; i++){
        	var address = challengeSuccUserList[i];
        	if( Blockchain.verifyAddress(address) == 1 ){
	        	var ret = Blockchain.transfer( address, pricePerUser )

	        	if (!ret) {
		            Event.Trigger("payPriseError", {
		                Transfer: {
		                    from: Blockchain.transaction.to,
		                    to: address,
		                    value: pricePerUser
		                }
		            });
		            // throw new Error("支付挑战金，提成扣款失败");
		        }else{
		        	Event.Trigger("payPriseSucc", {
		                Transfer: {
		                    from: Blockchain.transaction.to,
		                    to: address,
		                    value: pricePerUser
		                }
		            });
		            this._updateUserGetPrice(address, pricePerUser)

		        }
        	}
        }
    },

    userInfo:function(address){
    	var user = this.userPool.get(address)
    	if( user ){
    		user.inChallenge = this._isUserInChallenge(user.address)
    	}
    	return user
    },

    /**
     * 我的打卡记录
     */
    myCallList:function(address){
    	var user = this.userPool.get(address);

    	if( user ){
    		return user.callRecords||[]
    	}else{
    		return []
    	}
    },


    /**
     * 我的挑战金记录
     */
    myPayList:function(address){
    	var user = this.userPool.get(address);

    	if( user ){
    		return user.payRecords||[]
    	}else{
    		return []
    	}
    },

    /**
     * 打卡排行榜
     */
    range:function(){
		var address;
		var userList=[];
		var user;
    	for(var i=0; i<this.userPoolSize; i++){
    		address = this.userPoolArrayMap.get(i);
    		user = this.userPool.get(address);
    		if( user ){
    			userList.push({
    				username: user.username,
    				avatar: user.avatar,
    				callTimes: user.callRecords.length
    			});
    		}
    	}

    	userList.sort(function(a, b){
    		return b.callTimes - a.callTimes;
    	})
    	return userList;
    },


    _isUserAddressExists: function(address) {
        var user = this.userPool.get(address);
        if (!user) {
            return false;
        }
        return true;
    },

    // 用户是否正在接受挑战
    _isUserInChallenge:function(address){
    	var userAddress = this.challengeUserPool.get(address);
        if (!userAddress) {
            return false;
        }
        return true;
    },

    _putUserPool:function(user) {
    	var isExist = this._isUserAddressExists(user.address)

    	// 不存在该用户
    	if( !isExist ){
	    	var index = this.userPoolSize;
	    	this.userPoolArrayMap.set(index, user.address);
            if( user.openid ){
    	    	this.userOpenidArrayMap.set(user.openid, user.address);
            }
	    	this.userPool.put( user.address, user )
	    	this.userPoolSize++;
    	}else{
	    	this.userPool.set( user.address, user )
    	}

    },

    _putChallengeUserPool:function(user) {
    	var index = this.challengeUserPoolSize;
    	this.challengeUserPoolArrayMap.set(index, user.address)
    	this.challengeUserPool.put( user.address, user.address ) 
    	this.challengeUserPoolSize++;
    },

    /**
     * 当前时间是否在打卡时间段内
     * @todo  时区问题未考虑
     */
    _inCallTime:function( t ){
    	t = t||new Date()
    	t = t.getTime()

    	var callEndTime = new Date();
    	callEndTime.setHours(CALL_END_HOUR);
    	callEndTime.setMinutes(0);
    	callEndTime.setSeconds(0);
    	callEndTime.setMilliseconds(0);

    	var callStartTime = new Date();
    	callStartTime.setHours(CALL_START_HOUR);
    	callStartTime.setMinutes(0);
    	callStartTime.setSeconds(0);
    	callStartTime.setMilliseconds(0);

    	return t>=callStartTime.getTime()&&t<=callEndTime.getTime()
    },

    _inChargeTime:function( t){
    	t = t||new Date();
    	t = t.getTime();

    	var callEndTime = new Date();
    	callEndTime.setHours(CALL_END_HOUR);
    	callEndTime.setMinutes(0);
    	callEndTime.setSeconds(0);
    	callEndTime.setMilliseconds(0);

    	var delay = t - callEndTime.getTime();

    	return delay <= CHARGE_DELAY && delay>0;
    },

    _updateUserGetPrice:function(address, price){
    	var user = this.userPool.get(address);
        var callRecords = user.callRecords;
        var t = today();

        for(var i=0; i<callRecords.length; i++){
        	if( callRecords[i].t == t ){
        		callRecords[i].price = price
        	}
        }

        user.callRecords = callRecords;
        this.userPool.set(address, user);
    }

}

module.exports = MorningCall;