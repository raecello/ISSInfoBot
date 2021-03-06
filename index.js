'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
 
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 


//console.log(breq.queryResult.action);
app.post('/get-ISS-details', (req, res) => {

    if (req.body.queryResult.action == 'Get-lat-long') {
        
        const reqUrl = encodeURI(`http://api.open-notify.org/iss-now.json`);
        http.get(reqUrl, (responseFromAPI) => {
            let completeResponse = '';
            responseFromAPI.on('data', (chunk) => {
                completeResponse += chunk;
            });
            responseFromAPI.on('end', () => {
                const movie = JSON.parse(completeResponse);
                var longitude = movie.iss_position.longitude;
                var latitude = movie.iss_position.latitude;
                var dataToSend = `The ISS is currently positioned at ${longitude} longitude and ${latitude} latitude.`;
                //console.log(dataToSend);
                return res.json({
                    fulfillmentText: dataToSend,
                    source: 'Get-lat-long'
                });
            }, (error) => {
                return res.json({
                    fulfillmentText: 'Something went wrong!',
                    source: 'Get-lat-long'
                });
            });
        });
}
   
if (req.body.queryResult.action == 'who-is-onboard') {
    
    const reqUrl = encodeURI(`http://api.open-notify.org/astros.json`);
    http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            var astronauts = JSON.parse(completeResponse);
            astronauts = astronauts.people;
            var dataToSend = "The astronauts currently on the ISS are: "            
            for (var i = 0; i < astronauts.length; i++) {
                if (i == astronauts.length - 1) {
                    dataToSend += "and ";
                }
                dataToSend += astronauts[i].name;
                if (i == astronauts.length - 1) {
                    dataToSend += ".";
                } else {
                    dataToSend += ", ";
                }                  
            }
            return res.json({
                fulfillmentText: dataToSend,
                source: 'who-is-onboard'
            });
        });
    }, (error) => {
        return res.json({
            fulfillmentText: 'Something went wrong!',
            source: 'who-is-onboard'
        });
    });
    }

    // needs latitude and longitude objects to both be in place
if (req.body.queryResult.action == 'whenOverHead') {

    const reqUrl = encodeURI(`http://api.open-notify.org/iss-pass.json?lat=${req.body.queryResult.parameters.latitude}&lon=${req.body.queryResult.parameters.longitude}`);
    http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            var nextPassTime = JSON.parse(completeResponse);
            try {
            nextPassTime = nextPassTime.response[0].risetime;
            }
            catch (e) {
                return res.json({
                    fulfillmentText: "Please choose a latitude between -90.0 and 90.0 and a longitude between -180.0 and 180.0.",
                    source: 'whenOverHead' 
                })
            }
            var dataToSend = `The ISS will next be overhead at this location on ${getUTCTime(nextPassTime)}`;          
            return res.json({
                fulfillmentText: dataToSend,
                source: 'whenOverHead'
            });
        });
    }, (error) => {
        return res.json({
            fulfillmentText: 'Something went wrong!',
            source: 'whenOverHead'
        });
    });
    }
  
    // Helper Functions
    function getUTCTime(timestamp) {

        var pubDate = new Date(timestamp*1000);  
        var weekday=new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
        var monthname=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
        var formattedDate = pubDate.getHours() + ':' + singleDigitPad(pubDate.getMinutes()) + ' '  + weekday[pubDate.getDay()] + ' '
        + monthname[pubDate.getMonth()] + ' '
        + pubDate.getDate() + ', ' + pubDate.getFullYear() + ' UTC'
        return formattedDate; 
    }

    function singleDigitPad(mins) {
        return ('0' + mins).slice(-2); 
    }
});
app.listen(process.env.PORT || 5000), () => {
    console.log("Server is up and running...");
};
