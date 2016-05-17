
const testAddPeriod = () => {
  //Firt case test, we add to an empty list a period started in the
  //same day
  let listBef = [],
      lcTimeStartStr = hmFromDate(new Date("12/10/2015 10:20")),
      lcTimestopStr = hmFromDate(new Date("12/10/2015 10:20:04")),
      intervalStr =  "10:20: 4sec",
      periodObj = {
        str: intervalStr,
        periodTimer: 4000
      },
      listAft = [
        {
          date: dmyFromDate(new Date("12/10/2015 10:20")),
          periods: [periodObj],
          totalOfDay: 4000,
        }
      ],
      params1 = {
        listPeriods: listBef,
        localTimeStartInterval: new Date("12/10/2015 10:20:00"),
        localcTimeStopInterval: new Date("12/10/2015 10:20:04"),
        periodTimer: 4000
      }
  console.log("1 AddPeriod: Case add period to empty array");
  expect(addToList(params1)).toEqual(listAft);

  //Case adding period to  empty array. Different hours
  let listBef2 = [],
      intervalStr2 =  "10:20-10:21: 4sec",
      periodObj2 = {
        str: intervalStr2,
        periodTimer: 4000
      },
      listAft2 = [
        {
          date: dmyFromDate(new Date("12/10/2015 10:20")),
          periods: [periodObj2],
          totalOfDay: 4000,
        }
      ],
      params2 = {
        listPeriods: listBef2,
        localTimeStartInterval: new Date("12/10/2015 10:20:00"),
        localcTimeStopInterval: new Date("12/10/2015 10:21:04"),
        periodTimer: 4000
      }
  console.log("2 AddPeriod: Case add period to empty array different hm");
  expect(addToList(params2)).toEqual(listAft2);

  //Case adding period to non empty array. Same Day
  let listBef3 = [
        {
          date: dmyFromDate(new Date("12/10/2015 9:20")),
          periods: [{
            str: "09:20-09:21: 4sec",
            periodTimer: 4000
          }],
          totalOfDay: 4000,
        }
      ],
      listAft3 = [
        {
          date: dmyFromDate(new Date("12/10/2015 9:20")),
          periods: [{
                      str: "10:20-10:21: 4sec",
                      periodTimer: 4000
                    },
                    {
                      str: "09:20-09:21: 4sec",
                      periodTimer: 4000
                    }
                  ],
          totalOfDay: 8000,
        }
      ],
      params3 = {
        listPeriods: listBef3,
        localTimeStartInterval: new Date("12/10/2015 10:20:00"),
        localcTimeStopInterval: new Date("12/10/2015 10:21:04"),
        periodTimer: 4000
      }
  console.log("3 AddPeriod: Case add period to non empty list. Same Day");
  expect(addToList(params3)).toEqual(listAft3);

  //Case adding period to non empty array. Different Date
  let listBef4 = [
        {
          date: dmyFromDate(new Date("12/10/2015 9:20")),
          periods: [{
                      str: "09:20-09:21: 4sec",
                      periodTimer: 4000
                    }
            ],
          totalOfDay: 4000,
        }
      ],
      listAft4 = [
        {
          date: dmyFromDate(new Date("12/11/2015 10:20")),
          periods: [
            {
              str: "10:20-10:21: 10sec",
              periodTimer: 10000
            }],
          totalOfDay: 10000,
        },
        {
          date: dmyFromDate(new Date("12/10/2015 9:20")),
          periods: [{
                      str: "09:20-09:21: 4sec",
                      periodTimer: 4000
                    }],
          totalOfDay: 4000,
        }
      ],
      params4 = {
        listPeriods: listBef4,
        localTimeStartInterval: new Date("12/11/2015 10:20:00"),
        localcTimeStopInterval: new Date("12/11/2015 10:21:04"),
        periodTimer: 10000
      }
  console.log("4 AddPeriod: Case add period to non empty list. Different Day");
  expect(addToList(params4)).toEqual(listAft4);

  //Case adding period to empty array. Beg and End Period on different dates
  let listBef5 = [],
      listAft5 = [
        {
          date: dmyFromDate(new Date("12/14/2015 GMT-0800")),
          periods: [{
                      str: "00:00: 5sec",
                      periodTimer: 5000
                    }],
          totalOfDay: 5000,
        },
        {
          date: dmyFromDate(new Date("12/13/2015 GMT-0800")),
          periods: [{
                      str: "23:59: 59sec",
                      periodTimer: 59000
                    }],
          totalOfDay: 59000,
        }
      ],
      params5 = {
        listPeriods: listBef5,
        localTimeStartInterval: new Date("12/13/2015 23:59:00 GMT-0800"),
        localcTimeStopInterval: new Date("12/14/2015 00:00:04 GMT-0800"),
        periodTimer: 64000
      }
      console.log("5 AddPeriod: Case adding period to empty array."
                  + "Beg and End Period on different dates");
      expect(addToList(params5)).toEqual(listAft5);

}

const testErasePeriod = () => {
  let listBef1 = [
        {
          periods: [
            {
              str: "hola",
              periodTimer: 4000
            },
            {
              str: "hola2",
              periodTimer: 2000
            },
            {
              str: "hola3",
              periodTimer: 1000
            }
          ],
          totalOfDay: 7000
        }
      ],
      params1 = {
        listPeriods: listBef1,
        idDay: 0,
        idPeriod: 1,
        testMode: true
      },
      listAfter1 = [
        {
          periods: [
            {
              str: "hola",
              periodTimer: 4000
            },
            {
              str: "hola3",
              periodTimer: 1000
            }
          ],
          totalOfDay: 5000
        }
      ]

  console.log("Tests for erasePeriod func")
  console.log("Test1: Erase a period with valid params in a non empty list")
  expect(erasePeriod(params1).list).toEqual(listAfter1)
  console.log("Passed")

  let listBef2 = [
        {
          periods: [
            "hola",
            "Adios",
            "hey"
          ]
        }
      ],
      params2 = {
        listPeriods: listBef2,
        idDay: 1,
        idPeriod: 1,
        testMode: true
      }

  console.log("Test2: Erase a period with idDay higher than those on the list")
  expect(erasePeriod.bind(null, params2)).toThrow()
  console.log("Passed")

  let listBef3 = [
        {
          periods: [
            "hola",
            "Adios",
            "hey"
          ]
        }
      ],
      params3 = {
        listPeriods: listBef3,
        idDay: 0,
        idPeriod: 5,
        testMode: true
      }

  console.log("Test3: Erase a period with idPeriod higher" +
              " than those on on the idPeriod periods arr of the list")
  expect(erasePeriod.bind(null, params3)).toThrow()

  let listBef4 = [
        {
          periods: [
            "hola",
            "Adios",
            "hey"
          ]
        }
      ],
      params4 = {
        listPeriods: listBef4,
        idDay: "hola",
        idPeriod: 1,
        testMode: true
      }

  console.log("Test4: Erase a period idDay as string")
  expect(erasePeriod.bind(null, params4)).toThrow()

  let listBef5 = [
        {
          periods: [
            "hola",
            "Adios",
            "hey"
          ]
        }
      ],
      params5 = {
        listPeriods: listBef5,
        idDay: null,
        idPeriod: 1,
        testMode: true
      }

  console.log("Test5: Erase a period idDay as null")
  expect(erasePeriod.bind(null, params4)).toThrow()
  console.log("Passed")

  let listBef6 = [
        {
          periods: [
            {
              str: "hola",
              periodTimer: 4000
            },
            {
              str: "hola2",
              periodTimer: 2000
            },
            {
              str: "hola3",
              periodTimer: 1000
            }
          ],
          totalOfDay: 7000
        }
      ],
      params6 = {
        listPeriods: listBef6,
        idDay: "0",
        idPeriod: 1,
        testMode: true
      },
      listAft6 = [
        {
          periods: [
            {
              str: "hola",
              periodTimer: 4000
            },
            {
              str: "hola3",
              periodTimer: 1000
            }
          ],
          totalOfDay: 5000
        }
      ]

  console.log("Test6: Erase a period idDay as the string value of a number")
  expect(erasePeriod(params6).list).toEqual(listAft6)
  console.log("Passed")


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

const testDmyFromDate = () => {
  let date1 = new Date("12/10/2016"),
      dmy1 = "10-12-2016"

  expect(dmyFromDate(date1)).toEqual(dmy1);
}


const testTotalTimeDay = () => {
  let periodsBef = [
    {
      str: "hola",
      periodTimer: 1000
    },
    {
      str: "hola",
      periodTimer: 2000
    },
    {
      str: "hola",
      periodTimer: 3000
    },
    {
      str: "hola",
      periodTimer: 4000
    }
  ],
    total1 = 10000

  expect(totalTimeDay(periodsBef)).toEqual(total1)
}

const testTotalTimeOfToday = () => {
  //1
  console.log("totalTimeOfToday test")
  console.log("Case 1, date of today")
  let listBef = [{
        date: dmyFromDate(new Date),
        periods: [
        {
          str: "hola",
          periodTimer: 1000
        },
        {
          str: "hola",
          periodTimer: 2000
        },
        {
          str: "hola",
          periodTimer: 3000
        },
        {
          str: "hola",
          periodTimer: 4000
        }
      ]
    }],
    total1 = 10000
    expect(totalTimeOfToday(listBef)).toEqual(total1)

    console.log("Case 2, date different of today")
    let listBef2 = [{
          date: dmyFromDate(new Date("11/9/2010")),
          periods: [
          {
            str: "hola",
            periodTimer: 1000
          },
          {
            str: "hola",
            periodTimer: 2000
          },
          {
            str: "hola",
            periodTimer: 3000
          },
          {
            str: "hola",
            periodTimer: 4000
          }
        ]
      }],
      total2 = 0
  expect(totalTimeOfToday(listBef2)).toEqual(total2)
}
const tests = () => {
  testHmsFromTimer()
  testDmyFromDate()
  testAddPeriod()
  testErasePeriod()
  testTotalTimeDay()
  testTotalTimeOfToday()
  console.log("All Tests Passed!")
}

//tests();
