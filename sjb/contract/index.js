'use strict'

var VOTE_DEALINE_TIME = 10 * 60 *1000 //比赛10分钟前不可下注
var NAS_CELL = 1000000000000000000
var BROKEN_RATE = 0.05  // 5 percent for broken rate

function toDate( dateStr ){
	return !!dateStr?new Date(dateStr):0
}



var User = function( jsonStr ) {
	if(jsonStr){
		var obj = JSON.parse(jsonStr)
		this.address = obj.address
		this.avatar = obj.avatar
		this.username = obj.username
		this.createAt = toDate(obj.createAt)
	}else{
		this.address = ''
		this.avatar = ''
		this.username = ''
		this.createAt = new Date
	}
}

User.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
}


var Game = function(jsonStr){
	if( jsonStr ){
		var obj = JSON.parse( jsonStr )
		this.homeTeamID = obj.homeTeamID
		this.guestTeamID = obj.guestTeamID
		this.createAt = toDate(obj.createAt)
		this.over = obj.over
		this.winner = obj.winner
		this.startAt = toDate(obj.startAt) //格林治时间 0
	}else{
		this.homeTeamID = ''
		this.guestTeamID = ''
		this.over = false
		this.winner = -1
		this.createAt = new Date()
		this.startAt = 0
	}
}


Game.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
}


var VoteGame = function(){
	LocalContractStorage.defineProperty(this, "adminAddress")

	LocalContractStorage.defineProperty( this, "gamePoolSize")
	LocalContractStorage.defineMapProperty(this, "gamePool", {
      parse: function(jsonText) {
          return new Game(jsonText);
      },
      stringify: function(obj) {
          return obj.toString();
      }
  })

	LocalContractStorage.defineMapProperty(this, "gameVotePool") //gameID-->{address, jetton, createAt, voteTo, gap,winAmount}

	LocalContractStorage.defineProperty(this, "userPoolSize")
	LocalContractStorage.defineMapProperty(this, 'userPoolArrayMap')
	LocalContractStorage.defineMapProperty(this, "userPool", {
      parse: function(jsonText) {
          return new User(jsonText);
      },
      stringify: function(obj) {
          return obj.toString();
      }
  })
}


VoteGame.prototype = {
	init: function(){
  	this.adminAddress = 'n1UcTy4H1c8U1bsmdtjLLEszfvicxdUW6mL'
  	this.userPoolSize = 0
  	this.gamePoolSize = 0
	},

	/**
	 * 录入比赛
	 * @param {int} homeTeamID  
	 * @param {int} guestTeamID 
	 * @param {string} startAt     game start time, time zone is 0
	 */
	addGame:function( homeTeamID, guestTeamID, startAt ){
		var from = Blockchain.transaction.from
		if( from !== this.adminAddress ){
			throw new Error('无操作权限')
		}

		var game = new Game()
		game.homeTeamID = homeTeamID
		game.guestTeamID = guestTeamID
		game.startAt = new Date(startAt) //startAt 传上来 0 时区的时间
		this.gamePool.put(this.gamePoolSize, game)
		this.gamePoolSize++
	},

	/**
	 * 下注
	 * @param  {int} gameID 
	 * @param  {int} voteTo teamID
	 * @param  {int} gap    win score
	 */
	vote: function( gameID, voteTo, gap, username, avatar ){
		var address = Blockchain.transaction.from
		var jetton = Blockchain.transaction.value

		var now = new Date()
		var game = this.gamePool.get(gameID)

		if( !game ){
			throw new Error('no game')
		}

		var user = new User()
		user.username = username
		user.avatar = avatar
		user.address = address
		this._putUserPool(user)

		if( game.startAt.getTime() - now.getTime() < VOTE_DEALINE_TIME  ){
			throw new Error('距离比赛开始只有10分钟，不可下注。you can\'t vote before game start within 10 minutes')
		}


		jetton = new BigNumber(jetton)
		var brokenValue = jetton.times( BROKEN_RATE )

		this._transfer(this.adminAddress, brokenValue, 'vote')
		jetton = jetton.minus(brokenValue)


		var voteList = this.gameVotePool.get( gameID )
		voteList = voteList || []

		voteList.push({
			address:address,
			jetton:jetton,
			voteTo:voteTo,
			gap:gap,
			createAt: new Date()
		})
		this.gameVotePool.set(gameID, voteList)
		this.votePoolSize++
	},

	/**
	 * 清算
	 * @param  {int} gameID   
	 * @param  {int} winnerID 
	 */
	charge:function( gameID, winTeamID, gap ){
		var voteList = this.gameVotePool.get(gameID)
		var game = this.gamePool.get(gameID)
		gap = gap*1

		if( game.over ){
			throw new Error('已经结算过, the game has charge')
		}

		if(!voteList){
			throw new Error('no vote')
		}

		var loseVotes = []
		var winVotes = []

		for( var i=0; i<voteList.length; i++){
			var vote = voteList[i]
			vote.jetton = new BigNumber( vote.jetton )
			// 平局的情况
			if( gap === 0 && vote.gap*1 === gap ){
				winVotes.push(vote)
			}else if( vote.voteTo*1 === winTeamID*1 && vote.gap*1 === gap ){
				winVotes.push(vote)
			}else{
				loseVotes.push(vote)
			}
		}

		var loseTotal = new BigNumber(0) //失败数额
		var winTotal = new BigNumber(0)	//胜出数额

		// 有胜有负，负的筹码按比例分给胜利者
		if( loseVotes.length>0 && winVotes.length>0 ){
			winVotes.forEach( v=> winTotal = winTotal.plus(v.jetton) )
			loseVotes.forEach( v=> loseTotal = loseTotal.plus(v.jetton) )

			var perGet = loseTotal.dividedBy(winTotal)

			winVotes.forEach(v=>{
				var w = v.jetton.times(perGet)
				this._transfer( v.address, w, 'charge')
				v.winAmount = w.dividedBy(NAS_CELL)
			})

			loseVotes.forEach(v=>v.winAmount=v.jetton.dividedBy(NAS_CELL).times(-1))
		}

		// 只有胜利者，全部退回筹码
		if( loseVotes.length === 0 ){
			winVotes.forEach( v=>{
				this._transfer( v.address, v.jetton , 'chargeRollBack')
				v.winAmount = 0
			})
		}

		// 全败
		if( winVotes.length === 0 ){
			loseVotes.forEach(v=>{
				this._transfer( this.adminAddress, v.jetton , 'chargeAllLose')
				v.winAmount=v.jetton.dividedBy(NAS_CELL).times(-1)
			})
		}

		this.gameVotePool.set(gameID, winVotes.concat(loseVotes))
		game.over = true
		game.winner = winTeamID
		this.gamePool.set(gameID, game)
	},

	/**
	 * 用户下注记录
	 * @param  {String} address 
	 * @return {Array}         [description]
	 */
	userVoteList: function(address){
		var gamePoolSize = this.gamePoolSize
		var result = []
		var user = this.userPool.get(address)

		if( !user ){
			throw new Error('no user')
		}

		for( var i=0; i<gamePoolSize; i++){
			var gameVoteList = this.gameVotePool.get(i)||[]
			var game = this.gamePool.get(i)||{}
			game.homeTeam = teams[game.homeTeamID]
			game.guestTeam = teams[game.guestTeamID]

			gameVoteList.forEach(v=>{
				if( v.address === address ){
					var voteToTeam = teams[v.voteTo]
					v.voteToTeam = voteToTeam
					v.game = game
					v.jetton = new BigNumber( v.jetton ).dividedBy(NAS_CELL)
					result.push(v)
				}
			})
		}

		return {list:result, info: user}
	},

	userList:function(){
		var result = []
		for(var i=0; i<this.userPoolSize; i++){
			var address = this.userPoolArrayMap.get(i)
			result.push(this.userPool.get(address))
		}
		return result
	},


	gameVoteList:function( gameID ){
		let gameVoteList = this.gameVotePool.get(gameID)||[]

		gameVoteList.forEach(v=>{
			var voteToTeam = teams[v.voteTo]
			v.user = this.userPool.get(v.address)
			v.voteToTeam = voteToTeam
			v.homeTeam = teams[v.homeTeamID]
			v.guestTeam = teams[v.guestTeamID]
			v.jetton = new BigNumber( v.jetton ).dividedBy(NAS_CELL)
		})

		return gameVoteList
	},

	gameList:function(){
		var result = []
		
		for(var i=0; i<this.gamePoolSize; i++){
			var game = this.gamePool.get(i)
			game.id = i
			game.homeTeam = teams[game.homeTeamID]
			game.guestTeam = teams[game.guestTeamID]

			var gameVoteList = this.gameVotePool.get(i)||[]

			gameVoteList.forEach(v=>{
				var voteToTeam = teams[v.voteTo]
				v.voteToTeam = voteToTeam
				v.user = this.userPool.get(v.address)
				v.jetton = new BigNumber( v.jetton ).dividedBy(NAS_CELL)
			})

			game.voteList = gameVoteList
			result.push(game)
		}
		return result
	},

	teamList:function(){
		return teams
	},

	_transfer:function( from, value, action ){		
		var to = Blockchain.transaction.to
		var ret = Blockchain.transfer(to, value) //提成

		if (!ret) {
      Event.Trigger(`${action}TransferError`, {
        Transfer: {
            from:from,
            to:to,
            value:value
        }
      })
      // throw new Error("支付挑战金，提成扣款失败"+ret)
    }else{
    	Event.Trigger(`${action}TransferSucc`, {
        Transfer: {
            from:from,
            to:to,
            value: value
        }
      })
    }

    return ret
	},

	_putUserPool:function(user) {
  	var isExist = this._isUserAddressExists(user.address)

  	// 不存在该用户
  	if( !isExist ){
    	var index = this.userPoolSize;
    	this.userPoolArrayMap.set(index, user.address)
    	this.userPool.put( user.address, user )
    	this.userPoolSize++;
  	}else{
    	this.userPool.set( user.address, user )
  	}

  },
  _isUserAddressExists: function(address) {
    var user = this.userPool.get(address);
    if (!user) {
        return false;
    }
    return true;
  },

}

module.exports = VoteGame

var teamsZh = [
		'俄罗斯', '沙特', '埃及', '乌拉圭', '摩洛哥', '伊朗', '葡萄牙', '西班牙', '法国', '澳大利亚', '秘鲁', 
		'丹麦', '阿根延', '冰岛', '克罗地亚', '尼日利亚', '哥斯达黎加', '塞尔维亚', '巴西', '瑞士', '德国', '墨西哥',
		'瑞典', '韩国', '比利时', '巴拿马', '突尼斯', '英格兰', '哥伦比亚', '日本', '波兰', '塞内加尔'
 ]

var teams = teamsZh.map(g=>{return {nameZh:g} })
