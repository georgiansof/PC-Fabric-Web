Array.from(document.getElementsByClassName('numericInput')).forEach(input => input.addEventListener('input', function(event) {
    // Get the input value
    let input = event.target.value;

    // Remove any non-numeric characters using a regular expression

    if(input[0]=='0')
        input = input.slice(0,1);

    input = input.replace(/\D/g, '');
    if(input.length > 9) 
        event.target.classList.add("is-invalid");
    
    if(input.length <= 9 && event.target.classList.contains("is-invalid"))
        event.target.classList.remove("is-invalid");
        

    if(input.length > 17)
        input = input.slice(0, -1);
    

    event.target.value = input;
}));

let items_filtered = JSON.parse(JSON.stringify(items));
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
   
    items_filtered = JSON.parse(JSON.stringify(items));

    for(var item of items_filtered) 
        item['memorie'] = item['memorie'].slice(1,-1).split(',');
    
    items_filtered = items_filtered.filter(item => filterItem(item));

    if(!sorting)
        updateItems();
    else
        sortItems();
});

document.getElementById("buton_sortare").addEventListener("click", () => {
    sorting = true;
    sortItems();
});

document.getElementById("buton_resetare").addEventListener("click", () => {
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

    const selector = document.querySelectorAll(`select[name="criteriu_sortare"]`)[0];
    const sortBy = selector.value;


    items_filtered.sort((a, b) => {
        if(crescator === false)
            return b[sortBy] - a[sortBy];
        else {
            return a[sortBy] - b[sortBy];
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
            if(item.pret_redus != null) 
                productDiv.innerHTML = `
                    <p>Procesor ${item.brand} ${item.model}</p>
                    <img src="${item.cale_imagine}" alt="Product Photo">
                    <ul>
                        <li>Soclu: ${item.soclu_procesor}</li>
                        <li>Generatie: ${item.generatie}</li>
                        <li>Frecventa maxima: ${item.frecventa_maxima / 1000} GHz</li>
                        <li>Litografie: ${item.tehnologie_fabricatie_nm} nm</li>
                        <li>Putere consumata: ${item.putere} W</li>
                        <li id="pret_normal"><s>Pret normal: ${item.pret} RON</s></li>
                        <li id="pret_redus">Pret acum: ${item.pret_redus} RON</li>
                        <button class="buy-button">Adauga in cos</button>
                    </ul>
                `;
            else
            productDiv.innerHTML = `
            <p>Procesor ${item.brand} ${item.model}</p>
            <img src="${item.cale_imagine}" alt="Product Photo">
            <ul>
                <li>Soclu: ${item.soclu_procesor}</li>
                <li>Generatie: ${item.generatie}</li>
                <li>Frecventa maxima: ${item.frecventa_maxima / 1000} GHz</li>
                <li>Litografie: ${item.tehnologie_fabricatie_nm} nm</li>
                <li>Putere consumata: ${item.putere} W</li>
                <li id="filler_pret" style="color: rgba(0,0,0,0);">Pret intreg</li>
                <li id="pret_redus">Pret acum: ${item.pret} RON</li>
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
}

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
                if(key === "pret" && item.pret_redus != null)
                    if(checkedKey = "pret_redus");

                if(item[checkedKey] < range_low_value || item[checkedKey] > range_high_value)
                    return false;
            }
        }
    }
    return true;
}

