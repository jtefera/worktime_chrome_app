var hoursSpan = document.getElementById("hours"),
    minutesSpan = document.getElementById("minutes"),
    secondsSpan = document.getElementById("seconds"),
    startStopBtn = document.getElementById("startStop"),
    restartBtn = document.getElementById("restart"),
    listTimesUl = document.getElementById("listTimes"),
    totalTimeH4 = document.getElementById("totalTime"),
    timer = 0,
    startInterval,
    timeNow = 0,
    timeStartInterval = 0,
    timerBeforeStart = 0,
    timePreviousPeriod = 0,
    localTimeStartInterval,
    totalTime = 0,
    totalTimeBeforeStart = 0;

startStopBtn.addEventListener("click", function() {
  var action = startStopBtn.textContent.trim();
  if(action === "Start!") {
    start();
  } else if(action === "Stop!") {
    stop();
  } else {
    throw("Err: startStopBtn is not 'Start!' or 'Stop!' but " + action);
  }
});

restartBtn.addEventListener("click", function() {
  timer = 0;
  renderFromTimer(timer);
  if(startInterval) {
    startStopBtn.textContent = "Start!"
    clearInterval(startInterval);
  }
});

function start() {
  localTimeStartInterval = new Date();
  startStopBtn.textContent = "Stop!";
  timeStartInterval = Date.now();
  timerBeforeStart = timer;
  totalTimeBeforeStart = totalTime;
  startInterval = setInterval(function() {
    timeNow = Date.now();
    timer = timerBeforeStart + timeNow - timeStartInterval;
    totalTime = totalTimeBeforeStart + timeNow - timeStartInterval;
    totalTime += timeNow -
    renderFromTimer(timer);
    renderTotalTIme(totalTime);
  }, 1000);
}

function stop() {

  startStopBtn.textContent = "Start!"
  clearInterval(startInterval);
  var newPeriodLi = document.createElement("li"),
      hmLTStart = hmFromDate(localTimeStartInterval),
      hmLTStop = hmFromDate(new Date()),
      intPeriod = (hmLTStop === hmLTStart) ?
                 hmLTStart + ": "
                 : hmLTStart + "-" + hmLTStop + ": ";
  ;
  newPeriodLi.textContent = intPeriod + hmsFromTimer(timer);
  listTimes.appendChild(newPeriodLi);

  timer = 0;
  renderFromTimer(timer);

}

function renderFromTimer(timer) {
  var totSeconds = timer/1000,
    hours = Math.floor(totSeconds/3600),
    minutes = Math.floor((totSeconds % 3600) / 60),
    seconds = Math.floor(totSeconds % 60);

  hoursSpan.textContent = (hours.toString().length <= 1)  ?
                            "0" + hours.toString()
                            : hours;
  minutesSpan.textContent = (minutes.toString().length <= 1)  ?
                            "0" + minutes.toString()
                            : hours;
  secondsSpan.textContent = (seconds.toString().length <= 1)  ?
                            "0" + seconds.toString()
                            : seconds;
}

function renderTotalTIme(totalTime) {
  totalTimeH4.textContent = hmsFromTimer(totalTime);
}

function hmsFromTimer(timer) {
  var totSeconds = timer/1000,
      hours = Math.floor(totSeconds/3600),
      minutes = Math.floor((totSeconds % 3600) / 60),
      seconds = Math.floor(totSeconds % 60),
      hoursStr = (hours) ? hours + "h " : "",
      minutesStr = (minutes || hours) ? minutes + "min " : "",
      str = hoursStr + minutesStr + seconds + "sec";
      return str;
}

function hmFromDate(date) {
  var hours = date.getHours(),
      minutes = date.getMinutes(),
      hoursStr = (hours.toString().length <= 1) ?
                "0" + hours
                : hours,
      minutesStr = (minutes.toString().length <= 1) ?
                "0" + minutes
                : minutes;
  return hoursStr + ":" + minutesStr;
}
