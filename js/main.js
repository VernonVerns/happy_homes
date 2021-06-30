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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const UsersRef = db.collection('Users');
const ShopsRef = db.collection('Shops');
const OrdersRef = db.collection('Orders');

window.onload = function () {
    if (localStorage.getItem("curOrder") != null) {
        curOrder = localStorage.getItem("curOrder");
    }

    var url = window.location.href.split("/");
    page = url[url.length - 1].trim();
    switch (page) {
        case "index.html":
            loadHome();
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
}
// =====================================================================================================================
//                                                     Home Page
// =====================================================================================================================
function loadHome() {
    console.log(`Current File Name Is ${page}`)
}
// =====================================================================================================================
//                                                     Shop Page
// =====================================================================================================================
function loadShop() {
    console.log(`Current File Name Is ${page}`)
}
// =====================================================================================================================
//                                                     Preview Page
// =====================================================================================================================
function loadPreview() {
    console.log(`Current File Name Is ${page}`)
}
// =====================================================================================================================
//                                                     Cart Page
// =====================================================================================================================
function loadCart() {
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

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        user = user;
    }
});