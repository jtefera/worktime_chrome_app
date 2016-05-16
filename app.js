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
  addToList({
    listPeriods,
    localTimeStartInterval,
    periodTimer: timer});
  renderListPeriods();
  timer = 0;
  renderFromTimer(timer);

}

function renderFromTimer(timer) {
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
  listPeriods.map(function(dayObj) {
    //Date Part
    var today = new Date(),
        dateLi = document.createElement("li"),
        boldDay = document.createElement("b");
    boldDay.textContent = (dayObj.date === today.toDateString()) ?
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
    dayObj.periods.map(function(period) {
      var newPeriodLi = document.createElement("li");

      newPeriodLi.textContent = period;
      listTimes.appendChild(newPeriodLi);
    });
  });
}

function renderTotalTIme(totalTime) {
  totalTimeH4.textContent = "Total Time: " + hmsFromTimer(totalTime).hms;
}

const addToList = (params) => {
  if(!params.localTimeStartInterval || !params.periodTimer){
    return;
  }

  let listPer = params.listPeriods || listPeriods,
      lcTimeStartDate = params.localTimeStartInterval,
      periodTimer  = params.periodTimer,
      today = params.today || new Date(), //today can be passed for tests
      isLastPeriodSameDateAddPeriod;

  //Case is not firsta adquisition
  if(listPer.length) {
    var lastPeriodDate = listPer[0].date;
    isLastPeriodSameDateAddPeriod =
            lastPeriodDate === lcTimeStartDate.toDateString();
  }

  var lcTimeStartStr = hmFromDate(lcTimeStartDate),
      lcTimestopStr = hmFromDate(today),
      intervalStr = (lcTimeStartStr === lcTimestopStr)?
                    lcTimeStartStr + ": "
                    : lcTimeStartStr + "-" + lcTimestopStr + ": ",
      timerStr = hmsFromTimer(periodTimer).hms,
      itemStr = intervalStr + timerStr;
  if(isLastPeriodSameDateAddPeriod){
    listPer[0] = listPer[0]
    listPer[0].periods.unshift(itemStr)
    listPer[0].totalOfDay += periodTimer
  } else {
    //Case different days or this is the first adquisition
    var newDayOnList = {};
    newDayOnList.date = lcTimeStartDate.toDateString();
    newDayOnList.periods = [itemStr];
    newDayOnList.totalOfDay = periodTimer;
    listPer.unshift(newDayOnList);
  }
  return listPer;

}


const testAddPeriod = () => {
  //Firt case test, we add to an empty list a period started in the
  //same day
  let listBef = [],
      lcTimeStartStr = hmFromDate(new Date("12/10/2015 10:20")),
      lcTimestopStr = hmFromDate(new Date("12/10/2015 10:20:04")),
      intervalStr =  "10:20: 4sec",
      listAft = [
        {
          date: new Date("12/10/2015 10:20").toDateString(),
          periods: [intervalStr],
          totalOfDay: 4000,
        }
      ],
      params1 = {
        listPeriods: listBef,
        localTimeStartInterval: new Date("12/10/2015 10:20:00"),
        today: new Date("12/10/2015 10:20:04"),
        periodTimer: 4000
      }
  console.log("1 AddPeriod: Case add period to empty array");
  expect(addToList(params1)).toEqual(listAft);

  //Case adding period to  empty array. Different hours
  let listBef2 = [],
      intervalStr2 =  "10:20-10:21: 4sec",
      listAft2 = [
        {
          date: new Date("12/10/2015 10:20").toDateString(),
          periods: [intervalStr2],
          totalOfDay: 4000,
        }
      ],
      params2 = {
        listPeriods: listBef2,
        localTimeStartInterval: new Date("12/10/2015 10:20:00"),
        today: new Date("12/10/2015 10:21:04"),
        periodTimer: 4000
      }
  console.log("2 AddPeriod: Case add period to empty array different hm");
  expect(addToList(params2)).toEqual(listAft2);

  //Case adding period to non empty array. Same Day
  let listBef3 = [
        {
          date: new Date("12/10/2015 9:20").toDateString(),
          periods: ["09:20-09:21: 4sec"],
          totalOfDay: 4000,
        }
      ],
      listAft3 = [
        {
          date: new Date("12/10/2015 9:20").toDateString(),
          periods: [
                    "10:20-10:21: 4sec",
                    "09:20-09:21: 4sec"
                  ],
          totalOfDay: 8000,
        }
      ],
      params3 = {
        listPeriods: listBef3,
        localTimeStartInterval: new Date("12/10/2015 10:20:00"),
        today: new Date("12/10/2015 10:21:04"),
        periodTimer: 4000
      }
  console.log("3 AddPeriod: Case add period to non empty list. Same Day");
  expect(addToList(params3)).toEqual(listAft3);

  //Case adding period to non empty array. Different Date
  let listBef4 = [
        {
          date: new Date("12/10/2015 9:20").toDateString(),
          periods: ["09:20-09:21: 4sec"],
          totalOfDay: 4000,
        }
      ],
      listAft4 = [
        {
          date: new Date("12/11/2015 10:20").toDateString(),
          periods: ["10:20-10:21: 10sec"],
          totalOfDay: 10000,
        },
        {
          date: new Date("12/10/2015 9:20").toDateString(),
          periods: ["09:20-09:21: 4sec"],
          totalOfDay: 4000,
        }
      ],
      params4 = {
        listPeriods: listBef4,
        localTimeStartInterval: new Date("12/11/2015 10:20:00"),
        today: new Date("12/11/2015 10:21:04"),
        periodTimer: 10000
      }
      console.log("4 AddPeriod: Case add period to non empty list. Different Day");
      expect(addToList(params4)).toEqual(listAft4);

}

function hmsFromTimer(timer) {
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

function testHmsFromTimer() {
  var timer1 = 1000, //1sec
      expected1 = {
        h: 0,
        min: 0,
        sec: 1,
        hStr: "",
        minStr: "",
        secStr: "1sec",
        hms: "1sec",
        input: 1000,
        HH: "00",
        MM: "00",
        SS: "01",
        HMS: "00:00:01",
        hm: "",
        HM: "00:00",
      },
      timer2 = 4000000, //4000 sec-> 1h 6mon 40sec
      expected2  = {
        h: 1,
        min: 6,
        sec: 40,
        hStr: "1h",
        minStr: "6min",
        secStr: "40sec",
        hms: "1h 6min 40sec",
        input: 4000000,
        HH: "01",
        MM: "06",
        SS: "40",
        HMS: "01:06:40",
        hm: "1h 6min",
        HM: "01:06",
      },
      timer3 = 100, //0.1 sec
      expected3 = {
        h: 0,
        min: 0,
        sec: 0,
        hStr: "",
        minStr: "",
        secStr: "0sec",
        hms: "0sec",
        input: 100,
        HH: "00",
        MM: "00",
        SS: "00",
        HMS: "00:00:00",
        hm: "",
        HM: "00:00",
      },
      timer4 = "hola",
      expected4 = {
        error: "hola is not a number"
      }
      console.log(1, hmsFromTimer(timer1), expected1)
      expect(hmsFromTimer(timer1)).toEqual(expected1)
      console.log(2, hmsFromTimer(timer2), expected2)
      expect(hmsFromTimer(timer2)).toEqual(expected2)
      console.log(3, hmsFromTimer(timer3), expected3)
      expect(hmsFromTimer(timer3)).toEqual(expected3)
      console.log(4,  hmsFromTimer(timer4), expected4)
      expect(hmsFromTimer(timer4)).toEqual(expected4)

}

const tests = () => {
  testHmsFromTimer()
  testAddPeriod()
  console.log("All Tests Passed!")
}

tests();

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
