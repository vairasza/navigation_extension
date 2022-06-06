function writeToFirebase(request, db, user_id) {
	db.collection(user_id).add(request.data)
	/*
		.then((docRef) => {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch((error) => {
			console.error("Error adding document: ", error);
		});
	*/
}

self.importScripts("./modules/firebase.js")
self.importScripts("./modules/uuidv4.js")

const firebaseConfig = {
	apiKey: "AIzaSyAl6ocIkZR4kpzZ_2i5BXOeGxaiCdN1Tj8",
	authDomain: "navigationextension.firebaseapp.com",
	databaseURL: "https://navigationextension-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "navigationextension",
	storageBucket: "navigationextension.appspot.com",
	messagingSenderId: "352949289408",
	appId: "1:352949289408:web:84d0361bb047e6af4a0825"
}

firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()
const url_filter = {
	url: [
		{
			hostSuffix: 'uni-regensburg.de'
		}
	]
}

//retrieve user id
let user_id = null

chrome.storage.local.get("navigation_extension_user_id", (result) => {
	user_id = result["navigation_extension_user_id"]
	if (user_id === undefined) {
		user_id = uuidv4()
		chrome.storage.local.set({ "navigation_extension_user_id": user_id })
	}
})

chrome.runtime.onMessage.addListener(function (request, sender) {
	if (request.command === "post") {
		writeToFirebase(request, db, user_id)
	}
});

chrome.webNavigation.onBeforeNavigate.addListener(
	function (details) {
		const request = {
			data: {
				timeStamp: new Date().getTime(),
				baseUrl: details.url,
				scriptSource: "navigation-script"
			}
		}
		writeToFirebase(request, db, user_id)
	},
	url_filter
)

chrome.runtime.onInstalled.addListener(() => {
	chrome.tabs.create({ url: "./nutzungshinweise.html" })
})

chrome.action.onClicked.addListener(() => {
	chrome.tabs.create({ url: "./nutzungshinweise.html" })
})