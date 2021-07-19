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
let db = null;
let auth = null;
let storage = null;
let storageRef = null;
let UsersRef = null;
let ShopsRef = null;
let OrdersRef = null;

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
        curOrder = localStorage.getItem("curOrder");
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
        case "login.html":
            loadLogin();
            break;
        default:
            window.location.href = "index.html";
            break;
    }
    
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            user = user;
        }
    });
}
// =====================================================================================================================
//                                                     Home Page
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
}
// =====================================================================================================================
//                                                     Cart Page
// =====================================================================================================================
function loadCart() {
    console.log(`Current File Name Is ${page}`)
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
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCjruLQSZNI2_2zYo_q3HgVzhEXvVeiyhg&callback=initMap';
    script.async = true;

    window.initMap = function() {
        console.log('Initialised Maps');
    };

    document.head.appendChild(script);
}

function loadFirebaseScripts() {
    var scripts = ["https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js"
                    ,'https://www.gstatic.com/firebasejs/8.6.8/firebase-firestore.js'
                    ,'https://www.gstatic.com/firebasejs/8.6.8/firebase-auth.js'
                    ,'https://www.gstatic.com/firebasejs/8.6.8/firebase-storage.js'
                ]
    loadScripts(scripts, initialise)
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
