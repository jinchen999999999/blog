/**
 * [site is global object]
 */
var site = {};
site.api_base  = 'http://jinchen999999999-202483.apne1.nitrousbox.com/';// ajax's api base url
site.html_base = './';

/**
 * [init hash as GET params]
 */
site.hash      = {};

// callback data
var sHash      = site.hash;// 用來縮短呼叫
sHash._layouts = [];
sHash._acts    = [];
sHash._get     = {};

(function (obj) {

	var hash_parts = location.hash.replace(/^.*?#/, '');
	hash_parts = hash_parts.split('&', 10);//10 - limit, may be changed if more than the arguments

	for(var i=0, count=hash_parts.length; i<count; i++){
		
		var param  = hash_parts[i].split('=')[0];
		var value  = hash_parts[i].split('=')[1];
		var prefix = '';
		var data   = {};
		
		if(param == '' || value == ''){// null param
			continue;
		}

		if(param.substr(1, 1) == '_'){// has prefix
			prefix = param.split('_')[0];
			param  = param.substring(2);// delete prefix
		}

		// 以參數的前綴判斷該做甚麼
		// ex. L_content=blog_index
		// 就把blog_index讀取到id為content的div
		switch(prefix){
			case 'L':// layout
				
				data[param] = value;
				obj._layouts.push(data);
				break;

			case 'A':// action
				data[param] = value;
				obj._acts.push(data);
				break;

			case 'P':// param
			default:
				obj._get[param] = value;
				break;
		}
	}
} (sHash));

/**
 * [hash debug]
 * param type 的hash 屬於物件格式
 */
//alert(JSON.stringify(sHash));

/**
 * [layout main page]
 * 依照layouts陣列內容 在容器內放入頁面
 */
(function(array, html_base){
	
	$(function() {// document ready

		for(var i=0, c=array.length; i<c; i++){
			
			for(var target in array[i]){
				var page = array[i][target];
				var url = html_base.concat(page, '.html');

				$('#' + target).load(url, function() {
					
				});
			}
		}

	});

}(sHash._layouts, site.html_base));

/**
 * [auto trigger acts]
 * 依照acts陣列內容 在頁面載入幾秒後 自動觸發該id元素對應事件
 * 若參數未填 預設1秒後觸發
 */
site.trigger_acts = function(second){
		
		var sec = (typeof second !== 'undefined') ? second*1000 : 1000;

		setTimeout(function(){
			var array = sHash._acts
			for(var i=0, c=array.length; i<c; i++){
					
				for(var element in array[i]){
					var act = array[i][element];
					
				  $('#' + element).trigger(act);
				}
			}
		}, sec);
};


/**
 * [依輸入的key 取得hash內的單一值get值 ]
 * 若無存在於get內 可回傳預設值
 * 若無存在於get內 也無預設值 則回傳false
 */
site.get = function(param, default_val){
	for(var key in sHash._get){

		if(param === key){
			return sHash._get[key];
		}
	}

	return (typeof default_val !== 'undefined') ? default_val : false;
	
};

/**
 * [取得以Hash內容轉成的擬GET字串]
 * 用來呼叫Ajax api
 */
site.get_params_url = function(){

	var str   = '';
	var count = 0;

	for(var key in sHash._get){

		if(count === 0){
			str += '?';
		}else{
			str += '&';
		}

		str = str.concat(key, "=", sHash._get[key]);
		count++;
	}

	return str;
};

/**
 * [取得Ajax api之回傳結果(預設為JSON)]
 */
site.get_api_result = function(conf_obj ,callback){
	
		var route = site.api_base + conf_obj.route;
		var is_debug = false;

		// 預設回傳json格式
		conf_obj.dataType = (typeof conf_obj.dataType !== 'undefined') ? conf_obj.dataType : 'json';

		// 是否自動在api後面帶上get參數
		if(conf_obj.hasOwnProperty('autoGets') && conf_obj.autoGets == true){
			conf_obj.url = route + site.get_params_url();
		}else{
			conf_obj.url = route;
		}

		// 是否開啟debug模式
		if(conf_obj.hasOwnProperty('debug') && conf_obj.debug == true){
			is_debug = true;
			alert('ajax setup:' + JSON.stringify(conf_obj));
		}

		$.ajax(conf_obj)
		.done(function( result ) {

			if(is_debug){
	  		alert('result:' + JSON.stringify(result));
	  	}

			// ajax結果為空 則停止往下做
			// if( $.isEmptyObject(result) ){
			// 	return false;
			// } 

	  	(callback && typeof(callback) === "function") && callback(result);

	  });

};

/**
 * [將某element設定為click事件 且附帶記錄在hash]
 * 適用於展開樹狀目錄 需慎用 
 * 若layout載入多分頁/或操作步驟過多 可能出現異想不到結果
 */
site.click_hash = function(id, callback){
	
	// target a dynamically added element 
	$(document).on('click', id, function(event) {

		var act_params = '';
		var hash = window.location.hash;
		act_params = act_params.concat('&A_', this.id, "=", event.type);

		// 避免hash重複紀錄事件
		if(hash.indexOf(act_params) == -1){
			window.location.hash += act_params;
		}

		(callback && typeof(callback) === "function") && callback(event);
			
	});
};

/**
 * [redirect description]
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
site.redirect = function(url){
	location.href = site.html_base + url;
	location.reload();// set true force it to reload the page from the server
};
