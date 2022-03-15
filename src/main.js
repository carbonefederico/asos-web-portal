const props = {
    "skCompanyId": "d99bfb89-f3f6-4648-bd45-8d1c7868c81b",
    "skLoginPolicyId": "wBvNBY4k0FiE1EgQSAnSAYGrCnaPbY9b",
    "skPreferencesPolicyId": "aRvuw3zL5cRQ7n8S2ZJLBoaF6tTB0Iig",
    "skPreferencesPolicyId": "aRvuw3zL5cRQ7n8S2ZJLBoaF6tTB0Iig",
    "skTransactionPolicyId": "7nsDlfDcWa0x6QxTbetj3iE0zcJjgBws",
    "skApiKey": "46qyJSK0pzWHkk6z37j90Ru1wlcqfupGQNrcZpza3BggwhFOO6ixfssKRFbiT0vbBuBSwYa1GPuuTsFYDRunTaDdQghVZFCEg8bnF2stcvyhyYUGWKgZ8tIZIrx7lizFZhHiIfBvtu7fMgcqYLPT7HkPIlWM9kFELx4buGH6VZQ9jzwcNwBOlK03HSj74D7pDvSZq7CEvqJrOYPZOqmOBrUFEMp8JMUAUEnsLFgPyYNXQpsoYRfOKLhFzYhcigxp"
}

let token;
let skWidget;
let idTokenClaims;
let application_session_id;

window.onload = async () => {
    console.log("onload");
    document.getElementById("login").addEventListener("click", () => startLogin());
    document.getElementById("logout").addEventListener("click", () => logout());
    document.getElementById("username").addEventListener("click", () => startProfileUpdate());
    document.getElementById("home").addEventListener("click", () => showPage("product"));
    document.getElementById("product").addEventListener("click", () => startTransaction());
    await getToken();
    skWidget = document.getElementsByClassName("skWidget")[0];
    generateSessionAndInitST();
}

async function startProfileUpdate() {
    console.log("startProfileUpdate for user " + idTokenClaims.username);

    let parameters = {
        'username': idTokenClaims.username
    }
    showWidget(props.skPreferencesPolicyId, porfileChangeSuccessCallback, errorCallback, onCloseModal, parameters);
}

async function startLogin() {
    console.log("startLogin");
    showWidget(props.skLoginPolicyId, successCallback, errorCallback, onCloseModal);
}

function startTransaction() {
    console.log("startTransaction");
    let parameters = {
        'username': idTokenClaims.username,
        'item': 'ASOS Actual T-Shirt',
        'cost': '22.00 £'
    }
    showWidget(props.skTransactionPolicyId, purchaseCallback, errorCallback, onCloseModal, parameters);
}

async function logout() {
    console.log("logout");
    idTokenClaims = null;
    updateUI(false);
    _securedTouch.logout(application_session_id);
}

async function getToken() {
    console.log("getToken");

    const url = "https://api.singularkey.com/v1/company/" + props.skCompanyId + "/sdkToken";
    let response = await fetch(url, {
        method: "GET",
        headers: {
            "X-SK-API-KEY": props.skApiKey
        }
    });

    token = await response.json();
    console.log(token);
}

async function showWidget(policyId, successCallback, errorCallback, onCloseModal, parameters) {
    console.log("showWidget");
    let widgetConfig = {
        config: {
            method: "runFlow",
            apiRoot: "https://api.singularkey.com/v1",
            accessToken: token.access_token,
            companyId: props.skCompanyId,
            policyId: policyId,
            parameters: parameters
        },
        useModal: true,
        successCallback,
        errorCallback,
        onCloseModal
    };

    singularkey.skRenderScreen(skWidget, widgetConfig);
}

function porfileChangeSuccessCallback(response) {
    console.log("porfileChangeSuccessCallback");
    singularkey.cleanup(skWidget);
}

function successCallback(response) {
    console.log("successCallback");
    console.log(response);
    singularkey.cleanup(skWidget);
    idTokenClaims = response.additionalProperties;
    updateUI(true);
    _securedTouch.login(idTokenClaims.username, application_session_id);
}

function errorCallback(error) {
    console.log("errorCallback");
    console.log(error);
    singularkey.cleanup(skWidget);
}

function onCloseModal() {
    console.log("onCloseModal");
    singularkey.cleanup(skWidget)
}

function purchaseCallback(response) {
    console.log("purchaseCallback");
    singularkey.cleanup(skWidget);
    showPage("home");
}

function updateUI(isUserAuthenticated) {
    console.log("updateUI. Is user authenticated " + isUserAuthenticated);

    if (isUserAuthenticated) {
        document.getElementById("username").innerText = getDisplayName(idTokenClaims);
        document.getElementById("logout").classList.remove("hidden");
        document.getElementById("login").classList.add("hidden");
    } else {
        document.getElementById("username").innerText = "";
        document.getElementById("logout").classList.add("hidden");
        document.getElementById("login").classList.remove("hidden");
    }
}

function getDisplayName(claims) {
    if (claims.given_name) {
        return claims.given_name;
    }
    return claims.email;
}



function initSecuredTouch(callback) {
    console.log("initSecuredTouch");
    if (window['_securedTouchReady']) {
        console.log("calling callback");
        callback();
    } else {
        console.log("adding event listener");
        document.addEventListener('SecuredTouchReadyEvent', callback);
    }
}


function generateSessionAndInitST() {
    console.log("generateSessionAndInitST");
    application_session_id = generateSessionId();
    initSecuredTouch(function () {
        console.log("callback function. session id " + application_session_id);
        _securedTouch.init({
            url: "https://us.securedtouch.com",
            appId: "ping-te-3",
            appSecret: "EJBgAz1mFeQFveSDqD6eYf6Dgs5T",
            userId: null,   // todo: Set the userId if the user is already logged-in.
            // If the user state is unknown when initializing the SDK, do not use this parameter.
            sessionId: application_session_id, // todo: Set your applicative sessionId if you have it
            isDebugMode: false,
            isSingleDomain: false, // todo: set to true if your website uses only one domain and no subdomains
        }).then(function () {
            console.log("**** SecuredTouchSDK initialized successfully with session " + application_session_id);
        }).catch(function (e) {
            console.error("An error occurred. Please check your init configuration", e);
        });
    });
}


function generateSessionId() {
    console.log("generateSessionId");

    var d = new Date();
    var id = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + "-" +
        d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds();
    console.log("Session id " + id);
    return id;
}

function showPage(idToShow) {
    hideAll();
    document.getElementById(idToShow).style.display = "block";
}

function hideAll() {
    console.log("hideAll");
    document.querySelectorAll(".home-image").forEach((e) => e.style.display = "none");
}