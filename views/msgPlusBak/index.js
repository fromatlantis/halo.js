'use strict';
//console.time('time');
//console.profile();
require('./index.css');
require('../adPops/index.css');
var Store = require('Store');
var Events = require('Events');

var ICPage = require('./ICIndex.js');
var Page = {
	isFirstLoad:true,
	push: 0,
	ajaxDataType: typeof CVal == "undefined" ? 'jsonp' : 'jsonp',
	init: function(){
		if(Page.isFirstLoad){
			$(document.body).append('<div class="msg-plus"></div>');
			Page.HandleEvents.init();
			Page.isFirstLoad = false;
		}
		var store = Page.Store;
		store.dispatch(Page.Action.index());
		Page.Render.init();
		ICPage.init();
		$('.content-tabs').trigger('change.tabs',0); 
		function firstRequest(callback){
			//$(document.body).append('<div class="msg-plus"></div>');
			$.when(
				Page.APIS.getMsgs(),
				Page.APIS.getClosedSum()
			).done(function(data,sum){
				//data[0].data.sum = sum[0].data[0];//注意：如果是多个接口，返回值是一个ajax对象，数据要用data[0]获取，否则报错；如果是一个接口则直接data获取
				//callback(data[0].data);
				if(data[0].code == 1000 && sum[0].code==1000){
					data[0].data.sum = sum[0].data;//注意返回值是一个ajax对象，数据要用data[0]获取，否则报错
					Page.Store.dispatch(Page.Action.tab1(data[0].data));
					callback();
				}
			})
		}
		/**
		firstRequest(function(){
			Page.Render.init();
			$('.content-tabs').trigger('change.tabs',0); 
		})
		**/
	}
}

Page.APIS = (function(){
	var apiPath = typeof CVal == "undefined" ? 'http://21.32.95.248:8088/bhoserver' : CVal.path;
	var postData = {};
	if(typeof CVal != "undefined"){
		postData.userId = CVal.getUserId();
		postData.posId = CVal.getPostId();
		postData.orgId  = CVal.getOrgId();
	}
	else{
		postData.userId = "20091206140";
		postData.posId ="E02";
		postData.orgId  ="13011576";
	}
	var Apis = {
		msgs: apiPath + '/portals/getDataClosed',                                           //已经结清
		msgs2: apiPath + '/portals/getCloseDataSoon',                                       //即将结清
		msgs3: apiPath + '/portals/getLoanRemindListByUserId',                              //查询指定信贷员贷后需检查业务
		news: apiPath + '/portals/indNewsList',                                             //行业新闻推荐 20081802220
		closedSum: apiPath + '/portals/getDataClosedSum',                                   //已结清统计
		closeDataSoonSum: apiPath + '/portals/getCloseDataSoonSum',                         //即将结清统计
		dealShowData: apiPath + '/portals/dealShowData',                                    //处理是否续贷及显示
		loanRemindAlteraction: apiPath + '/portals/loanRemindAlteraction',                  //贷后提醒详细修改
		loanRemindStat: apiPath + '/portals/loanRemindStat',                  				//贷后提醒详细修改
		bulletinInfo: apiPath + '/portals/getBulletinInformDetail'                          //查询信贷员业务通报明细 20081802220
	}
	return {
		getMsgs: function() {
			return $.ajax({
				url: Apis.msgs,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
			 	jsonp: '_callback'
			})
		},
		getMsgs2: function() {
			return $.ajax({
				url: Apis.msgs2,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
				jsonp: '_callback'
			})
		},
		getMsgs3: function() {
			return $.ajax({
				url: Apis.msgs3,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
				jsonp: '_callback'
			})
		},
		getNews: function() {
			return $.ajax({
				url: Apis.news,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
				jsonp: '_callback'
			})
		},
		getClosedSum: function() {
			return $.ajax({
				url: Apis.closedSum,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
				jsonp: '_callback'
			})
		},
		getCloseDataSoonSum: function() {
			return $.ajax({
				url: Apis.closeDataSoonSum,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
				jsonp: '_callback'
			})
		},
		dealShowData: function(loanId,isLoaning,isShow) {
			postData.loanId=loanId;
			postData.isLoaning=isLoaning;
			postData.isShow=isShow;
			return $.ajax({
				url: Apis.dealShowData,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
				jsonp: '_callback'
			})
		},
		loanRemindAlteraction: function(rmdId,alterType) {
			postData.rmdId=rmdId;
			postData.alterType=alterType;
			return $.ajax({
				url: Apis.loanRemindAlteraction,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
				jsonp: '_callback'
			})
		},
		loanRemindStat: function() {
			return $.ajax({
				url: Apis.loanRemindStat,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
				jsonp: '_callback'
			})
		},
		bulletinInfo: function() {
			return $.ajax({
				url: Apis.bulletinInfo,
				type: 'GET',
				dataType: Page.ajaxDataType,
				data: postData,
				jsonp: '_callback'
			})
		}
	}
}());

Page.UI = (function(){
	return {
		indexView: function() {
			return require('./tmpl/index.jade');
		},
		detailView: function() {
			return require('./tmpl/detail.jade');
		},
		newsView: function() {
			return require('./tmpl/news.jade');
		}
	}
}());

Page.Store = (function(){
	var store = new Store();
	return store;
}());

Page.Render = (function(){
	//var $msgPlus = $('.msg-plus'); //注意本函数为立即执行函数，如果在此定义dom还未渲染，所以此时获取不到dom，因此必须在调用方法内获取dom
	function index() {
		var $msgPlus = $('.msg-plus');
		var template = Page.UI.indexView();
		var html = template(Page.Store.getState());
		$msgPlus.html(html);
	}
	function detail() {
		var $msgPlus = $('.msg-plus');
		var template = Page.UI.detailView();
		var html = template(Page.Store.getState());
		$msgPlus.html(html);
	}
	function news() {
		var $msgPlus = $('.msg-plus');
		var template = Page.UI.newsView();
		var html = template(Page.Store.getState());
		$msgPlus.html(html);
		require.ensure('slimscroll',function(){
			require('slimscroll');
			 $('.adPops-content').slimScroll({
	            position: "right",
	            height: '325px',
	            distance: '2px',
	            railVisible: true,
	            size: '5px',                    
	            color: '#999',                    
	            railOpacity: '0.5',
	            railColor: '#eee'
	        });
		},'slimscroll');//第三个参数是给这个模块命名，否则[name]是一个自动分配的id
	}
	return {
		init: function() {
			index();
		},
		news: function() {
			news();
		},
		detail: function() {
			detail();
		} 
	}
}());

Page.HandleEvents = (function(){
	function push(type){
		var $msgPlus = $('.msg-plus'),
			$msgContent = $('.msg-content'),
			$msgTabs = $('.msg-tabs'),
			$icon = $('.showhide').find('i');
		if(type=='right'){
			$msgPlus.animate({right:-322},function(){
				$msgTabs.animate({'margin-left':-322});
				Page.push=1;
				$icon.html('&#xe636;');
				$icon.next('span').text('展开');
			})
		}else if(type=='left'){
			$msgPlus.animate({right:0});
			$msgTabs.animate({'margin-left':0});
			Page.push=0;
			$icon.html('&#xe635;');
			$icon.next('span').text('收起');
		}
	}	
	$(document).on('click','.close-icon',function(){
		Page.Render.init();
	})
	var events = new Events({
		'.news@click': 'showNews',
		'.news-card@click': 'gotoNew',
		'.content-item .item-title@click': 'showItemMore',
		'.item-deal .no-more@click': 'noMore',
		'.item-deal .can-next@click': 'showFlag',
		'.showhide@click': 'foldBox',
		'.home@click': 'showIndex',
		'.content-tabs td@click': 'changeMsgTabs',
		'.content-tabs@change.tabs':'changeTabs',//自定义事件
		'.text-ellipsis@mouseover':'showTips',
		'.text-ellipsis@mouseout':'hideTips'
	})
	return {
		init: function() {
			events.dispatch(this);
		},
		/**
		showNews: function() {
			$.when(Page.APIS.getNews()).done(function(data){
				Page.Store.dispatch(Page.Action.news(data.data));
				Page.Render.news();
				if(Page.push==1){
					push('left');
				}
			})
		},
		**/
		gotoNew: function() {
			if(typeof jump == 'function') {
				var industryId = $(this).data('id');
				jump('psbcias','3','{industryId:'+industryId+'}');
			}
		},
		showItemMore: function() {
			var $itme = $(this).parent('.content-item');
			var $more = $itme.find('.item-more');
			if($more.is(':visible')) {
				$more.hide('fast');
			}else {
				$more.show('fast');
			}		
		},
		noMore: function() {
			var r = confirm('确认后将不再展示');
			if(r == true) {
				var loanId = $(this).data('loanid');
				var rmdId = $(this).data('rmdid');
				var dealFlag = 0;//是否有续贷意愿
				var $item = $(this).parents('.content-item');
				var $flag = $(this).parents('.content-item').find('.flag-icon');
				if($flag.is(':visible')){
					dealFlag = 1;
				}
				if(!!loanId){
					$.when(Page.APIS.dealShowData(loanId,dealFlag,0)).done(function(data){
						$item.hide();
					})
				}else if(!!rmdId){
					$.when(Page.APIS.loanRemindAlteraction(rmdId,'notips')).done(function(data){
						$item.hide();
					})
				}
			}
		},
		showFlag: function() {
			var loanId = $(this).data('loanid');
			var rmdId = $(this).data('rmdid');
			var $flag = $(this).parents('.content-item').find('.flag-icon');
			$(this).addClass('disable');
			$(this).attr('disabled',true);
			if(!!loanId){
				$.when(Page.APIS.dealShowData(loanId,1,1)).done(function(data){
					$flag.show('fast');
				})
			}else if(!!rmdId){
				$.when(Page.APIS.loanRemindAlteraction(rmdId,'inspected')).done(function(data){
					$flag.show('fast');
				})
			}
		},
		foldBox: function() {
			if(Page.push==0){
				push('right');
			}else if(Page.push==1){
				push('left');
			}
		},
		showIndex: function() {
			if(Page.push==1){
				push('left');
			}
		},
		changeMsgTabs: function() {
			var tabIndex = $(this).data('tab-index');
			var state = Page.Store.getState();
			if(!$(this).hasClass('active')){
				if(tabIndex==2 && !state.tab3) {
					$.when(
						Page.APIS.getMsgs3(),
						Page.APIS.loanRemindStat()
					).done(function(data,sum){
						if(data[0].code == 1000 && sum[0].code == 1000){
							data[0].data.sum = sum[0].data;
							Page.Store.dispatch(Page.Action.tab3(data[0].data));
							Page.Render.init();
							//$('.content-tabs').trigger('change.tabs',2); 
							Page.HandleEvents.changeTabs('change.tabs',2);
						}
					})
				}else if(tabIndex==1 && !state.tab2) {
					$.when(
						Page.APIS.getMsgs2(),
						Page.APIS.getCloseDataSoonSum()
					).done(function(data,sum){
						if(data[0].code == 1000 && sum[0].code == 1000){
							data[0].data.sum = sum[0].data;//注意返回值是一个ajax对象，数据要用data[0]获取，否则报错
							Page.Store.dispatch(Page.Action.tab2(data[0].data));
							Page.Render.init();
							Page.HandleEvents.changeTabs('change.tabs',1);
						}
					})
				}
				else if(tabIndex==3 && !state.tab4) {
					$.when(Page.APIS.bulletinInfo()).done(function(data){
						if(data.code == 1000){
							Page.Store.dispatch(Page.Action.tab4(data.data));
							Page.Render.init();
							Page.HandleEvents.changeTabs('change.tabs',3);
						}
					})
				}
			}
			Page.HandleEvents.changeTabs('change.tabs',tabIndex);
		},
		changeTabs: function(e,index) {
			var tabIndex = index;
			$('.content-tabs td[data-tab-index='+index+']').addClass('active').siblings('.active').removeClass('active');
			$('ul.content[data-tab-index='+index+']').addClass('active').siblings('.active').removeClass('active');
		},
		showTips:function(e){
			var $tips = $(this).next('.text-tooltip');
			$tips.show();
		},
		hideTips:function(e){
			var $tips = $(this).next('.text-tooltip');
			$tips.hide();
		}
	}
}());

Page.Action = (function() {
	return {
		index: function(){
			var tabs=['已经结清','即将结清','贷后助手','业务通报'];
			return {
				type: 'tabs',
				payload : tabs
			}
		},
		tab1: function(record){
			return {
				type: 'tab1',
				payload : {
					content:record
				}
			}
		},
		tab2: function(record){
			return {
				type: 'tab2',
				payload : {
					content:record
				}
			}
		},//即将结清tab页
		tab3: function(record){
			return {
				type: 'tab3',
				payload : {
					content:record
				}
			}
		},//贷后助手tab页
		tab4:function(record){
			return {
				type: 'tab4',
				payload : {
					content:record
				}
			}
		},//业务通报tab页
		news: function(record) {
			
			for(var i=0;i<record.length;i++){
				//var content = '<div>' + record[i].content +'</div>';
				record[i].content = record[i].content.replace(/<[^>]+>/g,'').replace(/\s+/g,'').substring(0,100)
				//console.log(record[i].content);
			}
			
			return {
				type:'news',
				payload:record
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

//Page.init();

module.exports=Page;//pack-lib打包类库使用