//JSONP_PATH = 'http://api.meizhanggui.cc/V1.0.0/';
//JSONP_PATH = 'http://123.57.42.13/V1.0.0/';
JSONP_PATH = "http://api.meizhanggui.cc:3366/";

// 获取微信sign
g$isWX = navigator.userAgent.match(/MicroMessenger/i) != null;
var getWxSign = function () {
	var wxUrl = encodeURIComponent(location.href.split('#')[0]);
	var config = function (appId, timestamp, nonceStr, signature) {
		wx.config({
			debug: true,
			appId: appId,
			timestamp: timestamp,
			nonceStr: nonceStr,
			signature: signature,
			jsApiList: [
				'onMenuShareTimeline',
				'onMenuShareAppMessage',
				'onMenuShareQQ',
				'onMenuShareWeibo'
			]
		});
	};
	$.ajax({
		url: "http://api.meizhanggui.cc/V1.0.0/Weixin/Public/token/?url=" + wxUrl,
		dataType: "jsonp",
		jsonp: "callback", //传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
		jsonpCallback: "success_jsonpCallback", //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
		type: "GET",
		async: false,
		success: function (data) {
			var data = eval("(" + data + ")");
			var appId = data.data.app_id,
				timestamp = data.data.timestamp,
				nonceStr = data.data.noncestr,
				signature = data.data.signature;
			config(appId, timestamp, nonceStr, signature);
			wxready();
		}
	});
};
if(g$isWX)getWxSign();
function wxready() {
	wx.ready(function () {
		// 1 判断当前版本是否支持指定 JS 接口，支持批量判断
		wx.checkJsApi({
			jsApiList: [
				'getNetworkType',
				'previewImage'
			],
			success: function (res) {
				window.wxready = true;
			}
		});
	})
}
function parseTpl(tpl, res) {
	if (!tpl) return '';
	//解析变量
	var parse = function(str, val) {
		if (!str) return '';
		return str.replace(/\{([\w\.\|\/-]+)\}/g, function(flag, name) {
			var tmp, def = '',
				k, ret;
			ret = val; //console.log([flag, name]);
			if (~name.indexOf('|')) {
				tmp = name.split('|');
				def = tmp[1];
				name = tmp[0];
			}
			if (~name.indexOf('.')) {
				name = name.split('.');
				while (k = name.shift()) {
					ret = ret[k];
				}
			} else {
				ret = ret[name];
			}
			if (typeof window[def] == 'function') {
				ret = window[def](ret);
				def = '';
			}
			return ret || def;
		});
	};
	tpl = tpl.replace(/<loadimg\s+/g, '<img '); //对图片标签还原
	//处理循环
	tpl = tpl.replace(/\{for\s+([-\w]+)\}([\s\S]*?)\{\/for\}/g, function(str, key, content) {
		var ret = ''; //console.log([str,key,content]);
		if (res[key] && res[key].length) {
			for (var i in res[key]) {
				if ($.isObject(res[key][i])) {
					ret += parse(content, res[key][i]);
				} else {
					ret += content.replace('{v}', res[key][i]).replace('{k}', i);
				}
			}
		}
		return ret;
	});
	tpl = parse(tpl, res);
	return tpl;
}

function formatText(text) {
	return text.replace(/\|\d+(@[^\)]+)\)/g, '$1');
}

function formatTime(unixtime) {
	var str, todayStr = new Date(),
		todayUnixTime = Date.parse(todayStr.toString().replace(/ \d{1,2}:\d{1,2}:\d{1,2} /, ' 00:00:00 ')),
		nowUnixTime = Date.parse(todayStr),
		timeDiff = Math.ceil((nowUnixTime - unixtime) / 1000),
		todayTimeDiff = Math.ceil((todayUnixTime - unixtime) / 1000);
	if (timeDiff > 3600 * 120) {
		var curDate = new Date(unixtime);
		str = (curDate.getMonth() + 1) + '-' + curDate.getDate() + ' ' + curDate.getHours() + ':' + curDate.getMinutes();
	} else if (timeDiff > 3600 * 24) {
		str = Math.ceil(timeDiff / 86400) + "天前";
	} else {
		if (timeDiff > 3600) {
			str = Math.floor(timeDiff / 3600) + "小时前";
		} else if (timeDiff > 60) {
			str = Math.floor(timeDiff / 60) + "分钟前";
		} else {
			str = "刚刚";
		}
	}
	return str;
}!(function() {
	var params;
	params = $.parseParam() || {};
	if (!params.feed_id) {
		alert('参数有误！');
		return false;
	}

	console.log(JSONP_PATH + 'feeds?feed_id=' + params.feed_id);
	var setting = {
		url: JSONP_PATH + 'feeds?feed_id=' + params.feed_id,
		callbackParameter:"callback"
	};
	setting.success = function(res) {
		console.dir(res);

		if (res && res.status == 'ok' && res.data) {
			var data = res.data,
				imageLenth = data.image_urls.length;
			data.timeStr = formatTime(data.create_time);
			if (imageLenth > 1) {
				data.images = [];
				var imgWidth, picBoxWidth = $('body').width();
				if (picBoxWidth > 640) picBoxWidth = 640;
				if (imageLenth > 3) {
					imgWidth = Math.floor(picBoxWidth / 3);
				} else {
					imgWidth = Math.floor(picBoxWidth / 2);

				}
				for (var i = 0; i < imageLenth; i++) {
					var node = '<loadimg src="'+data.image_urls[i] + '?imageView2/1/w/' + imgWidth + '/h/' + imgWidth+'"/>';
					$('.pic-box').append(node);
				}
				if(g$isWX){
					window.timer = setInterval(function(){
						if(wxready===true){
							$('.pic-box').click(function () {
								wx.previewImage({
									current: '',
									urls:data.image_urls
								});
							});
							clearTimeout(window.timer);
						}
					},50)
				}

			}
			data.tagArray = data.tag.split('#');
			if(data.tagArray.length>3)data.tagArray.slice(0,3);
			if(data.tagArray.length==0)$('.tagArea').hide();

			console.dir(data);

			$('.main').html(parseTpl($('.main').html(), data)).show();

			if (imageLenth > 1) {
				$('.pic-box img').css({
					'border': '3px solid #fff',
					'float': 'left'
				});
			}
			$('.pic-box img').css({
				'width': imgWidth + 'px'
			});
			$('.main').css('padding-bottom', $('#down_banner').height() + 'px');
		} else {
			alert(res && res.msg || '啊哦，似乎网络不给力呀！');
		}
	};
	$.jsonp(setting);

})();