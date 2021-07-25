const firebaseConfig = {
    apiKey: "AIzaSyAVGDlM0RbybNPj15d3MiRcZTA1K48IaW8",
    authDomain: "happy-home-9f9c4.firebaseapp.com",
    projectId: "happy-home-9f9c4",
    storageBucket: "happy-home-9f9c4.appspot.com",
    messagingSenderId: "113061232735",
    appId: "1:113061232735:web:5b128ffaee9b89f555dbea",
    measurementId: "G-P2J4JL7JMX"
};
// =====================================================================================================================
//                                                     Global Variables
// =====================================================================================================================
var db = null;
var auth = null;
var storage = null;
var storageRef = null;
var UsersRef = null;
var ShopsRef = null;
var OrdersRef = null;
var curOrder = null;
var curUser = null

loadFirebaseScripts()

function initialise() {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    storageRef = storage.ref();
    UsersRef = db.collection('Users');
    ShopsRef = db.collection('Shops');
    OrdersRef = db.collection('Orders');
    if (localStorage.getItem("curOrder") != null) {
        curOrder = JSON.parse(localStorage.getItem("curOrder"));
    }else{
        curOrder = []
    }
    Loader(true);
    firebase.auth().onAuthStateChanged((user) => {
        Loader(false);
        if (user) {
            curUser = user;
        }
        var url = window.location.href.split("/");
        page = url[url.length - 1].trim();
        switch (page) {
            case "index.html":
                loadHome();
                break;
            case "shops.html":
                loadShops();
                break;
            case "driverPage.html":
                loadDriver();
                break;
            case "packerPage.html":
                loadPacker();
                break;
            case "items.html":
                loadShop();
                break;
            case "preview.html":
                loadPreview();
                break;
            case "cart.html":
                loadCart();
                break;
            case "cart.html":
                loadCart();
                break;
            case "checkout.html":
                loadCheckout();
                break;
            case "login.html":
                loadLogin();
                break;
            default:
                window.location.href = "index.html";
                break;
        }
    });
}
// =====================================================================================================================
//                                                     Home Page
// =====================================================================================================================
function loadHome() {
    ShopsRef.get().then((querySnapshot)=>{
        let numShops = querySnapshot.size;
        let numItems = 0
        querySnapshot.forEach((shop)=>{
            shop.ref.collection('Catalogue').get().then((catalogue)=>{
                numItems += catalogue.size;
                $('#num-products').text(numItems);
            });
        });
        $('#num-shops').text(numShops);
    });
}
// =====================================================================================================================
//                                                     Shops Page
// =====================================================================================================================
function loadShops() {
    $('.shop-list').off('click').on('click', '.list-item', function () {
        const id = $(this).find('p').text()
        sessionStorage.setItem('shop', id)
        window.location.replace('./items.html')
    });

    ShopsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let shop = doc.data();
            shop.id = doc.id;
            shopHtml = `<a class="list-item"">
                            <i class="ti ti-image"></i>
                            <h3>${shop.name}</h3>
                            <p hidden>${JSON.stringify(shop)}</p>
                        </a>`
            $('.shop-list').append(shopHtml)
        });
    })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}
// =====================================================================================================================
//                                                     Shop Page
// =====================================================================================================================
function loadShop() {
    shop = JSON.parse(sessionStorage.getItem('shop'));
    if (shop == null) {
        window.location.replace('./index.html');
    }
    $('.shop-items-list').off('click').on('click', '.list-item', function () {
        let item = $(this).find('#item-id').text();
        sessionStorage.setItem('item', item)
        window.location.href = './preview.html'
    });

    ShopsRef.doc(shop.id).collection('Catalogue')
        .get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let item = doc.data();
                item.id = doc.id
                itemHtml = `<a class="list-item"">
                            <div class="item-image">
                                <i class="ti ti-image"></i>
                            </div>
                            <h3 class="item-name">${item.name}</h3>
                            <p class="item-desc">${item.desc}</p>
                            <h2 class="item-price">R${item.price}</h2>
                            <p id="item-id" hidden>${JSON.stringify(item)}</p>
                            <button type="button" class="hh-btn add-to-cart"><i class="ti ti-shopping-cart"></i></button>
                        </a>`;
                $('.shop-items-list').append(itemHtml);
            });
        }).catch((err) => {
            console.log(err);
        });
}
// =====================================================================================================================
//                                                     Preview Page
// =====================================================================================================================
function loadPreview() {
    let item = JSON.parse(sessionStorage.getItem('item'));
    if (item == null) {
        window.location.replace('./items.html');
    }
    $('#hh_item_preview .item-name').text(item.name)
    $('#hh_item_preview .item-desc').text(item.desc)
    $('#hh_item_preview .item-price').text(item.price)

    $('.qty-btns').off('click').on('click', 'button', function(){
        let btn = $(this).text();
        let qty = $(this).closest('.qty-btns').find('input').val();
        if (btn == '+'){
            qty++
        }else{
            qty--
        }
        $(this).closest('.qty-btns').find('input').val(qty);
    });

    $('#item-to-cart').off('click').on('click', function(){
        if (curUser) {
            index = searchItem(item.id, curOrder);
            if (typeof index == "boolean") {
                item.qty = $('.qty-btns').find('input').val();
                curOrder.push(item);
            } else {
                curOrder[index].qty = $('.qty-btns').find('input').val();
            }
            localStorage.setItem('curOrder', JSON.stringify(curOrder));
            window.location.href = './cart.html';
        }else{
            window.location.href = './login.html';
        }
    });
}
// =====================================================================================================================
//                                                     Cart Page
// =====================================================================================================================
function loadCart() {
    if (curOrder.length > 0) {
        let orderTotal = 0;
        curOrder.forEach((orderItem)=>{
            let subTotal = orderItem.qty * orderItem.price;
            orderTotal += subTotal;
            html = `<div class="tb-row">
                        <div class="item-name tb-item">
                            <div class="img-container"><img src="./img/bg_image.jpg" alt=""></div>
                            <p>${orderItem.desc}
                            </p>
                        </div>
                        <div class="tb-item">
                            <p class="unit-price">R${orderItem.price}</p>
                        </div>
                        <div class="tb-item">
                            <div class="qty-btns">
                                <button class="decrease-qty">&minus;</button>
                                <input type="number" name="quantity" id="" min="1" value="${orderItem.qty}">
                                <button class="increase-qty">&plus;</button>
                            </div>
                        </div>
                        <div class="tb-item">
                            <h4 class="row-total">R${subTotal}</h4>
                        </div>
                    </div>`
            $('#cart-items-div').append(html)
        });
        $('#num-items').text(`${curOrder.length} items`);
        $('#c-sub-total').text(`R${orderTotal}`);
        $('#cart-total').text(`R${orderTotal}`);
    }
}
// =====================================================================================================================
//                                                     Checkout Page
// =====================================================================================================================
function loadCheckout() {
    let autocomplete;
    let addressField;
    let address1Field;
    let address2Field;
    let postalField;
    let userInfo;
    initAutocomplete();

    function initAutocomplete() {
        addressField = document.querySelector("input[name=street_address]");
        address1Field = document.querySelector("input[name=str_name_address]");
        address2Field = document.querySelector("input[name=suburb_address]");
        postalField = document.querySelector("input[name=postal_code_address]");
        // Create the autocomplete object, restricting the search predictions to
        // addresses in South Africa.
        autocomplete = new google.maps.places.Autocomplete(addressField, {
            componentRestrictions: { country: ["za"] },
            fields: ["address_components", "place_id"],
            types: ["address"],
        });
        addressField.focus();
        // When the user selects an address from the drop-down, populate the
        // address fields in the form.
        autocomplete.addListener("place_changed", fillInAddress);
    }

    function fillInAddress() {
        // Get the place details from the autocomplete object.
        const place = autocomplete.getPlace();
        let address1 = "";
        let postcode = "";

        // Get each component of the address from the place details,
        // and then fill-in the corresponding field on the form.
        for (const component of place.address_components) {
            const componentType = component.types[0];

            switch (componentType) {
                case "street_number": {
                    addressField.value = `${component.long_name}`;
                    break;
                }
                case "route": {
                    address1 += component.short_name;
                    break;
                }
                case "postal_code": {
                    postcode = `${component.long_name}${postcode}`;
                    break;
                }
                case "postal_code_suffix": {
                    postcode = `${postcode}-${component.long_name}`;
                    break;
                }
                case "sublocality_level_1":
                    address2Field.value = component.long_name;
                    break;
                case "locality":
                    // document.querySelector("#locality").value = component.long_name;
                    break;
                case "administrative_area_level_1": {
                    // document.querySelector("#state").value = component.short_name;
                    break;
                }
            }
        }
        address1Field.value = address1;
        postalField.value = postcode;
        // After filling the form with address components from the Autocomplete
        // prediction, set cursor focus on the second address line to encourage
        // entry of subpremise information such as apartment, unit, or floor number.
        $('input[name=company_name]').focus();
    }

    let tabs  = $('#c-o-tabs').find('a');
    $(function(){     
        var d = new Date(),        
            h = d.getHours(),
            m = d.getMinutes();
        if(h < 10) h = '0' + h; 
        if(m < 10) m = '0' + m; 
        $('input[type="time"][value="now"]').each(function(){ 
          $(this).attr({'value': h + ':' + m});
        });
    });
    $('.next-btn').off('click').on('click', function(e){
        e.preventDefault();
        nextTab();
    });

    if (curUser) {
        showTab('Delivery Address');
        UsersRef.doc(curUser.email).get().then((doc)=>{
            data = doc.data();
            data.id = doc.id;
            $('input[name=fname]').val(data.firstName);
            $('input[name=surname]').val(data.lastName);
            $('input[name=contact]').val(data.phone);
        }).catch((err)=>{
            console.log(err);
        });
    }else{
        showTab('Login');
    }

    function saveData() {
        let fname = $('input[name=fname]').val();
        let surname = $('input[name=surname]').val();
        let phone = $('input[name=contact]').val();
        let altPhone = $('input[name=alt_contact]').val();
        let complex = $('input[name=complex_address]').val();
        let unitNo = $('input[name=unit_address]').val();
        let streetName = $('input[name=str_name_address]').val();
        let streetAddress = $('input[name=street_address]').val();
        let suburb = $('input[name=suburb_address]').val();
        let postalCode = $('input[name=postal_code_address]').val();
        let company = $('input[name=company_name]').val();
        let vatNo = $('input[name=vat_number]').val();
        userInfo = {'fname': fname,
            'surname': surname,
            'phone': phone,
            'altPhone': altPhone,
            'complex': complex,
            'unitNo': unitNo,
            'streetAddress': streetAddress,
            'streetName': streetName,
            'suburb': suburb,
            'postalCode': postalCode,
            'company': company,
            'vatNo': vatNo
        }
        console.log(curOrder);
    }

    function dataValidation(tab) {
        switch (tab) {
            case 'Login':
                return validateUser();
            case 'Delivery Address':
                return validateAddress();
            case 'Instruction':
                return setUpReview();
            default:
                return false
        }

        function validateUser() {
            // Validate User Info e.g. email and phone
        }

        function validateAddress() {
            let fname = $('input[name=fname]').val();
            let surname = $('input[name=surname]').val();
            let phone = $('input[name=contact]').val();
            let streetName = $('input[name=str_name_address]').val();
            let streetAddress = $('input[name=street_address]').val();
            let suburb = $('input[name=suburb_address]').val();
            let postalCode = $('input[name=postal_code_address]').val();
            if (fname.length < 3) {
                $('input[name=fname]').focus();
                return false;
            }
            if (surname.length < 3) {
                $('input[name=surname]').focus();
                return false;
            }
            if (phone.length < 3) {
                $('input[name=contact]').focus();
                return false;
            }
            if (streetAddress.length < 1) {
                $('input[name=street_address]').focus();
                return false;
            }
            if (streetName.length < 2) {
                $('input[name=str_name_address]').focus();
                return false;
            }
            if (suburb.length < 3) {
                $('input[name=postal_code_address]').focus();
                return false;
            }
            if (postalCode.length < 3) {
                $('input[name=suburb_address]').focus();
                return false;
            }
            return true;
        }

        function setUpReview() {
            saveData();
            let subTot = 0;
            let charges = 35;
            for (let index = 0; index < curOrder.length; index++) {
                const el = curOrder[index];
                let sub = el.qty * el.price;
                subTot += sub;
            }
            let total = subTot + charges;
            $('#rev_name').text(`${userInfo.fname} ${userInfo.surname}`);
            $('#rev_cell').text(userInfo.phone);
            $('#rev_alt_cell').text(userInfo.altPhone);
            $('#rev_address').text(`${userInfo.complex} ${userInfo.unitNo} ${userInfo.streetAddress} ${userInfo.streetName}, ${userInfo.suburb} ${userInfo.postalCode}`);
            $('#rev_t_items').text(`Total Items: ${curOrder.length} Items`);
            $('#rev_sub').text(`R${subTot}`);
            $('#rev_charges').text(`R${charges}`);
            $('#rev_total').text(`R${total}`);
            $('#pay_amount').text(`R${total}`);
            return true;
        }
    }

    function nextTab() {
        let next_tab = $('.nav-tabs li a.active').closest('li').next('li').find('a');
        let cur_tab = $('.nav-tabs li a.active').text();
        if (dataValidation(cur_tab)) {
            showTab($(next_tab).text());
        }
    }

    function showTab(tab) {
        for (let index = 0; index < tabs.length; index++) {
            const mTab = tabs[index];
            if ($(mTab).text() == tab) {
                $(mTab).removeClass('disabled');
                $(mTab).tab('show');
            }
        }
    }
}
// =====================================================================================================================
//                                                     Driver Page
// =====================================================================================================================
function loadDriver() {
    console.log(`Current File Name Is ${page}`)
}
// =====================================================================================================================
//                                                     Packer Page
// =====================================================================================================================
function loadPacker() {
    console.log(`Current File Name Is ${page}`)
}
// =====================================================================================================================
//                                                     Login Page
// =====================================================================================================================
function loadLogin() {
    if (curUser) {
        window.history.back()
    }
    $('#loginBtn').off('click').on('click', function () {
        login()
    });

    $('#signUp').off('click').on('click', function () {
        signUp()
    });

    function login() {
        var email = $('#loginEmail').val()
        var password = $('#loginPassword').val()
        if (!isEmail(email)) {
            showErr('Login Failed', 'Please Enter A Valid Email Address')
            return
        }
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                user = userCredential.user;
                window.location.replace("./index.html");
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                switch (errorCode) {
                    case 'auth/user-not-found':
                        errorMessage = 'Account Not Found, Please Register An Account Before You Can Login'
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Invalid Email or Password'
                        break;
                    default:
                        errorMessage = 'Login Failed, Please Try Again Later'
                        break;
                }
                console.log(`${errorCode}: ${errorMessage}`)
            });
    }

    function signUp() {
        var fName = $('#first_name').val()
        var lName = $('#last_name').val()
        var phone = $('#phone').val()
        var email = $('#email').val()
        var password = $('#password').val()
        var cPassword = $('#c_password').val()
        var userType = 'Client';
        if (fName.length < 3) {
            showErr('Failed', 'Please Enter A Valid First Name')
            return
        }
        if (lName.length < 3) {
            showErr('Failed', 'Please Enter A Valid Last Name')
            return
        }
        if (!isEmail(email)) {
            showErr('Failed', 'Please Enter A Valid Email Address')
            return
        }
        if (!isPhone(phone)) {
            showErr('Failed', 'Please Enter A Valid Phone')
            return
        }
        if (!isPassValid(password)) {
            showErr('Failed', 'Please use a stronger password')
            return
        }
        if (password != cPassword) {
            showErr('Failed', 'Passwords do not match')
            return
        }
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                user = userCredential.user;
                UsersRef.doc(email).set({
                    email: email,
                    firstName: fName,
                    lastName: lName,
                    phone: phone,
                    userType: userType
                }).then(() => {
                    window.location.replace("./index.html");
                }).catch((error) => {
                    console.error("Error Adding document: ", error);
                });
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
            });
    }
}
// =====================================================================================================================
//                                                     Multi Purpose
// =====================================================================================================================
function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function isPhone(inputtxt) {
    var phoneno = /^\d{10}$/;
    return (inputtxt.match(phoneno))
}

function isPassValid(pass) {
    var regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/;
    return regex.test(pass)
}

function showErr(title, msg) {
    alert(`${title}: ${msg}`)
}

function loader(start) {
    if (start) {
        $("body").addClass("loading");
    } else {
        $("body").removeClass("loading");
    }
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return i;
        }
    }
    return false;
}

function searchItem(idKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === idKey) {
            return i;
        }
    }
    return false
}

function getShopLogoTo(shop, imgId) {
    storageRef.child(`${shop}/logo.jpg`).getDownloadURL()
        .then((url) => {
            var img = document.getElementById(imgId);
            img.setAttribute('src', url);
        })
        .catch((error) => {
            console.log(error);
        });
}

function loadSriptMap() {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCjruLQSZNI2_2zYo_q3HgVzhEXvVeiyhg';
    script.async = true;

    window.initMap = function() {
        console.log('Initialised Maps');
    };

    document.head.appendChild(script);
}

function loadFirebaseScripts() {
    // loadSriptMap();
    var scripts = ["https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js"
                    ,'https://www.gstatic.com/firebasejs/8.6.8/firebase-firestore.js'
                    ,'https://www.gstatic.com/firebasejs/8.6.8/firebase-auth.js'
                    ,'https://www.gstatic.com/firebasejs/8.6.8/firebase-storage.js'
                    ,"https://maps.googleapis.com/maps/api/js?key=AIzaSyCjruLQSZNI2_2zYo_q3HgVzhEXvVeiyhg&libraries=places"
                ]
    loadScripts(scripts, initialise);
}

function loadScripts(array,callback){  
    var loader = function(src,handler){  
        var script = document.createElement("script");  
        script.src = src;  
        script.onload = script.onreadystatechange = function(){  
          script.onreadystatechange = script.onload = null;  
          if(/MSIE ([6-9]+\.\d+);/.test(navigator.userAgent))window.setTimeout(function(){handler();},8,this);  
          else handler();  
        }  
        var head = document.getElementsByTagName("head")[0];  
        (head || document.body).appendChild( script );  
    };  
    (function(){  
        if(array.length!=0){  
                loader(array.shift(),arguments.callee);  
        }else{  
                callback && callback();  
        }  
    })();  
} 

function Loader(start) {
    var loaderHtml = '<div id="loader"><div></div><h4 id="progress"></h4></div>';
	if ($('body').find('#loader').length == 0) {
		$('body').append(loaderHtml);
	}
    if (start) {
        $("#loader").addClass("loader");
    } else {
        $("#loader").removeClass("loader");
    }
}

function initMap() {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 7,
      center: { lat: 41.85, lng: -87.65 },
    });
    directionsRenderer.setMap(map);
  
    const onChangeHandler = function () {
      calculateAndDisplayRoute(directionsService, directionsRenderer);
    };
    document.getElementById("start").addEventListener("change", onChangeHandler);
    document.getElementById("end").addEventListener("change", onChangeHandler);
}
  
function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    directionsService
      .route({
        origin: {
          query: document.getElementById("start").value,
        },
        destination: {
          query: document.getElementById("end").value,
        },
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
      })
      .catch((e) => window.alert("Directions request failed due to " + status));
}
