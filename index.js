const express = require("express");
const fs = require('fs');
const path = require('path');
// const sharp=require('sharp');
// const sass=require('sass');
// const ejs=require('ejs');

obGlobal = {
    obErori:null
}

vect_foldere = ['temp', 'temp1']
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder)
    if(!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

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
    res.render("pagini/index", {ip: req.ip});
});

app.get("/*.ejs", (req, res) => {
    afisareEroare(res, 400);

});

app.get(new RegExp('^\/resurse[a-zA-z0-9\/_\s]*\/$'), (req, res) => {
    afisareEroare(res, 403);

});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "/resurse/favicon/favicon.ico"));

});

app.get('/*', (req, res) => {
    try {
        res.render('pagini' + req.url, (err, rezHTML) => {
            if(err) {    
                if(err.message.startsWith('Failed to lookup view')) {
                    afisareEroare(res, 404);
                    console.log('Nu a gasit: ', req.url);
                }
                else
                    if(err.message.startsWith("Cannot find module")) {
                        afisareEroare(res, 404);
                        console.log("Nu a gasit resursa: ", req.url);
                    }
            }
        });
    }
    catch(err1) {
        if(err1.message.startsWith('Cannot find module')) {
            afisareEroare(res, 404);
            console.log('Nu a gasit resursa: ', req.url);
        }
        else {
            afisareEroare(res);
            console.log("Eroare: " + err1);
        }
    }
});

function initErori() {
    let continut = fs.readFileSync(path.join(__dirname,"/resurse/json/erori.json"));
    obGlobal.obErori = JSON.parse(continut);
    for(let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }

    obGlobal.obErori.eroare_default = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine);
}

function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find(
        (elem) => {
            return elem.identificator == identificator;
        }
    )
    if(!eroare) {
        let eroare_default = obGlobal.obErori.eroare_default;
        res.render('pagini/eroare', {
            titlu: titlu || eroare_default.titlu,
            text: text || eroare_defualt.text,
            imagine: imagine || eroare_default.imagine

        }); // al doilea argument este locals
    }
    else {
        if(eroare.status)
            res.status(eroare.identificator);
        
            res.render('pagini/eroare', {
                titlu: titlu || eroare.titlu,
                text: text || eroare.text,
                imagine: imagine || eroare.imagine
    
            });
    }
}

initErori();
app.listen(8080);
console.log("Serverul a pornit");