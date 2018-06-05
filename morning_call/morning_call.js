
'use strict';

/**
 * @note 上主网前修改环境变量
 */

var ENV = 'dev'
ENV = 'prod'

var IS_PROD = ENV==='prod'

// 
var CALL_START_HOUR = fixTimeZoneHour(6)
var CALL_END_HOUR = fixTimeZoneHour(8)	 //打卡结束时间

var CHARGE_DELAY = 20*60*1000; //每天清算时间，相对于打卡结束时间的时延

var DEPOSIT_AMOUNT = 0.01; // 0.02NAS
var BROKEN_RAGE_AMOUNT = 0.001; //提成0.002NAS

if( !IS_PROD ){
	DEPOSIT_AMOUNT = 0.0001;
	BROKEN_RAGE_AMOUNT = 0.00001;
	CALL_END_HOUR = 13-8;
}

var NAS_CELL = 1000000000000000000;
var DEPOSIT = new BigNumber(DEPOSIT_AMOUNT * NAS_CELL);
var BROKEN_RAGE = new BigNumber(BROKEN_RAGE_AMOUNT * NAS_CELL);


function fixTimeZoneHour(hour){
	if( hour >= 8 ){
		hour = hour - 8
	}else{
		hour = hour + 24 - 8
	}
	return hour
}

function toDate( dateStr ){
	return !!dateStr?new Date(dateStr):0
}

function today(){
	var now = newDate().getTime()
	now = new Date(now+8*60*60*1000)
	return [now.getFullYear(), toDateNumString(now.getMonth()+1), toDateNumString(now.getDate())].join('-')

}

function newDate(){
	return new Date()
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
        this.openid = "";``
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
	
	LocalContractStorage.defineMapProperty( this, "dayChargeMap" )
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
			var t = newDate();
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
		user.avatar = avatar;
		user.payRecords.push(now);

		// 在打卡时间内，则自动打卡
		if( this._inCallTime() ){
			user.callAt = now;
        	user.callRecords.push({t:today()});
		}

		// // 在清算时间内，也自动打卡
		if( this._inChargeTime() ){
			var t = newDate();
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
    doCall: function() {
		var address = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;

        var user = this.userPool.get(address)

        if (value != 0) {
            throw new Error("打卡无需支付任何NAS");
        }

		// 开发环境不限制打卡时间
        if( IS_PROD && !this._inCallTime() ){
        	throw new Error("请在北京时间上午6点到8点之间打卡")
        }

        if ( !this._isUserInChallenge(address) ) {
            throw new Error("未支付挑战金，或挑战失败后未重新支付，不能打卡");
        }

        if( this._inCallTime(user.callAt) ){
        	throw new Error("一天只能打卡一次");
        }

        user.callAt = new Date();
        user.callRecords.push({t:today()});

        this.userPool.set(address, user);
    },

    /**
     * 结算
     */
    charge:function(){
		var value = Blockchain.transaction.value;
		var from = Blockchain.transaction.from;

		if( from != this.adminAddress ){
			throw new Error("没有调用权限")
		}

        if (value != 0) {
            throw new Error("结算无需支付任何NAS");
        }

		// 开发环境不限制结算时间
        if( IS_PROD && !this._inChargeTime() ){
        	throw new Error("不在结算时间内")
        }

        var challengeFailUserList = [];
        var challengeSuccUserList = [];

        for(var i=0;i<this.challengeUserPoolSize;i++){
        	var fromUserAddr = this.challengeUserPoolArrayMap.get(i);
			
        	if( fromUserAddr ){
				var user = this.userPool.get(fromUserAddr);
				if( user ){
					// 今天未打卡
					if( !this._inCallTime( user.callAt ) ){
						challengeFailUserList.push( user.address );
						this.challengeUserPoolArrayMap.del(i);
						this.challengeUserPool.del(user.address);
					}else{
						challengeSuccUserList.push(user.address);
					}
				}
	        	
        	}
		}
		
		if( challengeSuccUserList.length < 1 || challengeFailUserList.length < 1 ){
			return {
				challengeSuccUserList, 
				challengeFailUserList
			}
		};

        // 转钱
        var totalPrice = DEPOSIT.minus(BROKEN_RAGE).times(challengeFailUserList.length);
		var pricePerUser = totalPrice.dividedBy(challengeSuccUserList.length)

		var result = []
        for( var i=0; i<challengeSuccUserList.length; i++){
			var address = challengeSuccUserList[i];
			// result.push(['a',Blockchain.verifyAddress(address),address,'a'])
        	// if( Blockchain.verifyAddress(address) == 1 ){
	        	var ret = Blockchain.transfer( address, pricePerUser )
				result.push(ret)
	        	if (!ret) {
		            Event.Trigger("payPriseError", {
		                Transfer: {
		                    from: Blockchain.transaction.to,
		                    to: address,
		                    value: pricePerUser
		                }
		            });
		            throw new Error("支付挑战金，提成扣款失败"+ret);
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
			// }
		}

		this.dayChargeMap.set(today(), {
			totalPrice: totalPrice.dividedBy(NAS_CELL),
			pricePerUser: pricePerUser.dividedBy(NAS_CELL) ,
			challengeFailUserList,
			challengeSuccUserList,
			result
		})
	},
	
	dayChargeInfo:function(day){
		return this.dayChargeMap.get(day)
	},

    userInfo:function(address){
    	var user = this.userPool.get(address)
    	if( user ){
    		user.inChallenge = this._isUserInChallenge(user.address)
    	}
    	return user
	},
	
	prizePool:function(){
		var pool = []
		for(var i=0;i<this.challengeUserPoolSize;i++){
        	var fromUserAddr = this.challengeUserPoolArrayMap.get(i);
			
        	if( fromUserAddr ){
				var user = this.userPool.get(fromUserAddr);
				if( user ){
					pool.push(user)	
				}
			}
		}
		return pool
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
				user.callTimes = user.callRecords.length
    			userList.push(user);
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
		if( t === 0 || t === '0'){
			return false;
		}

		t = t||new Date()
		
		var gap = +new Date - t.getTime()

		// 大于18小时不算今天的卡
		if( gap > 18*60*60*1000 ){
			return false
		}
		
		var hour = t.getHours()

		// 不跨天
		if( hour>= CALL_START_HOUR && hour < CALL_END_HOUR ){
			return true
		}

		// 跨天
		if( CALL_START_HOUR > CALL_END_HOUR ){
			if( hour >= CALL_START_HOUR ){
				return true
			}

			if( hour < CALL_END_HOUR ){
				return true
			}
		}

		return false
	},
	
	inCallTime:function(t){
		if( t ){
			t = new Date(t)
		}
		return [this._inChargeTime(t), this._inCallTime(t)]
	},

	// 如果结束时间小于8点，那要改这里的逻辑
    _inChargeTime:function( t){
    	t = t||new Date();
    	t = t.getTime();

    	var callEndTime = newDate();
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