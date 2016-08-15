'use strict';
require('commonCss');
require('./index.css');

var Util=require('Util');
var util=new Util();

var Apis = {
	del: '/surveyRpt/template/delete',
	preview:'/surveypRpt/template/preview'
}
var pageParams={
	select:util.urlParam('select'),
	router:['模版中心','模版列表']
}
if(pageParams.select){
	pageParams.router=['报告管理','报告列表','选择模版']
}
var template = require("./tmpl/index.jade"); //返回一个函数

var html = template({
	'router': pageParams.router,
	'nav':'template'
});
$('body').html(html);
var postData={};
postData.id='';
bindEvents();
function bindEvents(){
	$('.template-list').click(function(){
		if(pageParams.select){
			window.location.href='/template/preview?select=1';
		}else{
			window.location.href='/template/preview';
		}
	})
	$('.class').click(function(){
		var $tab=$(this);
		if(!$tab.hasClass('current')){
			$('.class').removeClass('current');
			$tab.addClass('current');
		}
	})
	$('span.del').click(function(event){
		event.stopPropagetion();
		var delApi=new FetchApi({
			urlApi:Apis.del,
			postData:postData,
			dataType:'text'
		},function(){
			alert(this.records);
		})
	})
}
