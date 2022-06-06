//log clicks/interaction on the website
//sends collected data via chrome message channel to the background script where it is sent to firebase
function writeToFirebase(details) {
    chrome.runtime.sendMessage(
        {
            command: "post",
            data: details
        }
    )
}

//path is type array
//iterate the DOM path from top to current element and saves tagName plus classList for later identification as
//elements on uni-regensburg.de do not have an id
function convertPath(path) {
    let tree = []

    try {
        //iterate from behind so html tag is at top of the list
        for (let i = path.length - 1; i >= 0; i--) {
            const elements = {}

            elements[i] = {}
            elements[i]["tagName"] = path[i].tagName

            if (path[i].classList !== undefined) {
                elements[i]["classListItems"] = []
                for (let value of path[i].classList.values()) {
                    elements[i]["classListItems"].push(value)
                }
            }

            tree.push(elements)
        }
    } catch (e) {
        return []
    }

    return tree
}

//filter the most important properties from the click event
function handleClickEvent(clickEvent) {
    const path = convertPath(clickEvent.path)

    const clickedElement = {
        path: path,
        type: clickEvent.type,
        timeStamp: new Date().getTime(), //replacing timestamp because it has a wierd format, also differentiating from timestamp in background.js
        baseUrl: clickEvent.srcElement.baseURI,
        scriptSource: "content-script"
    }

    writeToFirebase(clickedElement)
}

//registers events listeners on all elements of the DOM tree
//filtering click events at the moment
Object.keys(window).forEach(key => {
    if (/^on/.test(key)) {
        window.addEventListener(key.slice(2), event => {

            switch (event.type) {
                case "click":
                    handleClickEvent(event)
                    break
                default:
                    //empty
            }
        });
    }
}); 