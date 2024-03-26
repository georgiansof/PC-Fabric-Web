const express = require("express");
const fs = require('fs');
// const path=require('path');
// const sharp=require('sharp');
// const sass=require('sass');
// const ejs=require('ejs');

app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
app.set("view engine","ejs");
app.use("/resurse", express.static(__dirname+"/resurse"));

app.get('/data', (req, res, next) => {
    res.write("Data: "); /// se apeleaza primul
    // res.send termina executia
    next(); // trece la urmatoarea functie /data
});

app.get('/data', (req, res) => {
    res.write("" + new Date());
    res.end()
});

app.get('/suma/:a/:b', function(req,res) {
    var suma = parseInt(req.params.a) + parseInt(req.params.b);
    res.send("" + suma);
});

app.get(['/','/home','/index'], (req, res) => {
    res.render("pagini/index");
});

app.get('/*', (req, res) => {
    res.render('pagini' + req.url, (rezHTML, err) => {
        if(err) /// TODO
            res.send('aaa');
        else
            res.send(rezHTML);
    });
});

app.listen(8080);
console.log("Serverul a pornit");