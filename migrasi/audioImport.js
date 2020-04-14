const csv = require('csv-parser')
const fs = require('fs')
const mongoose = require('mongoose');
const Archive = require("./models/Archive");
const Audio = require("./models/Audio");
// To avoid the new line when printing
console.log = function (d) {
  process.stdout.write(d);
};


// localhost connection 
//mongoose.connect('mongodb://localhost:27017/archive-backend',{
//    useNewUrlParser:true
//})

// For City collectioon
var count=0;
fs.createReadStream('Audio.csv')
  .pipe(csv())
  .on('data', (data) => {
    var newArchive = new Archive({
      judul: data['judul'],
      tipe:data['tipe'],
      nomor:data['nomor'],
      pola:data['pola'],
      lokasi_kegiatan:data['lokasi_kegiatan'],
      keterangan:data['keterangan'],
      waktu_kegiatan:data['waktu_kegiatan'],
      keamanan_terbuka:data['keamanan_terbuka'],
      lokasi_simpan_arsip:data['lokasi_simpan_arsip'],
      mime:data['mime'],
    });
    var newAudio = new Audio({
      narrator: data['narrator'],
      reporter:data['reporter'],
      activity_description:data['activity_description'],
    });
    newArchive.save(function(err, item) {
      if (item) {
        count++
        console.log(", "+count);
      }
      if (err) {
       console.log("Error")
      }
    });
    newAudio.save(function(err, item) {
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