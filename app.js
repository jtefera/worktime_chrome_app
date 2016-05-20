var hoursSpan = document.getElementById("hours"),
    minutesSpan = document.getElementById("minutes"),
    secondsSpan = document.getElementById("seconds"),
    startStopBtn = document.getElementById("startStop"),
    salaryPeriodSpan = document.getElementById("salaryPeriod"),
    salaryTotalSpan = document.getElementById("salaryTotal"),
//  restartBtn = document.getElementById("restart"),
    clearAllBtn = document.getElementById("clearAll"),
    clearCanceledBtn = document.getElementById("clearCanceled"),
    clearComfirmedBtn = document.getElementById("clearComfirmed"),
    clearComfirmBoxDiv = document.getElementById("clearComfirmBox"),
    listTimesUl = document.getElementById("listTimes"),
    totalTimeH4 = document.getElementById("totalTime"),
    dolPerHourIn = document.getElementById("dolPerHour"),
    timer = 0,
    startInterval,
    timeNow = 0,
    timeStartInterval = 0,
    timerBeforeStart = 0,
    timePreviousPeriod = 0,
    localTimeStartInterval,
    totalTime = 0,
    totalTimeBeforeStart = 0,
    listPeriods = [],
    salaryRate = 15;

const NUMBER_DECIMALS_SALARY = 2

//Retrieving list from previous sessions

const saveListPeriodsToLocal = (callback) => {
  //Save current state of the listPeriods variable into the local
  //storage from chrome. With this, the list can be saved for several days
  //even after the computer has been restarted
  chrome.storage.local.set({
    'list': listPeriods
  }, callback)
}

const setListPeriodsFromLocal = (callback) => {
  //Set the listPeriods variable from the copy in the local
  //storage. Used for initialize from previous session
  chrome.storage.local.get('list', (item) => {
    listPeriods = item.list
    if(callback) callback()
  })
}

const initApp = () => {
  //Set listPeriods var from the values saved in the previous session
  setListPeriodsFromLocal(() => {
    if(listPeriods.length){
      renderListPeriods()
      if(listPeriods[0].date === dmyFromDate(new Date())){
        totalTime = totalTimeDay(listPeriods[0].periods)
      }
      renderTotalTime(totalTime)
      renderSalaryPeriod()
      renderSalaryTotalOfDay()
    }
  })
}
//Set initial list view
initApp()

startStopBtn.addEventListener("click", () => {
  //Main button. Controls the start and the stom of the timer
  var action = startStopBtn.textContent.trim()
  if(action === "Start!") {
    start()
  } else if(action === "Stop!") {
    stop()
  } else {
    throw("Err: startStopBtn is not 'Start!' or 'Stop!' but " + action)
  }
})

/*

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
})*/

clearAllBtn.addEventListener("click", () => {
  //Clear btn. After pressing this button,
  //the comfirm panel appears
  clearComfirmBoxDiv.style.display = "block"
})

clearCanceledBtn.addEventListener("click", () => {
  //Cancel clear btn from the comfirm box
  clearComfirmBoxDiv.style.display = "none";
})

clearComfirmedBtn.addEventListener("click", () => {
  //Hide comfirm box
  clearComfirmBoxDiv.style.display = "none";
  //Set timers to 0
  timer = 0;
  totalTime = 0;
  renderFromTimer(timer);
  renderTotalTime(totalTime);
  //Stop all process
  if(startInterval){
    startStopBtn.textContent = "Start!"
    clearInterval(startInterval);
  }
  //Clear all the list
  listPeriods = []
  renderListPeriods();
})

dolPerHourIn.addEventListener("change", (e) => {
  salaryRate = Number(e.target.value)
  renderFromTimer(timer)
  renderTotalTime(totalTime)
  renderSalaryPeriod()
  renderSalaryTotalOfDay()
  renderListPeriods()
})

const start = () => {
  //After start button pressed

  //Time of interval start
  localTimeStartInterval = new Date();
  //change start stop button text to stop
  startStopBtn.textContent = "Stop!";

  //date now gives the milliseconds from 1970
  timeStartInterval = Date.now()
  //Probably useless as timer at this moment should be 0
  //as there is no pause button(only stop). Useful if you want to implement
  //a pause botton
  timerBeforeStart = timer

  //0 if this is the first period of the day. If not,
  //it calculates the sum of all periods of the day
  totalTimeBeforeStart = totalTimeOfToday(listPeriods)

  //Set interval that updates every second the visualization of the timer
  //and the timers itself
  startInterval = setInterval(() => {
    timeNow = Date.now()
    timer = timerBeforeStart + timeNow - timeStartInterval
    totalTime = totalTimeBeforeStart + timeNow - timeStartInterval
    renderFromTimer(timer)
    renderTotalTime(totalTime)
    renderSalaryPeriod()
    renderSalaryTotalOfDay()
  }, 1000);
}

const stop = () => {
  //When stop button is pressed.
  //Restarts the timer, adds into the listPeriods arr the actual period
  //and rerenders everypart

  //Change startStopBtn to start mode
  startStopBtn.textContent = "Start!"

  //clear the interval that updated the timers every second
  clearInterval(startInterval)

  let newPeriodLi = document.createElement("li"),
      hmLTStart = hmFromDate(localTimeStartInterval),
      hmLTStop = hmFromDate(new Date()),
      intPeriod = (hmLTStop === hmLTStart) ?
                 hmLTStart + ": "
                 : hmLTStart + "-" + hmLTStop + ": ";
  //Add to the listPeriods
  addToList({
    listPeriods,
    localTimeStartInterval,
    periodTimer: timer})
  //Save to local
  saveListPeriodsToLocal()
  //Rerenders
  renderListPeriods();
  timer = 0;
  renderFromTimer(timer);

}

const renderFromTimer = (timer = timer) => {
  //Displays on the app the timer formatted into h:m:s
  var HMSObj = hmsFromTimer(timer);
  hoursSpan.textContent = HMSObj.HH;
  minutesSpan.textContent = HMSObj.MM;
  secondsSpan.textContent = HMSObj.SS;
}

const renderListPeriods = () => {
  //Renders the listPeriods arr into the display as li elements

  while(listTimesUl.firstChild) {
    //Reset the list.
    //Erase all the childs. This could be done by setting
    //listTimesUl.innerHTML = ""
    //But this method is faster.
    //See: http://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
    listTimesUl.removeChild(listTimesUl.firstChild);
  }


  listPeriods.map((dayObj, dayId) => {
    //Display every day object formed by date, periods arr and total timer
    //of the day

    //Date Part
    let today = new Date(),
        dateLi = document.createElement("li"),
        boldDay = document.createElement("b");
    boldDay.textContent = ((dayObj.date === dmyFromDate(today)) ?
                          "Today"
                          : dayObj.date)
                          + ". "
                          + ((salaryRate * totalTimeDay(dayObj.periods)) / (1000 * 3600))
                          .toFixed(NUMBER_DECIMALS_SALARY)
                          + "$";
    dateLi.appendChild(boldDay);
    listTimesUl.appendChild(dateLi);

    //Total of the Day Part
    var totalOfDayLi = document.createElement("li");
    totalOfDayLi.textContent = "Total time: "
                              + hmsFromTimer(dayObj.totalOfDay).hms;
    listTimesUl.appendChild(totalOfDayLi);

    //Periods Parts
    dayObj.periods.map((period, periodId) => {
      var newPeriodLi = document.createElement("li"),
          newEraseLink = document.createElement("a"),
          paramEraseFunc = {
            idDay: dayId,
            idPeriod: periodId
          }

      newPeriodLi.textContent = period.str + ". "
          + (salaryRate * period.periodTimer / ( 1000 * 60 * 60))
          .toFixed(NUMBER_DECIMALS_SALARY) + "$. "

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

const renderSalaryPeriod = () => {
  salaryPeriodSpan.textContent = (salaryRate * timer / (1000 * 60 * 60))
                                  .toFixed(NUMBER_DECIMALS_SALARY)
}

const renderSalaryTotalOfDay = () => {
  salaryTotalSpan.textContent =
        (salaryRate * totalTimeOfToday(listPeriods) / (1000 * 60 * 60))
        .toFixed(NUMBER_DECIMALS_SALARY)
}

const renderTotalTime = (totalTime) => {
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
    //Case last period was done in the same day than this one
    //No need to create new Object
    //add new period to periods array and update the total time
    listPer[0].periods.unshift(periodObj)
    listPer[0].totalOfDay = totalTimeDay(listPer[0].periods)
  } else {
    //Case different days or this is the first adquisition
    //Create new list for the day and add it to the listperiods array
    var newDayOnList = {}

    newDayOnList.date = dmyFromDate(lcTimeStartDate);
    newDayOnList.periods = [periodObj];
    newDayOnList.totalOfDay = periodTimer;
    listPer.unshift(newDayOnList);
  }

  if(!isBegAndEndPeriodSameDay) {
    //Case the begining of the period is in a different day than the End
    //of the period
    //Subdivide the period in the day division time (23:59-00:00)
    //adding the first day
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
  //erase specified period from a day
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
