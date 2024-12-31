document.getElementById("start").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: startScript
        });
    });
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = false;
});

document.getElementById("stop").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: stopScript
        });
    });
    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
});

document.getElementById("download").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: downloadTranscript
        });
    });
});

function startScript() {
    // This function activates your answer automation code
    if (typeof start === "function") {
        start("mc");
    }
}

function stopScript() {
    // This function should stop your script from answering further questions
    if (typeof selfDestruct === "function") {
        selfDestruct();
    }
}

function downloadTranscript() {
    // This function should download the transcript
    if (typeof downloadTranscript === "function") {
        downloadTranscript("transcript.txt");
    }
}
