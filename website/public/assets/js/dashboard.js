
( function ( $ ) {
    "use strict";


// const brandPrimary = '#20a8d8'
const brandSuccess = '#4dbd74'
const brandInfo = '#63c2de'
const brandDanger = '#f86c6b'

function convertHex (hex, opacity) {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')'
  return result
}

function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
var provider = new firebase.auth.GoogleAuthProvider();
var goodMonth = Array(31).fill(0);
var goodBackMonth = Array(31).fill(0);
var goodSideMonth = Array(31).fill(0);
var goodYear = Array(12).fill(0);
var goodSideYear = Array(12).fill(0);
var goodBackYear = Array(12).fill(0);
var dailyTotal = 0;
var dailyGood = 0;
var sittingTime = 0;
var currentDate = new Date();
var currentMonth = currentDate.getMonth();
var currentDay = currentDate.getDate();
var currentYear = currentDate.getFullYear();

var percentChart = document.getElementById("percentGoodChartID");
var percentChart2 = document.getElementById("percentGoodChartID2");
var lineChart = document.getElementById( "lineChartID" );
// round corners
Chart.pluginService.register({
    afterUpdate: function (chart) {
        if (chart.config.options.elements.arc.roundedCornersFor !== undefined) {
            var arc = chart.getDatasetMeta(0).data[chart.config.options.elements.arc.roundedCornersFor];
            arc.round = {
                x: (chart.chartArea.left + chart.chartArea.right) / 2,
                y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
                radius: (chart.outerRadius + chart.innerRadius) / 2,
                thickness: (chart.outerRadius - chart.innerRadius) / 2 - 1,
                backgroundColor: arc._model.backgroundColor
            }
        }
    },

    afterDraw: function (chart) {
        if (chart.config.options.elements.arc.roundedCornersFor !== undefined) {
            var ctx = chart.chart.ctx;
            var arc = chart.getDatasetMeta(0).data[chart.config.options.elements.arc.roundedCornersFor];
            var startAngle = Math.PI / 2 - arc._view.startAngle;
            var endAngle = Math.PI / 2 - arc._view.endAngle;

            ctx.save();
            ctx.translate(arc.round.x, arc.round.y);

            ctx.fillStyle = arc.round.backgroundColor;
            ctx.beginPath();
            ctx.arc(arc.round.radius * Math.sin(startAngle), arc.round.radius * Math.cos(startAngle), arc.round.thickness, 0, 2 * Math.PI);
            ctx.arc(arc.round.radius * Math.sin(endAngle), arc.round.radius * Math.cos(endAngle), arc.round.thickness, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    },
});

// write text plugin
Chart.pluginService.register({
    afterUpdate: function (chart) {
        if (chart.config.options.elements.center) {
            var helpers = Chart.helpers;
            var centerConfig = chart.config.options.elements.center;
            var globalConfig = Chart.defaults.global;
            var ctx = chart.chart.ctx;

            var fontStyle = helpers.getValueOrDefault(centerConfig.fontStyle, globalConfig.defaultFontStyle);
            var fontFamily = helpers.getValueOrDefault(centerConfig.fontFamily, globalConfig.defaultFontFamily);

            if (centerConfig.fontSize)
                var fontSize = centerConfig.fontSize;
                // figure out the best font size, if one is not specified
            else {
                ctx.save();
                var fontSize = helpers.getValueOrDefault(centerConfig.minFontSize, 1);
                var maxFontSize = helpers.getValueOrDefault(centerConfig.maxFontSize, 256);
                var maxText = helpers.getValueOrDefault(centerConfig.maxText, centerConfig.text);

                do {
                    ctx.font = helpers.fontString(fontSize, fontStyle, fontFamily);
                    var textWidth = ctx.measureText(maxText).width;

                    // check if it fits, is within configured limits and that we are not simply toggling back and forth
                    if (textWidth < chart.innerRadius * 2 && fontSize < maxFontSize)
                        fontSize += 1;
                    else {
                        // reverse last step
                        fontSize -= 1;
                        break;
                    }
                } while (true)
                ctx.restore();
            }

            // save properties
            chart.center = {
                font: helpers.fontString(fontSize, fontStyle, fontFamily),
                fillStyle: helpers.getValueOrDefault(centerConfig.fontColor, globalConfig.defaultFontColor)
            };
        }
    },
    afterDraw: function (chart) {
        if (chart.center) {
            var centerConfig = chart.config.options.elements.center;
            var ctx = chart.chart.ctx;

            ctx.save();
            ctx.font = chart.center.font;
            ctx.fillStyle = chart.center.fillStyle;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            var centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            var centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            ctx.fillText(centerConfig.text, centerX, centerY);
            ctx.restore();
        }
    },
})
// Initialize Firebase
const config = {
  apiKey: "AIzaSyDZN7DF3BPdseBoCP2l6A3Yjbc0ECb0pMk",
  authDomain: "parkingait.firebaseapp.com",
  databaseURL: "https://parkingait-default-rtdb.firebaseio.com",
  projectId: "parkingait",
  storageBucket: "parkingait.appspot.com",
  messagingSenderId: "987453531886",
  appId: "1:987453531886:web:d641b174467546f31fb5ff",
  measurementId: "G-1C4E694RZQ"
};
firebase.initializeApp(config);
$(window).on('load',function () {

  // Find the HTML element with the id recommendationForm, and when the submit
  // event is triggered on that element, call submitRecommendation.
  var deviceID;
  firebase.auth().onAuthStateChanged(user => {
    var user = firebase.auth().currentUser;
    var database = firebase.database();
    var userID = user.uid;
    var userRef = database.ref('users/'+userID);
    //var deviceID;
    

    


  var dataRef = database.ref('users/');
  dataRef.once('value').then(function(snapshot){
    console.log("SNAPSHOT");
    var data = snapshot.val();
    var id = Object.values(data[userID]["devices"])[0];
    console.log(id);
    console.log(data);
    console.log(data[userID]);
  })




    userRef.once('value').then(function(snapshot) {
      deviceID = Object.values(snapshot.val().devices)[0];
      console.log(deviceID);
      //var dataRef = database.ref('devices/'+deviceID+'/data');
      while (deviceID == null){
        console.log("Waiting");
      }
      var macroDataRef = database.ref('users/VCSiB6zpJpYeL6Y1osI849BZJNf1');
      macroDataRef.once('value').then(function(snap){
        /*for (var month in snap.val()){
          var monthData = snap.val()[month];
          var tempBad = 0;
          var tempTotal = 0;
          var tempBadSide = 0;
          var tempBadBack = 0;

          for (var date in snap.val()[month]){
            var dateData = monthData[date]
            if (month == currentMonth){
              goodMonth[date-1] = Math.round((dateData.total-dateData.bad)/dateData.total*100);
              goodSideMonth[date-1] = Math.round((dateData.total-dateData.badSide)/dateData.total*100);
              goodBackMonth[date-1] = Math.round((dateData.total-dateData.badBack)/dateData.total*100);

              if (date = currentDay){
                sittingTime = dateData.total;
              }
            }
            tempBad = tempBad + dateData.bad;
            tempTotal = tempTotal + dateData.total;
            tempBadSide = tempBadSide + dateData.badSide;
            tempBadBack = tempBadBack + dateData.badBack;
          }
          goodYear[month] = Math.round((tempTotal-tempBad)/tempTotal*100);
          goodSideYear[month] = Math.round((tempTotal-tempBadSide)/tempTotal * 100);
          goodBackYear[month] = Math.round((tempTotal - tempBadBack)/tempTotal * 100);
        }
          console.log(goodMonth)

        console.log(goodMonth[currentDay-1]);*/

        let d = [];
        console.log(snap.val());
        let goalStep = parseInt(snap.val()["goalStep"]);
        console.log(goalStep);
        let values = Object.values(snap.val()["StepLength"]);
        let totalSteps = 0;
        let asymmetry = 0;
        let good = 0;

        let left = true;
        let leftSum = 0;
        let rightSum = 0;
        for (let i = 0; i < values.length; i++){
          console.log(values[i]);
          let k = parseInt(Object.keys(values[i])[0]);
          let v = parseInt(Object.values(values[i])[0]);
          console.log(k);
          console.log(v);
          d.push(v);
          
          if (v > goalStep){
            good+=1;
          }
          //yes = asymmetry
          //setAsymmetry(yes+2);
          //console.log("asym");
          //console.log(asymmetry);
          if (left){
            leftSum +=v;
            //setAsymmetry(asymmetry+v);
          }
          else{
            rightSum+=v
            //setAsymmetry(asymmetry-v);
          }
          left=!left
          //setAsymmetry(10);
          //setAsymmetry(0);
          //console.log(asymmetry);
          /*
          for (let j = 0; j < values[Object.keys()].length;j++){
            let k = j;
            let v = values[i][k];
            console.log("Y");
            console.log(k);
            console.log(v);
            
            console.log("v, diff");
            console.log(v);
            console.log(goalStep);
            console.log(Date.now()-parseInt(k))
            if (true){
              d.push(v);
              
              if (v > goalStep){
                good+=1;
              }
              //yes = asymmetry
              //setAsymmetry(yes+2);
              //console.log("asym");
              //console.log(asymmetry);
              if (left){
                leftSum +=v;
                //setAsymmetry(asymmetry+v);
              }
              else{
                rightSum+=v
                //setAsymmetry(asymmetry-v);
              }
              left=!left
          }
          }

          let percentGood=(good/d.length);
          totalSteps = d.length;
          asymmetry = (leftSum-rightSum)/(leftSum+rightSum);*/
          /*console.log("YUH");
          console.log(parseInt(i)-Date.now());
          console.log(values[i]);
          console.log(parseInt(i));
          console.log(Date.now());
          console.log((Date.now()-parseInt(Object.keys(values)[i]))/1000/3600)
          */
        }
        let percentGood=Math.floor(100*(good/d.length));
        totalSteps = d.length;
        asymmetry = Math.abs(Math.floor((leftSum-rightSum)/(leftSum+rightSum)*100));
        console.log(asymmetry);
        console.log(totalSteps);
        console.log(percentGood);


        var percentChartOptions = new Chart( percentChart, {
          type:'doughnut',
          data:{
            labels: ["Asymmetry" , ""],
            datasets:[
              {
                label:"Time (minutes)",
                backgroundColor:[brandSuccess,"#CCCCCC66"],
                data:[asymmetry, 100-asymmetry]
              }
            ]
          },
          options:{
            title:{
              display: true,
              text: "Asymmetry",
              fontSize: 30
            },
            legend:{
              display:false
            },
            cutoutPercentage:80,
            elements: {
                arc: {
                    roundedCornersFor: 0
                },
                center: {
                    // the longest text that could appear in the center
                    maxText: '2000000',
                    text: (asymmetry).toString()+'%',
                    fontColor: "#000000",
                    fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                    fontStyle: 'normal',
                    // fontSize: 12,
                    // if a fontSize is NOT specified, we will scale (within the below limits) maxText to take up the maximum space in the center
                    // if these are not specified either, we default to 1 and 256
                    minFontSize: 1,
                    maxFontSize: 256,
                }
            }
          }
        });
        var percentChartOptions2 = new Chart( percentChart2, {
          type:'doughnut',
          data:{
            labels: ["Time Spent with Correct Step Length" , "Time Spent with Incorrect Step Length"],
            datasets:[
              {
                label:"Time (minutes)",
                backgroundColor:[brandSuccess,"#CCCCCC66"],
                data:[percentGood, 100-percentGood]
              }
            ]
          },
          options:{
            title:{
              display: true,
              text: "Time Spent with Correct Step Length",
              fontSize: 30
            },
            legend:{
              display:false
            },
            cutoutPercentage:80,
            elements: {
                arc: {
                    roundedCornersFor: 0
                },
                center: {
                    // the longest text that could appear in the center
                    maxText: '2000000',
                    text: (percentGood).toString()+'%',
                    fontColor: "#000000",
                    fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                    fontStyle: 'normal',
                    // fontSize: 12,
                    // if a fontSize is NOT specified, we will scale (within the below limits) maxText to take up the maximum space in the center
                    // if these are not specified either, we default to 1 and 256
                    minFontSize: 1,
                    maxFontSize: 256,
                }
            }
          }
        });
        var myChart = new Chart( lineChart, {
            type: 'line',
            data: {
                labels: Array(d.length).fill(''),
                datasets: [
                {
                  label: 'My First dataset',
                  backgroundColor: convertHex(brandInfo, 10),
                  borderColor: brandInfo,
                  pointHoverBackgroundColor: '#fff',
                  borderWidth: 2,
                  data: d
              }
              ]
            },
            options: {
                //   maintainAspectRatio: true,
                //   legend: {
                //     display: false
                // },
                // scales: {
                //     xAxes: [{
                //       display: false,
                //       categoryPercentage: 1,
                //       barPercentage: 0.5
                //     }],
                //     yAxes: [ {
                //         display: false
                //     } ]
                // }


                maintainAspectRatio: true,
                legend: {
                    display: false
                },
                responsive: true,
                scales: {
                    xAxes: [{
                      gridLines: {
                        drawOnChartArea: false
                      }
                    }],
                    yAxes: [ {
                          ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 100,
                            stepSize:10,
                            max: 100
                          },
                          gridLines: {
                            display: true
                          }
                    } ]
                },
                elements: {
                    point: {
                      radius: 0,
                      hitRadius: 10,
                      hoverRadius: 4,
                      hoverBorderWidth: 3
                  }
              }


            }
        } );

      })
      // ...
    });
    // Push a new recommendation to the database using those values
});
});
    var elements = 1000
    var data1 = []
    var data2 = []
    var data3 = []

    for (var i = 0; i <= elements; i++) {
      data1.push(random(50, 121))
      data2.push(random(80, 100))
      data3.push(65)
    }


    var badOverall = 500;
    var badSide = 400;
    var badBack = 450;
    var total = 700;
    var goodTime = total - badSide;
    var badTime = total - goodTime;




    //Traffic Chart

    //ctx.height = 200;
    /*var percentGood = new Chart(ctx,{
      type:'doughnut',
      data:
    });*/



} )( jQuery );
