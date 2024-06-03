var clickDisabled = false;
var invalidFilter = false;

const rangeInput = document.getElementById('min-year');
let rangeInputVal = parseInt(rangeInput.textContent);

document.getElementById('min-year-disp').textContent = rangeInput.value;

rangeInput.addEventListener('input', () => {
    let selectedYear = rangeInput.value;
    document.getElementById('min-year-disp').textContent = selectedYear;
    rangeInputVal = parseInt(selectedYear);
});

document.getElementById('buton_calculare').addEventListener('click', () => {
    if(!clickDisabled) {
        clickDisabled = true;
        let medie = 0;
        items_filtered.forEach(item => medie += item.putere || item.putere_w);
        medie /= items_filtered.length;
        if(items_filtered.length == 0)
            medie = 0;

        var newDiv = document.createElement('div');
        newDiv.id = 'medie_putere';
        newDiv.innerText = `Media puterii este de ${Math.round(medie)} W.`;

        document.getElementById('container_filtrare_sortare').appendChild(newDiv);
        setTimeout(() => {
            document.getElementById('container_filtrare_sortare').removeChild(newDiv);
            clickDisabled = false;
        }, 2000);
    }
});

Array.from(document.getElementsByClassName('numericInput')).forEach(input => input.addEventListener('input', function(event) {
    // Get the input value
    let input = event.target.value;

    // Remove any non-numeric characters using a regular expression

    if(input[0]=='0')
        input = input.slice(0,1);

    input = input.replace(/\D/g, '');
    if(input.length > 9) {
        event.target.classList.add("is-invalid");
        invalidFilter = true;
    }
    
    if(input.length <= 9 && event.target.classList.contains("is-invalid"))
        event.target.classList.remove("is-invalid");
    
    const arr = Array.from(document.getElementsByClassName('is-invalid'));

    if(arr.length == 0)
        invalidFilter = false;

    if(input.length > 17)
        input = input.slice(0, -1);
    

    event.target.value = input;
}));

var items_filtered = JSON.parse(JSON.stringify(items));
let sorting = false;

$(document).ready(function(){
    $(".btn.deblocat_oc").click(function(){
      $(".btn.deblocat_oc").removeClass("selected").removeClass("btn-primary").addClass("btn-outline-primary");
      $(this).removeClass("btn-outline-primary").addClass("selected").addClass("btn-primary");
    });
});

$(document).ready(function(){
    $(".btn.procesor_grafic").click(function(){
      $(".btn.procesor_grafic").removeClass("selected").removeClass("btn-primary").addClass("btn-outline-primary");
      $(this).removeClass("btn-outline-primary").addClass("selected").addClass("btn-primary");
    });
});

$(document).ready(function(){
    $(".btn.buton-tip-sortare").click(function(){
      $(".btn.buton-tip-sortare").removeClass("selected").removeClass("btn-primary").addClass("btn-outline-primary");
      $(this).removeClass("btn-outline-primary").addClass("selected").addClass("btn-primary");
    });
});

document.getElementById("buton_filtrare").addEventListener("click", function() {
    if(!invalidFilter) {
        items_filtered = JSON.parse(JSON.stringify(items));

        if(tip_componenta == 'procesor')
            for(var item of items_filtered) 
                item['memorie'] = item['memorie'].slice(1,-1).split(',');
        
        items_filtered = items_filtered.filter(item => filterItem(item));

        document.getElementById('nr-produse').innerHTML = items_filtered.length.toString();

        if(!sorting)
            updateItems();
        else
            sortItems();
    }
    else 
        alert('Cel puțin un filtru este invalid!');
});

document.getElementById("buton_sortare").addEventListener("click", () => {
    if(!invalidFilter) {
        sorting = true;
        sortItems();
    }
    else 
        alert('Cel puțin un filtru este invalid!');
});

document.getElementById("buton_resetare").addEventListener("click", () => {
    if(confirm('Sigur vreti sa resetati filtrele ?'))
        location.reload();
});

function sortItems() {
    let selectedValue = undefined;
    const radio = document.querySelectorAll(`input[type="radio"][name="crescator"]`);
    if(radio.length > 0)
        radio.forEach(radioButton => {
            if(radioButton.checked)
                selectedValue = radioButton.value; 
        });

    let crescator = (selectedValue == "true");

    let selectedValueSecondary = undefined;
    const radioSecondary = document.querySelectorAll(`input[type="radio"][name="crescator-secundar"]`);
    if(radioSecondary.length > 0)
        radioSecondary.forEach(radioButton => {
            if(radioButton.checked)
                selectedValueSecondary = radioButton.value; 
        });

    let crescatorSecundar = (selectedValueSecondary == "true");

    const selector = document.querySelectorAll(`select[name="criteriu_sortare"]`)[0];
    const selector_secundar = document.querySelectorAll(`select[name="criteriu_sortare_secundar"]`)[0];
    
    let sortBy = selector.value;
    if(sortBy == 'pret')
        sortBy = 'pret_redus';
    
    let sortBySecondary = selector_secundar.value;
    if(sortBySecondary == 'pret')
        sortBySecondary = 'pret_redus';


    items_filtered.sort((a, b) => {
        if(sortBy != 'nume') {
            const bVal = (b[sortBy]==null ? b.pret : b[sortBy]);
            const aVal = (a[sortBy]==null ? a.pret : a[sortBy]);
            if(bVal - aVal != 0)
                if(crescator)
                    return aVal - bVal;
                else
                    return bVal - aVal;
        }
        else {
            a_str = a.brand + ' '  + a.model;
            b_str = b.brand + ' ' + b.model;
            a_str = a_str.toLowerCase();
            b_str = b_str.toLowerCase();
            if(crescator)
                return a_str.localeCompare(b_str);
            else
                return b_str.localeCompare(a_str);
        }

        if(sortBySecondary != 'nume') {
            const bVal = (b[sortBySecondary]==null ? b.pret : b[sortBySecondary]);
            const aVal = (a[sortBySecondary]==null ? a.pret : a[sortBySecondary]);
            if(crescatorSecundar)
                return aVal - bVal;
            else
                return bVal - aVal;
        }
        else {
            a_str = a.brand + ' ' + a.model;
            b_str = b.brand + ' ' + b.model;
            a_str = a_str.toLowerCase();
            b_str = b_str.toLowerCase();
            if(crescatorSecundar)
                return a_str.localeCompare(b_str);
            else 
                return b_str.localeCompare(a_str);
        }
    });


    updateItems();
}

function updateItems() {
    // Update the HTML content of the product container with the sorted items
    var productContainer = document.getElementById("productContainer");
    productContainer.innerHTML = ''; // Clear the container


    if(items_filtered.length > 0)
        items_filtered.forEach(item => {
            var productDiv = document.createElement('div');
            productDiv.classList.add('product');
            if(tip_componenta == 'procesor') {
                if(item.pret_redus != null) 
                    productDiv.innerHTML = `
                        <a href='/procesoare/${item.id}'>
                        ${tip_componenta.replace(/_/g, ' ').replace(/^\w/, char => char.toUpperCase()) + ' ' + item.brand + ' ' + item.model}
                        <br>
                        <img src="${item.cale_imagine}" alt="Product Photo">
                        </a>
                        <ul>
                            <li>Soclu: ${item.soclu_procesor}</li>
                            <li>Generatie: ${item.generatie}</li>
                            <li>Frecventa maxima: ${item.frecventa_maxima / 1000} GHz</li>
                            <li>Litografie: ${item.tehnologie_fabricatie_nm} nm</li>
                            <li>Putere consumata: ${item.putere} W</li>
                            <li id="pret_normal"><s>Pret normal: ${item.pret} RON</s></li>
                            <li id="pret_redus">Pret acum: ${item.pret_redus} RON</li>
                    `;
                else
                    productDiv.innerHTML = `
                        <a href='/procesoare/${item.id}'>
                        ${tip_componenta.replace(/_/g, ' ').replace(/^\w/, char => char.toUpperCase()) + ' ' + item.brand + ' ' + item.model}
                        <br>
                        <img src="${item.cale_imagine}" alt="Product Photo">
                        </a>
                        <ul>
                            <li>Soclu: ${item.soclu_procesor}</li>
                            <li>Generatie: ${item.generatie}</li>
                            <li>Frecventa maxima: ${item.frecventa_maxima / 1000} GHz</li>
                            <li>Litografie: ${item.tehnologie_fabricatie_nm} nm</li>
                            <li>Putere consumata: ${item.putere} W</li>
                            <li id="filler_pret" style="color: rgba(0,0,0,0);">Pret intreg</li>
                            <li id="pret_redus">Pret acum: ${item.pret} RON</li>
                    `;

                    if(item.ieftin) {
                        productDiv.innerHTML+=`<li style="color: green;">Cel mai ieftin produs!</li>`;
                    }

                    if((new Date().getTime() - new Date(item.data_lansare).getTime()) / (1000 * 60 * 60 * 24 * 365.25) > 5) {
                        productDiv.innerHTML+= `<li style="color: red;">Extra discount 15% în coș.</li>`;
                    }
                    
                    productDiv.innerHTML += `<button class="buy-button">Adauga in cos</button>;
                    </ul>`;
            }
            else
                if(tip_componenta == 'placa_grafica') {
                    if(item.pret_redus != null)
                        productDiv.innerHTML = `
                            <a href='/placi_grafice/${item.id}'>
                            ${tip_componenta.replace(/_/g, ' ').replace(/^\w/, char => char.toUpperCase()) + ' ' + item.brand + ' ' + item.model}
                            <br>
                            <img src="${item.cale_imagine}" alt="Product Photo">
                            </a>
                            <ul>
                                <li>Generatie: ${item.generatie}</li>
                                <li>Frecventa maxima: ${item.frecventa_maxima_MHz / 1000} GHz</li>
                                <li>Dimensiune memorie: ${item.memorie_MB} MB</li>
                                <li>Tip memorie: ${item.tip_memorie}</li>
                                <li id="pret_normal"><s>Pret normal: ${item.pret} RON</s></li>
                                <li id="pret_redus">Pret acum: ${item.pret_redus} RON</li>

                        `;
                    else
                        productDiv.innerHTML = `
                        <a href='/placi_grafice/${item.id}'>
                        ${tip_componenta.replace(/_/g, ' ').replace(/^\w/, char => char.toUpperCase()) + ' ' + item.brand + ' ' + item.model}
                        <br>
                        <img src="${item.cale_imagine}" alt="Product Photo">
                        </a>
                        <ul>
                            <li>Generatie: ${item.generatie}</li>
                            <li>Frecventa maxima: ${item.frecventa_maxima_MHz / 1000} GHz</li>
                            <li>Dimensiune memorie: ${item.memorie_MB} MB</li>
                            <li>Tip memorie: ${item.tip_memorie}</li>
                            <li id="filler_pret" style="color: rgba(0,0,0,0);">Pret intreg</li>
                            <li id="pret_redus">Pret acum: ${item.pret} RON</li>
                    `;

                    if(item.ieftin) {
                        productDiv.innerHTML+=`<li style="color: green;">Cel mai ieftin produs!</li>`;
                    }

                    if((new Date().getTime() - new Date(item.data_lansare).getTime()) / (1000 * 60 * 60 * 24 * 365.25) > 5) {
                        productDiv.innerHTML+= `<li style="color: red;">Extra discount 15% în coș.</li>`;
                    }

                    productDiv.innerHTML += `<button class="buy-button">Adauga in cos</button>
                    </ul>`
                }
                    
            productContainer.appendChild(productDiv);
        });
    else {
        var productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `<p> Nu am gasit niciun produs cu aceste filtre ! </p>`;
        productContainer.appendChild(productDiv);
    }
}
function removeDiacritics(text) {
    var diacriticsMap = {
        'ă': 'a', 'Ă': 'A',
        'â': 'a', 'Â': 'A',
        'ș': 's', 'Ș': 'S',
        'ț': 't', 'Ț': 'T',
        'î': 'i', 'Î': 'I'
    };

    return text.replace(/[ăâșțîĂÂȘȚÎ]/g, function(match) {
        return diacriticsMap[match];
    });
}

function filterItem(item) {
    if(new Date(item.data_lansare).getFullYear() < rangeInputVal)
        return false;

    let discount_vechi = document.getElementById('checkbox-discount-vechi');

    if(discount_vechi.checked) {
        let ani_de_la_lansare = (new Date().getTime() - new Date(item.data_lansare).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        //console.log(ani_de_la_lansare, item.model);
        if(ani_de_la_lansare < 5) {
           // console.log('false');
            return false;
        }
    }

    const selectedMonths = Array.from(monthSelect.selectedOptions).map(option => option.value);
    let lunile_anului = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
    if(!selectedMonths.includes(lunile_anului[new Date(item.data_lansare).getMonth()]))
        return false;

    let item_name = tip_componenta.replace(/_/g, ' ').replace(/^\w/, char => char.toUpperCase()) + ' ' + item.brand + ' ' +  item.model;
    let contain_filter = document.getElementById('searchbox').value.trim();

    let normalized_contain_filter = removeDiacritics(contain_filter).toLowerCase().trim();
    let normalized_item_name = removeDiacritics(item_name).toLowerCase().trim();
    if(normalized_contain_filter != '' && normalized_item_name.indexOf(normalized_contain_filter) == -1)
        return false;

    keyfor:
    for(var key of Object.keys(json_filtre)) {
        const datalistinput = document.querySelector(`input.input-datalist[name="${key}"]`);
        if(datalistinput != null) {
            if(datalistinput.value == 'oricare')
                continue;

            if(datalistinput.value != item[key]) {

                return false;
            }
        }
        else 
            {
                const checkboxes = document.querySelectorAll(`input[type="checkbox"][name="${key}"]`);
                if(checkboxes.length > 0) {
                    if(!Array.isArray(item[key])) {
                        if(!Array.from(checkboxes).filter(chkbox => chkbox.checked).map(chkbox => chkbox.value).includes(item[key].toString())) {
                       
                            return false;
                        }
                    }
                    else {
                        let filters = Array.from(checkboxes).filter(chkbox => chkbox.checked).map(chkbox => chkbox.value);
                        for(let filter of filters)
                            if(item[key].includes(filter)) {
                                continue keyfor; /// daca corespunde cel putin unei optiuni, este afisat
                            }
                    
                        return false; /// altfel este sters
                    }
                }
                else {
                    let selectedValue = undefined;
                    let booleanSelectedValue = undefined;
                    const radio = document.querySelectorAll(`input[type="radio"][name="${key}"]`);
                    if(radio.length > 0) {
                        radio.forEach(radioButton => {
                            if(radioButton.checked)
                                selectedValue = radioButton.value; 
                        });
                        
                        if(selectedValue == 'intel' || selectedValue == 'amd' || selectedValue == 'nvidia') {
                            if(selectedValue != item.brand.toLowerCase()) {
                              
                                return false;
                            }
                        }

                        switch(selectedValue) {
                            case "true":
                                booleanSelectedValue = true;
                                break;
                            case "false":
                                booleanSelectedValue = false;
                                break;
                        }

                        if(booleanSelectedValue == undefined) {
                            //console.log(key, item[key], booleanSelectedValue);
                            continue;
                        }
                        /// else
                        if(item[key] !== booleanSelectedValue) {
                 
                            return false;
                        }
                    }
                    else { /// range value
                        let range_low = document.querySelectorAll(`input[type="text"][name="${key}_low"]`)[0].value;
                        let range_high = document.querySelectorAll(`input[type="text"][name="${key}_high"]`)[0].value;
                        
                        let range_low_value = -1;
                        let range_high_value = 1e9;


                        if(range_low !== "")
                            range_low_value = parseFloat(range_low);

                        if(range_high !== "")
                            range_high_value = parseFloat(range_high);

                        let checkedKey = key;
                        if(key === "pret" && item.pret_redus != null)
                            checkedKey = "pret_redus";
                        
                        if(parseFloat(item[checkedKey]) < range_low_value || parseFloat(item[checkedKey]) > range_high_value) {
                            console.log('eliminat', item[checkedKey], range_low_value, range_high_value, parseFloat(item[checkedKey]) < range_low_value, parseFloat(item[checkedKey]) > range_high_value);
                            return false;
                        }
                    }
                }
            }
    }
    return true;
}