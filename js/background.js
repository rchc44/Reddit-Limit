let countdown;
let secondsLeft;
const defaultTime = 60*60;

chrome.runtime.onInstalled.addListener(function (){
	chrome.tabs.create({url:chrome.extension.getURL("html/options.html")},function(){});
	chrome.storage.local.set({date: (new Date()).toDateString()});
});

// default time and date when first downloaded
chrome.storage.local.get({timeLimit: defaultTime, timeLeft: defaultTime}, function(items) {
	secondsLeft = items.timeLeft;
});

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
	if (request.msg == "resetTime") {
		secondsLeft = request.timeLeft;
		sendResponse({"message": "reset success"})
	} else if (request.msg == "sendTime") {
		sendResponse({timeLeft:secondsLeft});
	}
});

chrome.tabs.onActivated.addListener(function(info) {
	let newDate = (new Date()).toDateString();
	chrome.storage.local.get({date: newDate,timeLeft:defaultTime,timeLimit:defaultTime}, function(items) {
		console.log('old',items.date);
		console.log('new',newDate);
		console.log('check same day',isSameDay(items.date,newDate));
		if (isSameDay(items.date,newDate)) {
			onActivated(info.tabId);
		} else {
			console.log('reset time',secondsLeft,items.timeLimit);
			secondsLeft = items.timeLimit;
			chrome.storage.local.set({date: newDate},function() {
				onActivated(info.tabId);
			});
		}
	});	
});

function onActivated(tabId) {
	chrome.tabs.get(tabId, function(tab){
		if (isReddit(tab.url)) startTimer();	
		else stopTimer();
	});
}

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tabInfo) {
	let newDate = (new Date()).toDateString();
	chrome.storage.local.get({date: newDate,timeLeft:defaultTime,timeLimit:defaultTime}, function(items) {
		console.log('old',items.date);
		console.log('new',newDate);
		console.log('check same day',isSameDay(items.date,newDate));
		if (isSameDay(items.date,newDate)) {
			onUpdated(changeInfo,tabInfo);
		} else {
			console.log('reset time',secondsLeft,items.timeLimit);
			secondsLeft = items.timeLimit;
			chrome.storage.local.set({date: newDate},function() {
				onUpdated(changeInfo,tabInfo);
			});
		}
	});
});

function onUpdated(changeInfo,tabInfo) {
	if (tabInfo.active && changeInfo.url) {
		if (isReddit(changeInfo.url)) startTimer();
		else stopTimer();
	}
}

chrome.windows.onFocusChanged.addListener(function(windowId) {
	let newDate = (new Date()).toDateString();
	chrome.storage.local.get({date: newDate,timeLeft:defaultTime,timeLimit:defaultTime}, function(items) {
		console.log('old',items.date);
		console.log('new',newDate);
		console.log('check same day',isSameDay(items.date,newDate));
		if (isSameDay(items.date,newDate)) {
			onWindow(windowId);
		} else {
			console.log('reset time',secondsLeft,items.timeLimit);
			secondsLeft = items.timeLimit;
			chrome.storage.local.set({date: newDate},function() {
				onWindow(windowId);
			});
		}
	});	
});

function onWindow(windowId) {
	chrome.tabs.query({windowId, active:true},function(tabs) {
		console.log('tabs',tabs, 'only on actibve window');
		let tab = tabs[0];
		if (tab && !tab.pendingUrl && isReddit(tab.url)) startTimer();
		else stopTimer();
	});
}

function timer(seconds) {
	// time in milliseconds
	displayTimeLeft(secondsLeft);
	if (!countdown) {
		let now = Date.now(); 
		let then = now + seconds * 1000;
		// every second, display amount of time left, use setInterval
		countdown = setInterval(() => {
			secondsLeft = Math.round((then - Date.now())/1000); // convert to seconds and round
			// check if we should stop it
			chrome.runtime.sendMessage({msg:"updateTime",timeLeft:secondsLeft});
			console.log(secondsLeft);
			displayTimeLeft(secondsLeft);
			if (secondsLeft<=0) {     
				clearInterval(countdown);
				countdown = null;
				blockYoutube();
			}
		},1000);
	}
}

function startTimer() {
	chrome.storage.local.get({timeLeft:defaultTime},function(data) {
		if (data.timeLeft>0) timer(data.timeLeft);
		else blockYoutube();
	});
}

function stopTimer() {
	clearInterval(countdown);
	countdown = null;
	chrome.storage.local.set({timeLeft:secondsLeft},function(){
		chrome.browserAction.setBadgeText({text:""});
	});
}

function displayTimeLeft(seconds) {
	const hours = Math.floor(seconds/60/60);	
	const minutes = Math.floor((seconds - (hours*60*60))/60);
	const remainderSeconds = seconds % 60;

	const adjustedHours = `${hours<10?0:''}${hours}`;
	const adjustedMinutes = `${minutes<10?0:''}${minutes}`;
	const adjustedSeconds = `${remainderSeconds<10?0:''}${remainderSeconds}`;
	const display = hours == 0 && minutes<60 ? `${adjustedMinutes}:${adjustedSeconds}`
			:
		`${adjustedHours}:${adjustedMinutes}:${adjustedSeconds}`;
	chrome.browserAction.setBadgeText({text:display});
}

function blockYoutube() {
	chrome.tabs.update(null,{url: "html/blocked.html"});
}

function isReddit(url) {
	if (!url) return;
	let urlObj = new URL(url);
	let domain = urlObj.hostname;
	return domain === "www.reddit.com" ? true:false;
}

function isSameDay(date1,date2) {
	return date1 === date2;
}