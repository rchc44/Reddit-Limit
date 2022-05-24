try {
const form = document.querySelector("form[name='customForm']");
const resetBtn = document.querySelector('.reset');
const input = document.querySelector("input[type='text']");
const defaultTime = 60*60;


// loads current allowed time 
// if no saved time, loads default time
document.addEventListener('DOMContentLoaded', function(e) {
	chrome.storage.local.get({timeLimit: defaultTime},function(items) {
		if (!input.value) {
			input.value = items.timeLimit/60;
		}
	});
});

// handles saving user inputted time
form.addEventListener('submit',function(e) {
	e.preventDefault();
	let mins = Number(this.minutes.value);
	if (isNaN(mins) || mins<0) {
		alert("Please enter a number");
		return;
	}
	// current max allowed time if 720 minutes
	// if user enters more than 720 minutes, set to max of 720
	if (mins > 720) mins=720;
	resetTime(mins);
	alert("Time Saved");
});


// adds method to button to reset the allowed daily time
resetBtn.addEventListener('click',function(e) {
	let input = document.querySelector("input[type='text']");
	let mins = Number(input.value);
	resetTime(mins);
	alert("Time Reset");
})


// resets global timeLeft var in background.js
function resetTime(mins) {  
	let time = mins*60;
	let newDate = (new Date()).toDateString();
	chrome.storage.local.set({timeLimit: time, timeLeft: time, date: newDate},function(response) {
		chrome.runtime.sendMessage({msg:"resetTime",timeLeft:time},function(response) {
			console.log('response',response);
			console.log('new time and date',time,newDate);
		});		
	});	
}

}
catch (e) {
	console.log("Error:",e);

}