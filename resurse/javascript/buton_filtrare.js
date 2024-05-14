Array.from(document.getElementsByClassName('numericInput')).forEach(input => input.addEventListener('input', function(event) {
    // Get the input value
    let input = event.target.value;

    // Remove any non-numeric characters using a regular expression
    input = input.replace(/\D/g, '');

    // Update the input field value
    event.target.value = input;
}));

let items_filtered = JSON.parse(JSON.stringify(items));

document.getElementById("buton_filtrare").addEventListener("click", function() {
   
    let items_filtered = JSON.parse(JSON.stringify(items));

    for(var item of items_filtered) 
        item['memorie'] = item['memorie'].slice(1,-1).split(',');

    items_filtered = items_filtered.filter(item => filterItem(item));

    console.log(items_filtered);

    // Update the HTML content of the product container with the sorted items
    var productContainer = document.getElementById("productContainer");
    productContainer.innerHTML = ''; // Clear the container


    if(items_filtered.length > 0)
        items_filtered.forEach(item => {
            var productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <p>Procesor ${item.brand} ${item.model}</p>
                <img src="${item.cale_imagine}" alt="Product Photo">
                <ul>
                    <li>Soclu: ${item.soclu_procesor}</li>
                    <li>Generatie: ${item.generatie}</li>
                    <li>Frecventa maxima: ${item.frecventa_maxima / 1000} GHz</li>
                    <li>Litografie: ${item.tehnologie_fabricatie_nm} nm</li>
                    <li>Putere consumata: ${item.putere_w} W</li>
                    <li id="pret_normal"><s>Pret normal: ${item.pret} RON</s></li>
                    <li id="pret_redus">Pret acum: ${item.pret_redus} RON</li>
                    <button class="buy-button">Adauga in cos</button>
                </ul>
            `;
            productContainer.appendChild(productDiv);
        });
    else {
        var productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `<p> Nu am gasit niciun produs cu aceste filtre ! </p>`;
        productContainer.appendChild(productDiv);
    }
});

function filterItem(item) {
    keyfor:
    for(var key of Object.keys(json_filtre)) {
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
                console.log('Eliminated from checkbox at key', key, ' : ', item[key] , ' by filters ', filters);
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

                switch(selectedValue) {
                    case "Da":
                        booleanSelectedValue = true;
                        break;
                    case "Nu":
                        booleanSelectedValue = false;
                        break;
                }

                if(booleanSelectedValue == undefined)
                    continue;
                /// else
                if(item[key] !== booleanSelectedValue)
                    return false;
            }
            else { /// range value
                let range_low = document.querySelectorAll(`input[type="text"][name="${key}_low"]`)[0].value;
                let range_high = document.querySelectorAll(`input[type="text"][name="${key}_high"]`)[0].value;
                
                let range_low_value = -1;
                let range_high_value = 1e9;


                if(range_low !== "")
                    range_low_value = parseInt(range_low);

                if(range_high !== "")
                    range_high_value = parseInt(range_high);

                let checkedKey = key;
                if(key === "pret" && item[pret_redus] != null)
                    if(checkedKey = "pret_redus");

                if(item[checkedKey] < range_low_value || item[checkedKey] > range_high_value)
                    return false;
            }
        }
    }
    return true;
}

