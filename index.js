'use strict';

var express = require('express');
var bodyparser = require('body-parser');
var http = require('http');

var app = express();
app.use(bodyparser.urlencoded({ extended: false }));


app.post("/get-ISS-details", function (req, res) {
    if (req.queryResult.action == 'Get-lat-long') {
        
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
});
app.listen(process.env.PORT || 5000), () => {
    console.log("Server is up and running...");
};

