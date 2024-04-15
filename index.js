const express = require("express");
const fs = require('fs');
const path = require('path');
// const sharp=require('sharp');
const sass = require('sass');
// const ejs=require('ejs');
const pg = require('pg');
const Client = pg.Client;

var client = new Client({database: 'pcfabric',
    user:'georgiansof',
    password:'georgiansof',
    host: 'localhost',
    port: '5432'});
client.connect();

client.query('select * from prajituri', (err, rez) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(rez);
});


obGlobal = {
    obErori:null,
    folderScss: path.join(__dirname, 'resurse', 'scss'),
    folderCss: path.join(__dirname, 'resurse','css')
}

vect_foldere = ['temp', 'temp1', path.join('resurse', 'css', 'backup')]
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


/************************ PRODUSE ******************************** */

app.get('/produse', (req, res) => {
    client.query('select * from prajituri', (err, rez) => {
        if(err) {
            console.log(err);
            afisareEroare(res, 2);
            return;
        }

        res.render('pagini/produse', {produse: rez.rows, optiuni: []});
    })
});

app.get('/produse/:id', (req, res) => {
    client.query(`select * from prajituri where id=${req.params.id}`, (err, rez) => {
        if(err) {
            console.log(err);
            afisareEroare(res, 2);
            return;
        }

        res.render('pagini/produs', {prod: rez.rows[0]});
    })
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

function isAbsolutePath(path) {
    // Regular expression to match absolute paths
    var absolutePathRegex = /^(?:\/|[a-zA-Z]:\\)/;
  
    return absolutePathRegex.test(path);
}

function getFilesWithExtension(folderPath, extension) {
    // Read the contents of the folder
    const files = fs.readdirSync(folderPath);
    
    // Filter the files based on the extension
    const filesWithExtension = files.filter(file => path.extname(file) === extension);

    return filesWithExtension;
}

function compileazaScss(caleScss, caleCss) {
    if(!isAbsolutePath(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if(caleCss == null || caleCss === '')
        caleCss = path.join(obGlobal.folderCss, path.parse(caleScss).name + '.css');
    
    if(fs.existsSync(caleCss)) 
        fs.copyFileSync(caleCss, path.join(path.dirname(caleCss), 'backup', path.parse(caleCss).name + '.bk'));

    const result = sass.renderSync({
        file: caleScss
    });

    // Write the compiled CSS to the output file
    fs.writeFileSync(caleCss, result.css);
}

initErori();

scssToCompile = getFilesWithExtension(obGlobal.folderScss, '.scss')
for(scssFile of scssToCompile)
    compileazaScss(scssFile);

fs.watch(obGlobal.folderScss, { recursive: true }, (eventType, filename) => {
    if (filename && path.extname(filename) === '.scss') {
        compileazaScss(filename);
        console.log('Fisierul ' + filename + ' a fost recompilat !');
    }
});

app.listen(8080);
console.log("Serverul a pornit");