const form = document.querySelector("form[name='customForm']");
const resetBtn = document.querySelector('.reset');
const input = document.querySelector("input[type='text']");
const defaultTime = 60*60;

document.addEventListener('DOMContentLoaded', function(e) {
	chrome.storage.local.get({timeLimit: defaultTime},function(items) {
		if (!input.value) {
			input.value = items.timeLimit/60;
		}
	});
});

form.addEventListener('submit',function(e) {
	e.preventDefault();
	let mins = Number(this.minutes.value);
	if (isNaN(mins) || mins<0) {
		alert("Please enter a number");
		return;
	}
	if (mins > 720) mins=720;
	resetTime(mins);
	alert("Time Saved");
});

resetBtn.addEventListener('click',function(e) {
	let input = document.querySelector("input[type='text']");
	let mins = Number(input.value);
	resetTime(mins);
	alert("Time Reset");
})

function resetTime(mins) {  // resets global timeLeft var in background.js
	let time = mins*60;
	let newDate = (new Date()).toDateString();
	chrome.storage.local.set({timeLimit: time, timeLeft: time, date: newDate},function(response) {
		chrome.runtime.sendMessage({msg:"resetTime",timeLeft:time},function(response) {
			console.log('response',response);
			console.log('new time and date',time,newDate);
		});		
	});	
}

