const express = require("express");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
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

function isNaturalNumber(value) {
    const regExp = /^[1-9]\d*$/;
    return regExp.test(value);
}

let oferte = []

app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

async function startServer() {

    const tipuri_componente = await getTipuriComponente();
    genereazaOferta();
    console.log(tipuri_componente);

    const defaultData = {
        appName: 'PC Fabric',
        currentUser: null, // Assuming you have user information stored in req.user
        tipuri_componente: tipuri_componente
    };

    app.use((req, res, next) => {
        res.locals.defaultData = defaultData;
        next();
    });

    
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
    let obiect_galerie = construiesteGalerie();
    let obiect_galerie_dinamica = construiesteGalerieDinamica();
    res.render("pagini/index", {ip: req.ip, ob_galerie: obiect_galerie, ob_galerie_dinamica: obiect_galerie_dinamica});
});

app.get('/resurse/imagini/galerie/anotimpuri/:imageName', (req, res) => {
    const { imageName } = req.params;
    const imagePath = path.join(__dirname, 'resurse', 'imagini', 'galerie', 'anotimpuri', `${imageName}`);

    if(fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
    }

    let size = 200;
    let originalImagePath = imagePath.replace(/-mic/, '');

    if(originalImagePath == imagePath) /// este mediu
        size = 300;
    originalImagePath = originalImagePath.replace(/-mediu/, '');

    if (fs.existsSync(originalImagePath)) {
        sharp(originalImagePath)
            .resize(size, size) // Resize to desired dimensions
            .toFile(imagePath, (err, info) => {
                if (err) {
                    console.error('Error resizing image:', err);
                    afisareEroare(res, 500);
                }
                res.sendFile(imagePath);
            });
    } else {
        //res.status(404).send('Image not found');
        afisareEroare(res, 404);
    }
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

app.get('/procesoare/:id', (req, res) => {
    if(!isNaturalNumber(req.params.id))
        afisareEroare(res, 403);

    client.query(`select * from procesoare where id='${req.params.id}'`, (err, procesoare) => {
        if(err) {
            console.log(err);
            afisareEroare(res, 2);
            return;
        }

        procesoare.rows[0].imagini = [];

        let cale_imagini = procesoare.rows[0].cale_imagine.slice(0, procesoare.rows[0].cale_imagine.lastIndexOf('/'));
        
        try {
            const files = fs.readdirSync(__dirname+cale_imagini);
          
            files.forEach(file => {
              procesoare.rows[0].imagini.push(cale_imagini + '/' + file);
            });
          } catch (err) {
            console.error('Error reading directory:', err);
          }

        console.log(procesoare.rows[0].imagini);
        res.render('pagini/procesor.ejs', {tip_item:"procesor", item: procesoare.rows[0]});
    })
});

app.get('/placi_grafice/:id', (req, res) => {
    if(!isNaturalNumber(req.params.id))
        afisareEroare(res, 403);

    client.query(`select * from placi_grafice where id='${req.params.id}'`, (err, placi_grafice) => {
        if(err) {
            console.log(err);
            afisareEroare(res, 2);
            return;
        }

        placi_grafice.rows[0].imagini = [];

        let cale_imagini = placi_grafice.rows[0].cale_imagine.slice(0, placi_grafice.rows[0].cale_imagine.lastIndexOf('/'));
        
        try {
            const files = fs.readdirSync(__dirname+cale_imagini);
          
            files.forEach(file => {
              placi_grafice.rows[0].imagini.push(cale_imagini + '/' + file);
            });
          } catch (err) {
            console.error('Error reading directory:', err);
          }

        console.log(placi_grafice.rows[0].imagini);

        res.render('pagini/placa_grafica.ejs', {tip_item:"placa_grafica", item: placi_grafice.rows[0]});
    })
});

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


app.get('/galerie_statica', (req, res) => {
    let obiect_galerie = construiesteGalerie();
    res.render('pagini/galerie_statica.ejs', {ob_galerie: obiect_galerie});
});

app.get('/galerie_dinamica', (req, res) => {
    let obiect_galerie = construiesteGalerieDinamica();
    res.render('pagini/galerie_dinamica.ejs', {ob_galerie_dinamica: obiect_galerie});
});

app.get('/procesoare', (req, res) => {
    let json = JSON.parse(fs.readFileSync("resurse/json/filtre/procesoare.json"));
    client.query('select * from procesoare', (err, procesoare) => {
        if(err) {
            console.log(err);
            afisareEroare(res, 2);
            return;
        }

        let procesorIeftin;
        let pret_ieftin = 1_000_000_000;
        for(let procesor of procesoare.rows) {
            procesor.ieftin = false;
            let pret_real = parseFloat(procesor.pret_redus || procesor.pret)
            if(pret_real < pret_ieftin) {
                pret_ieftin = pret_real;
                procesorIeftin = procesor;
            }
        }

        procesorIeftin.ieftin = true;

        res.render('pagini/procesoare.ejs', {tip_item:"procesor", json_filtre: json, items: procesoare['rows']});
    })
});

app.get('/oferta', (req, res) => {
    res.send(getOferta());
});

app.get('/placi_grafice', (req, res) => {
    let json = JSON.parse(fs.readFileSync("resurse/json/filtre/placi_grafice.json"));
    client.query('select * from placi_grafice', (err, placi_grafice) => {
        if(err) {
            console.log(err);
            afisareEroare(res, 2);
            return;
        }

        let placaIeftina;
        let pret_ieftin = 1_000_000_000;
        for(let placa of placi_grafice.rows) {
            placa.ieftin = false;
            let pret_real = parseFloat(placa.pret_redus || placa.pret)
            if(pret_real < pret_ieftin) {
                pret_ieftin = pret_real;
                placaIeftina = placa;
            }
        }

        placaIeftina.ieftin = true;

        res.render('pagini/placi_grafice', { tip_item:"placa_grafica", json_filtre: json, items: placi_grafice.rows });
    });
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


initErori();

scssToCompile = getFilesWithExtension(obGlobal.folderScss, '.scss')
for(scssFile of scssToCompile)
    compileazaScss(scssFile);

fs.watch(obGlobal.folderScss, { recursive: true }, (eventType, filename) => {
    if (filename && path.extname(filename) === '.scss') {
        try {
            compileazaScss(filename);
            console.log('Fisierul ' + filename + ' a fost recompilat !');
        }
        catch(e) {
            console.log('Fisierul ' + filename + ' contine erori de sintaxa !');
        }
    }
});

curatareBackupuri(__dirname + "/resurse/css/backup", 7);

app.listen(8080);
console.log("Serverul a pornit");

function curatareBackupuri(directoryPath, daysToKeep) {
    const currentTime = new Date().getTime();

    const cutoffTime = currentTime - (daysToKeep * 24 * 60 * 60 * 1000);

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            const match = file.match(/(\d{4}-\d{2}-\d{2})\.bk/);
            if (match) {
                const fileDate = new Date(match[1]).getTime();

                // If the file is older than the cutoff time, delete it
                if (fileDate < cutoffTime) {
                    fs.unlink(path.join(directoryPath, file), err => {
                        if (err) {
                            console.error('Error deleting file:', err);
                        } else {
                            console.log('Deleted file:', file);
                        }
                    });
                }
            }
        });
    });
}

    function getRandomValueFromArray(array) {
        // Generate a random index within the bounds of the array
        const randomIndex = Math.floor(Math.random() * array.length);
        
        // Return the value at the random index
        return array[randomIndex];
    }

    function genereazaOferta() {
        let filedata = fs.readFileSync(__dirname + '/resurse/json/oferte.json');
        if(filedata!='')
            oferte = JSON.parse(filedata);
        else
            oferte = JSON.parse('{"oferte":[]}');
        
        let valori_oferte = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

        let categorii = [...tipuri_componente];
        if(oferte.oferte[0] != null)
            categorii = categorii.filter(categ => categ != oferte.oferte[0].categorie);


        let categorie_aleasa = getRandomValueFromArray(categorii);
        let produs_ales;
        client.query(`select * from ${categorie_aleasa}`, (err, produse) => {
            if(err) {
                console.log(err);
                afisareEroare(res, 2);
                return;
            }
            produs_ales = getRandomValueFromArray(produse.rows);
            //console.log(produs_ales);
    
            let oferta_generata = {
                "categorie": categorie_aleasa,
                "produs_brand": produs_ales.brand,
                "produs_model": produs_ales.model,
                "produs_imagine": produs_ales.cale_imagine, 
                "data_incepere": new Date(),
                "data_finalizare": new Date(new Date().getTime() + 15 * 1000),
                "reducere": getRandomValueFromArray(valori_oferte)
            };
    
            oferte.oferte.unshift(oferta_generata);

            oferte.oferte = oferte.oferte.filter(oferta => (new Date().getTime() - new Date(oferta['data_finalizare']).getTime()) / 1000 <= 60); /// stergere oferte vechi
            
            fs.writeFileSync(__dirname + '/resurse/json/oferte.json', JSON.stringify(oferte));
            
            setTimeout(genereazaOferta, 15_000);
        });

    }

    function getOferta() {
        oferte = JSON.parse(fs.readFileSync(__dirname + '/resurse/json/oferte.json'));

        return oferte.oferte[0];
    }
}

function getSeason(date) {
    const month = date.getMonth() + 1;

    if (month >= 3 && month <= 5) {
        return "primavara";
    } else if (month >= 6 && month <= 8) {
        return "vara";
    } else if (month >= 9 && month <= 11) {
        return "toamna";
    } else {
        return "iarna";
    }
}

function construiesteGalerie() {
    let anotimp_acum = getSeason(new Date());
    let jsonGalerie;
    try {
        let filedata = fs.readFileSync('galerie.json', 'utf8');
        jsonGalerie = JSON.parse(filedata);
    } catch(err) {
        console.error("Error reading file:", err);
    }
    imagini_alese = []
    nr_img = 0;
    for(imagine of jsonGalerie.imagini)
        if(imagine.anotimp == anotimp_acum && nr_img < 13) {
            imagini_alese.push(imagine);
            ++nr_img;
        }
    if(nr_img != 13)
        throw "Prea putine imagini !";

    let surse = []
    let surse_medii = []
    let surse_mici = []
    let titluri = []
    let descrieri = []

    for(let i = 0; i < 13; ++i) {
        surse.push(jsonGalerie.cale_galerie + "/" + imagini_alese[i].cale_fisier + "." + imagini_alese[i].extensie);
        surse_mici.push(jsonGalerie.cale_galerie + "/" + imagini_alese[i].cale_fisier + "-mic" + "." + imagini_alese[i].extensie)
        surse_medii.push(jsonGalerie.cale_galerie + "/" + imagini_alese[i].cale_fisier + "-mediu" + "." + imagini_alese[i].extensie)
        titluri.push(imagini_alese[i].titlu);
        descrieri.push(imagini_alese[i].text_descriere);
    }

    let obGalerie = {
        sursa: surse,
        sursa_mica: surse_mici,
        sursa_medie: surse_medii,
        titlu: titluri,
        descriere: descrieri
    }
    return obGalerie;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function construiesteGalerieDinamica() {
    let nr_imagini_necesare = Math.floor(Math.random() * 7) + 6;
    /// Math.random -> (0,1) -> (0,6) -> (6, 12)
    let jsonGalerie;
    try {
        let filedata = fs.readFileSync('galerie.json', 'utf8');
        jsonGalerie = JSON.parse(filedata);
    } catch(err) {
        console.error("Error reading file:", err);
    }
    imagini_alese = []
    nr_img = 0;

    jsonGalerie.imagini = shuffleArray(jsonGalerie.imagini);

    for(imagine of jsonGalerie.imagini)
        if(nr_img < nr_imagini_necesare) {
            imagini_alese.push(imagine);
            ++nr_img;
        }
    if(nr_img < 6)
        throw "Prea putine imagini !";

    let surse = []
    let surse_medii = []
    let surse_mici = []
    let titluri = []
    let descrieri = []

    for(let i = 0; i < nr_imagini_necesare; ++i) {
        surse.push(jsonGalerie.cale_galerie + "/" + imagini_alese[i].cale_fisier + "." + imagini_alese[i].extensie);
        surse_mici.push(jsonGalerie.cale_galerie + "/" + imagini_alese[i].cale_fisier + "-mic" + "." + imagini_alese[i].extensie)
        surse_medii.push(jsonGalerie.cale_galerie + "/" + imagini_alese[i].cale_fisier + "-mediu" + "." + imagini_alese[i].extensie)
        titluri.push(imagini_alese[i].titlu);
        descrieri.push(imagini_alese[i].text_descriere);
    }

    let obGalerie = {
        sursa: surse,
        sursa_mica: surse_mici,
        sursa_medie: surse_medii,
        titlu: titluri,
        descriere: descrieri
    }
    return obGalerie;
}

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

function getTipuriComponente() {
    return new Promise((resolve, reject) => {
        client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`, (err, comp) => {
            if(err) {
                console.log(err);
                reject(err);
            } else {
                let tipuri_componente = comp.rows.filter(obj => obj.table_name != 'prajituri').map(obj => obj.table_name);
                resolve(tipuri_componente);
            }
        });
    });
}


function formatCurrentDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function compileazaScss(caleScss, caleCss) {
    if(!isAbsolutePath(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if(caleCss == null || caleCss === '')
        caleCss = path.join(obGlobal.folderCss, path.parse(caleScss).name + '.css');
    
    if(fs.existsSync(caleCss)) 
        fs.copyFileSync(caleCss, path.join(path.dirname(caleCss), 'backup', path.parse(caleCss).name + '-' + formatCurrentDate() + '.bk.css'));

    const result = sass.renderSync({
        file: caleScss
    });

    // Write the compiled CSS to the output file
    fs.writeFileSync(caleCss, result.css);
}

startServer();