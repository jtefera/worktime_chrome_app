var hoursSpan = document.getElementById("hours"),
    minutesSpan = document.getElementById("minutes"),
    secondsSpan = document.getElementById("seconds"),
    startStopBtn = document.getElementById("startStop"),
    restartBtn = document.getElementById("restart"),
    clearAllBtn = document.getElementById("clearAll"),
    clearCanceledBtn = document.getElementById("clearCanceled"),
    clearComfirmedBtn = document.getElementById("clearComfirmed"),
    clearComfirmBoxDiv = document.getElementById("clearComfirmBox"),
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
    totalTimeBeforeStart = 0,
    listPeriods = [];

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
  totalTime -= timer;
  timer = 0;
  renderFromTimer(timer);
  renderTotalTIme(totalTime);
  if(startInterval) {
    startStopBtn.textContent = "Start!"
    clearInterval(startInterval);
  }
});

clearAllBtn.addEventListener("click", function() {
  clearComfirmBoxDiv.style.display = "block";
})

clearCanceledBtn.addEventListener("click", function() {
  clearComfirmBoxDiv.style.display = "none";
})

clearComfirmedBtn.addEventListener("click", function() {
  //Hide comfirm box
  clearComfirmBoxDiv.style.display = "none";
  //Set timers to 0
  timer = 0;
  totalTime = 0;
  renderFromTimer(timer);
  renderTotalTIme(timer);
  //Stop all process
  if(startInterval){
    startStopBtn.textContent = "Start!"
    clearInterval(startInterval);
  }
  //Clear all the list
  listPeriods = []
  renderListPeriods();
})

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
  addToList(localTimeStartInterval, timer);
  renderListPeriods();
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

function renderListPeriods() {
  //Reset the list.
  //Erase all the childs. This could be done by setting
  //listTimesUl.innerHTML = ""
  //But this method is faster.
  //See: http://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
  while(listTimesUl.firstChild) {
    listTimesUl.removeChild(listTimesUl.firstChild);
  }
  listPeriods.map(function(dayObj) {
    //Date Part
    var today = new Date(),
        dateLi = document.createElement("li"),
        boldDay = document.createElement("b");
    boldDay.textContent = (dayObj.date.toDateString() === today.toDateString()) ?
                          "Today"
                          : dayObj.date.toDateString();
    dateLi.appendChild(boldDay);
    listTimesUl.appendChild(dateLi);

    //Total of the Day Part
    var totalOfDayLi = document.createElement("li");
    totalOfDayLi.textContent = "Total time: " + hmsFromTimer(dayObj.totalOfDay);
    listTimesUl.appendChild(totalOfDayLi);

    //Periods Parts
    dayObj.periods.map(function(period) {
      var newPeriodLi = document.createElement("li");

      newPeriodLi.textContent = period;
      listTimes.appendChild(newPeriodLi);
    });
  });
}

function renderTotalTIme(totalTime) {
  totalTimeH4.textContent = "Total Time: " + hmsFromTimer(totalTime);
}

function addToList(lcTimeStartDate, periodTimer) {
  var today = new Date(),
      isLastPeriodSameDayToday;
  //Case is not firsta adquisition
  if(listPeriods.length) {
    var lastPeriodDate = listPeriods[0].date;
    isLastPeriodSameDayToday =
            lastPeriodDate.toDateString() === today.toDateString();
  }

  var lcTimeStartStr = hmFromDate(lcTimeStartDate),
      lcTimestopStr = hmFromDate(new Date()),
      intervalStr = (lcTimeStartStr === lcTimestopStr)?
                    lcTimeStartStr + ": "
                    : lcTimeStartStr + "-" + lcTimestopStr + ": ",
      timerStr = hmsFromTimer(periodTimer),
      itemStr = intervalStr + timerStr;
  if(isLastPeriodSameDayToday){
    listPeriods[0] = listPeriods[0] || {};
    listPeriods[0].periods = listPeriods[0].periods || [];
    listPeriods[0].date = listPeriods[0].date || new Date();
    listPeriods[0].periods.unshift(itemStr);
    listPeriods[0].totalOfDay += periodTimer;
  } else {
    //Case different days or this is the first adquisition
    var newDayOnList = {};

    newDayOnList.date = new Date();
    newDayOnList.periods = [itemStr];
    newDayOnList.totalOfDay = periodTimer;
    listPeriods.unshift(newDayOnList);
  }

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
