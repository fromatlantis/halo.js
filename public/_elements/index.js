'use strict';
(function(){
	var root = this;
	require('./index.css');
	var Store = require('Store');
	var Events = require('Events');
	var Page = {
		push: 0,
		Apis: {
			msgs: '/apis/msgs.json',
			detail: '/apis/msgDetail.json'
		},
		init: function(){
			function getMsgs() {
				return $.ajax({
					url: Page.Apis.msgs,
					type: 'GET',
					dataType: 'JSON',
					data: {}
				})
			}
			function firstRequest(callback){
				$.when(getMsgs()).done(function(data){
					callback(data.records);
				})
			}
			firstRequest(function(record){
				var store = Page.Store;
				store.dispatch(Page.Action.index(record));
				Page.Render.init();
			})
		}
	}
	
	Page.UI = (function(){
		return {
			indexView: function() {
				return require('./tmpl/index.jade');
			},
			detailView: function() {
				return require('./tmpl/detail.jade');
			}
		}
	}());

	Page.Store = (function(){
		var store = new Store({
			msgs: {
				tabs:[],
				content:[]
			},
			tab: {
				index: 0
			}
		});
		return store;
	}());

	Page.Render = (function(){
		var $msgPlus = $('.msg-plus');
		function index() {
			var template = Page.UI.indexView();
			//console.log(state.msgs);
			var html = template(Page.Store.getState());
			$msgPlus.html(html);
			Page.HandleEvents.init();
		}
		function detail() {
			var template = Page.UI.detailView();
			var html = template(Page.Store.getState());
			$msgPlus.html(html);
		}
		return {
			init: function() {
				index();
			},
			detail: function() {
				detail();
			} 
		}
	}());

	Page.HandleEvents = (function(){
		var events = new Events({
			'.content-item@click': 'showDetail',
		}) 
		return {
			init: function() {
				events.dispatch(this);
			},
			showDetail: function() {
				$.ajax({
					url: Page.Apis.detail,
					type: 'GET',
					dataType: 'JSON',
					data: {},
					success:function(res) {
						Page.Store.dispatch(Page.Action.detail(res.records));
						Page.Render.detail();
					}
				})
			}
	}());

	Page.Action = (function() {
		return {
			index: function(record){
				var tabs=[],content=[];
				for(var i=0;i<record.length;i++){
					for(var key in record[i]){
						tabs.push(key);
						content.push(record[i][key]);
					}
				}
				return {
					type: 'msgs',
					payload : {
						tabs:tabs,
						content:content
					}
				}
			},
			detail: function(record) {
				return {
					type:'detail',
					payload:record
				}
			}
 		}
	}());

	Page.init();

	/**
	var msgPlus = Page;
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
	  		exports = module.exports = msgPlus;
		}
		exports.msgPlus = msgPlus;
	} else {
		root.msgPlus = msgPlus;
	}
	if (typeof define === 'function' && (define.amd || define.cmd)) {
		define('msgPlus', [], function() {
	  		return msgPlus;
		});
	}
	**/
}.call(this));