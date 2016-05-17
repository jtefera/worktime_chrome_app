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
    listPeriods = []

//Retrieving list from previous sessions

const saveListPeriodsToLocal = (callback) => {
  chrome.storage.local.set({
    'list': listPeriods
  }, callback)
}

const setListPeriodsFromLocal = (callback) => {
  chrome.storage.local.get('list', function(item) {
    listPeriods = item.list
    if(callback) callback()
  })
}

const initApp = () => {
  setListPeriodsFromLocal(() => {
    if(listPeriods.length){
      renderListPeriods()
      if(listPeriods[0].date === dmyFromDate(new Date())){
        totalTime = totalTimeDay(listPeriods[0].periods)
      }
      renderTotalTime(totalTime)
    }
  })
}
//Set initial list view
initApp()

startStopBtn.addEventListener("click", function() {
  var action = startStopBtn.textContent.trim()
  if(action === "Start!") {
    start()
  } else if(action === "Stop!") {
    stop()
  } else {
    throw("Err: startStopBtn is not 'Start!' or 'Stop!' but " + action)
  }
})

restartBtn.addEventListener("click", function() {
  totalTime -= timer
  timer = 0
  renderFromTimer(timer)
  renderTotalTime(totalTime)
  saveListPeriodsToLocal()
  if(startInterval) {
    startStopBtn.textContent = "Start!"
    clearInterval(startInterval)
  }
})

clearAllBtn.addEventListener("click", function() {
  clearComfirmBoxDiv.style.display = "block"
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
  renderTotalTime(timer);
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

  if(listPeriods[0] && listPeriods[0].date === dmyFromDate(localTimeStartInterval)) {
    totalTimeBeforeStart = listPeriods[0].totalOfDay
  } else {
    totalTimeBeforeStart = 0;
  }
  startInterval = setInterval(function() {
    timeNow = Date.now();
    timer = timerBeforeStart + timeNow - timeStartInterval;
    totalTime = totalTimeBeforeStart + timeNow - timeStartInterval;
    renderFromTimer(timer);
    renderTotalTime(totalTime);
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
  addToList({
    listPeriods,
    localTimeStartInterval,
    periodTimer: timer})
  //Save to local
  saveListPeriodsToLocal()
  renderListPeriods();
  timer = 0;
  renderFromTimer(timer);

}

function renderFromTimer(timer = timer) {
  var HMSObj = hmsFromTimer(timer);
  hoursSpan.textContent = HMSObj.HH;
  minutesSpan.textContent = HMSObj.MM;
  secondsSpan.textContent = HMSObj.SS;
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
  listPeriods.map(function(dayObj, dayId) {
    //Date Part
    var today = new Date(),
        dateLi = document.createElement("li"),
        boldDay = document.createElement("b");
    boldDay.textContent = (dayObj.date === dmyFromDate(today)) ?
                          "Today"
                          : dayObj.date;
    dateLi.appendChild(boldDay);
    listTimesUl.appendChild(dateLi);

    //Total of the Day Part
    var totalOfDayLi = document.createElement("li");
    totalOfDayLi.textContent = "Total time: "
                              + hmsFromTimer(dayObj.totalOfDay).hms;
    listTimesUl.appendChild(totalOfDayLi);

    //Periods Parts
    dayObj.periods.map(function(period, periodId) {
      var newPeriodLi = document.createElement("li"),
          newEraseLink = document.createElement("a"),
          paramEraseFunc = {
            idDay: dayId,
            idPeriod: periodId
          }

      newPeriodLi.textContent = period.str

      newEraseLink.textContent = "Erase"
      newEraseLink.setAttribute('href', '#')
      newEraseLink.addEventListener("click", (e) => {
        e.preventDefault()
        erasePeriod(paramEraseFunc)
        saveListPeriodsToLocal(() => {
          renderListPeriods()
          totalTime = totalTimeOfToday(listPeriods)
          renderTotalTime(totalTime)
        })
        //renderListPeriods()
      })

      newPeriodLi.appendChild(newEraseLink)
      listTimes.appendChild(newPeriodLi);

    });
  });
}

function renderTotalTime(totalTime) {
  totalTimeH4.textContent = "Total Time of Day: " + hmsFromTimer(totalTime).hms;
}

const addToList = (params) => {
  if(!params.localTimeStartInterval || !params.periodTimer){
    return;
  }

  let listPer = params.listPeriods || listPeriods,
      lcTimeStartDate = params.localTimeStartInterval,
      periodTimer  = params.periodTimer;
  var lcTimeStopDate = params.localcTimeStopInterval || new Date(), //lcTimeStopDate can be passed for tests
      isLastPeriodSameDateAddPeriod,
      isBegAndEndPeriodSameDay =
              dmyFromDate(lcTimeStartDate) === dmyFromDate(lcTimeStopDate);

  //Case Start and finish of the period are on differnt dates
  if(!isBegAndEndPeriodSameDay){
    var lcTimeStopReal = lcTimeStopDate,
        lcTimeEndDay = new Date(lcTimeStartDate.toDateString() + " 23:59:59"),
        periodFromPeriodStartToEndDay = lcTimeEndDay.getTime()
                                        - lcTimeStartDate.getTime(),
        lcTimeStopDate = lcTimeEndDay;
    var periodTimerNextDays = periodTimer - periodFromPeriodStartToEndDay;
        periodTimer = periodFromPeriodStartToEndDay
  }
  //Case is not firsta adquisition
  if(listPer.length) {
    var lastPeriodDate = listPer[0].date;
    isLastPeriodSameDateAddPeriod =
            lastPeriodDate === dmyFromDate(lcTimeStartDate);
  }

  var lcTimeStartStr = hmFromDate(lcTimeStartDate),
      lcTimestopStr = hmFromDate(lcTimeStopDate),
      intervalStr = (lcTimeStartStr === lcTimestopStr)?
                    lcTimeStartStr + ": "
                    : lcTimeStartStr + "-" + lcTimestopStr + ": ",
      timerStr = hmsFromTimer(periodTimer).hms,
      itemStr = intervalStr + timerStr,
      periodObj = {
        str: itemStr,
        periodTimer: periodTimer
      }


  if(isLastPeriodSameDateAddPeriod){
    listPer[0] = listPer[0]
    listPer[0].periods.unshift(periodObj)
    listPer[0].totalOfDay = totalTimeDay(listPer[0].periods)
  } else {
    //Case different days or this is the first adquisition
    var newDayOnList = {}

    newDayOnList.date = dmyFromDate(lcTimeStartDate);
    newDayOnList.periods = [periodObj];
    newDayOnList.totalOfDay = periodTimer;
    listPer.unshift(newDayOnList);
  }

  if(!isBegAndEndPeriodSameDay) {
    let nextDayStart = lcTimeStartDate
    nextDayStart.setDate(lcTimeStartDate.getDate() + 1)
    nextDayStart.setHours(0)
    nextDayStart.setMinutes(0)
    nextDayStart.setSeconds(0)

    let newParams = Object.assign({}, params, {
            localTimeStartInterval: nextDayStart,
            periodTimer: periodTimerNextDays
        })
    addToList(newParams)
  }
  return listPer;

}

const erasePeriod = (params) => {
  if(!isFinite(params.idDay) || !isFinite(params.idPeriod)) {
    //Check that idDay and idPeriod are numbers
    throw("No idDay or idPeriod specified on the erasePeriod ")
  }

  let listP = params.listPeriods || listPeriods, //ForTesting
      idDay = Number(params.idDay),
      idPeriod = Number(params.idPeriod)

  if(idDay >= listP.length){
    //Case idDay is invalid
    throw(
          "idDay is larger than the number of days recorded on the listP arr",
          "idDay", idDay,
          "list", listP
        )
  }
  if(idPeriod >= listP[idDay].periods.length) {
    throw(
      "idPeriod is larger than the number of periods on the idDay day",
      "idDay", idDay,
      "idPeriod", idPeriod,
      "list", listP
    )
  }
  //From here on, should be clean cases
  let erased = listP[idDay].periods.splice(idPeriod, 1)[0]
  listP[idDay].totalOfDay -= erased.periodTimer

  if(params.testMode){
    return {
            list: listP,
            erased: erased
          }
  } else {
    return erased
  }

}



const hmsFromTimer = (timer) => {
  if(isFinite(timer)){
    timer = (timer < 0) ? -timer : timer //Only pos Numbers.
    var totSeconds = timer/1000,
        hours = Math.floor(totSeconds/3600),
        minutes = Math.floor((totSeconds % 3600) / 60),
        seconds = Math.floor(totSeconds % 60),
        hoursStr = (hours) ? hours + "h" : "",
        minutesStr = (minutes || hours) ? minutes + "min" : "",
        secondsStr = seconds + "sec",
        hms = hoursStr + ((hoursStr) ? " ": "")
              + minutesStr + ((minutesStr) ? " " : "")
              + secondsStr,
        hm = hoursStr + ((hoursStr) ? " ": "")
              + minutesStr,
        HH = (hours.toString().length <= 1)?
                  "0" + hours
                  : hours,
        MM = (minutes.toString().length <= 1)?
                  "0" + minutes
                  : minutes,
        SS = (seconds.toString().length <= 1)?
                  "0" + seconds
                  : seconds,
        HMS = HH + ":" + MM + ":" + SS,
        HM = HH + ":" + MM,
        formats = {
          h: hours,
          min: minutes,
          sec: seconds,
          hStr: hoursStr,
          minStr: minutesStr,
          secStr: secondsStr,
          HH: HH,
          MM: MM,
          SS: SS,
          hms: hms,
          HMS: HMS,
          hm: hm,
          HM: HM,
          input: timer
        }
  } else {
    var formats = {
          error: timer + " is not a number"
        }
  }

  return formats;

}



const dmyFromDate = (date = new Date) => {
  return  date.getDate() + "-"
          + (date.getMonth() + 1) + "-"
          + date.getFullYear()
}



const hmFromDate = (date = new Date) => {

  let hours = date.getHours(),
      minutes = date.getMinutes(),
      hoursStr = (hours.toString().length <= 1) ?
                "0" + hours
                : hours,
      minutesStr = (minutes.toString().length <= 1) ?
                "0" + minutes
                : minutes;
  return hoursStr + ":" + minutesStr;
}

const totalTimeDay = (periodsArr)  => {
  return periodsArr
        .reduce((total, period) => total + period.periodTimer, 0)
}

const totalTimeOfToday = (listP = listPeriods) => {
  if(listP && listP[0]) {
    if(listP[0].date === dmyFromDate(new Date)) {
      return totalTimeDay(listP[0].periods)
    }
  }
  return 0
}
