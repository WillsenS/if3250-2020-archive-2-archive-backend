const csv = require('csv-parser')
const fs = require('fs')
const mongoose = require('mongoose');
const City = require("./models/city");

// To avoid the new line when printing
console.log = function (d) {
  process.stdout.write(d);
};


// connection 
//mongoose.connect('mongodb://localhost:27017/archive-backend',{
//    useNewUrlParser:true
//})

// For City collectioon
var count=0;
fs.createReadStream('cities.csv')
  .pipe(csv())
  .on('data', (data) => {
    let zipArr = data['zips'].split(" ");
    var newCity = new City({
      cityName: data['city'],
      state:data['state_name'],
      cityDisplayName:data['display_name'],
      zips:zipArr,
    });

    newCity.save(function(err, item) {
      if (item) {
        count++
        console.log(", "+count);
      }
      if (err) {
       console.log("Error")
      }
    });
    })
  .on('end', () => {
    console.log("Done");
  });