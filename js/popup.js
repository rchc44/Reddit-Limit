const timerDisplay = document.querySelector('.display__time-left');

// runs code when popup.html opened by user clicking on extension icon
document.addEventListener('DOMContentLoaded',function(e) {
	// gets timeLeft when open popup and displays in popup.html
	chrome.runtime.sendMessage({msg:"sendTime"},function(response) {
		if (response.timeLeft) displayTimeLeft(response.timeLeft);
	});
	// receives updated time and updates popup.html timer if popup left open
	chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
		if (request.msg == "updateTime") {
			if (request.timeLeft) displayTimeLeft(request.timeLeft);
		}
	});	
});


function displayTimeLeft(seconds) {
	// convert seconds to hh:mm:ss format
	const hours = Math.floor(seconds/60/60);	
	const minutes = Math.floor((seconds - (hours*60*60))/60);
	const remainderSeconds = seconds % 60;

	const adjustedHours = `${hours<10?0:''}${hours}`;
	const adjustedMinutes = `${minutes<10?0:''}${minutes}`;
	const adjustedSeconds = `${remainderSeconds<10?0:''}${remainderSeconds}`;
	const display = hours == 0 && minutes<60 ? `${adjustedMinutes}:${adjustedSeconds}`
			:
		`${adjustedHours}:${adjustedMinutes}:${adjustedSeconds}`;
	timerDisplay.textContent = display;
}
