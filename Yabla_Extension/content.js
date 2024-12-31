let mclimit, fitblimit, punctuation;
let isAnswering = false; // Track answering state
let minDelay = 1500; 
let maxDelay = 3000; 
let chanceIncorrect = 5; //out of 100

(function () {
    if (
        location.pathname !== "/multiple_choice.php" &&
        location.pathname !== "/fill_in_the_blank.php" &&
        location.pathname !== "/player_cdn.php"
    )
        return;

    // Function to initialize popup with Start and Stop buttons
    function initializePopup() {
        const popup = document.createElement("div");
        popup.id = "answer-popup";
        popup.style.position = "fixed";
        popup.style.top = "10px";
        popup.style.right = "1250px";
        popup.style.backgroundColor = "#fff";
        popup.style.border = "1px solid #ddd";
        popup.style.padding = "10px";
        popup.style.zIndex = 1000;
    
        const startButton = document.createElement("button");
        startButton.innerText = "S";
        startButton.onclick = () => {
            if (!isAnswering) {
                isAnswering = true;
                isRunninglabel.innerText = "Running";
                isRunninglabel.style.color = "#06402B";
                const type = location.pathname === "/multiple_choice.php" ? "mc" : "fitb";
                start(type, minDelay, maxDelay);

            }
        };
    
        const stopButton = document.createElement("button");
        stopButton.innerText = "E";
        stopButton.onclick = () => {
            isAnswering = false;
            isRunninglabel.innerText = "Not Running";
            isRunninglabel.style.color = "#FF0000";
        };
    
        const delayInputContainer = document.createElement("div");
        delayInputContainer.style.marginTop = "10px";
    
        const minDelayLabel = document.createElement("label");
        minDelayLabel.innerText = "Min Delay (ms): ";
        const minDelayInput = document.createElement("input");
        minDelayInput.type = "number";
        minDelayInput.value = minDelay;
        minDelayInput.style.width = "60px";
        minDelayInput.onchange = (e) => {
            minDelay = parseInt(e.target.value, 10) || 500;
        };
    
        const maxDelayLabel = document.createElement("label");
        maxDelayLabel.innerText = "Max Delay (ms): ";
        const maxDelayInput = document.createElement("input");
        maxDelayInput.type = "number";
        maxDelayInput.value = maxDelay;
        maxDelayInput.style.width = "60px";
        maxDelayInput.onchange = (e) => {
            maxDelay = parseInt(e.target.value, 10) || 2000;
        };
        const isRunninglabel = document.createElement("label");
        isRunninglabel.style.marginLeft = "5px";
        isRunninglabel.innerText = "Not Running";
        isRunninglabel.style.color = "#FF0000";

        delayInputContainer.appendChild(minDelayLabel);
        delayInputContainer.appendChild(minDelayInput);
        delayInputContainer.appendChild(document.createElement("br"));
        delayInputContainer.appendChild(maxDelayLabel);
        delayInputContainer.appendChild(maxDelayInput);
    
        popup.appendChild(startButton);
        popup.appendChild(stopButton);
        popup.appendChild(isRunninglabel);
        popup.appendChild(delayInputContainer);
    

        const chanceIncorrectContainer = document.createElement("div");
        chanceIncorrectContainer.style.marginTop = "10px";
        chanceIncorrectContainer.style.display = "flex";
        chanceIncorrectContainer.style.alignItems = "center"; 
        chanceIncorrectContainer.style.gap = "5px"; 
        
        const chanceIncorrectLabel = document.createElement("label");
        chanceIncorrectLabel.innerText = "Fail Chance(%): ";
        
        const chanceIncorrectInput = document.createElement("input");
        chanceIncorrectInput.type = "number";
        chanceIncorrectInput.value = chanceIncorrect;
        chanceIncorrectInput.style.width = "60px";
        chanceIncorrectInput.onchange = (e) => {
            chanceIncorrect = parseInt(e.target.value, 10) || 5;
        };
        
        chanceIncorrectContainer.appendChild(chanceIncorrectLabel);
        chanceIncorrectContainer.appendChild(chanceIncorrectInput);
        popup.appendChild(chanceIncorrectContainer);
        
        document.body.appendChild(popup);
    }
    

    // Start function with delay
    function start(type, minDelay, maxDelay) {
        var delay = Math.random() * (maxDelay - minDelay) + minDelay; // Calculate random delay
    
        setTimeout(() => {
            if (isAnswering) continueAnswering(type);
        }, delay);
    }
    
    function continueAnswering(type) {
        if (!isAnswering) return; // Stop answering if stopped

        answerQuestion(type);
        setTimeout(() => {
            const totalPoints = document.getElementsByClassName("total_points")[0];
            const scoreHistory = document.getElementsByClassName("score_history_link")[0];
            
            const noMoreQuestions = document.querySelector('.play_again') === null && 
                                  document.querySelector('.quitgame') !== null;

            if (noMoreQuestions) {
                const quitButton = document.getElementsByClassName("quitgame")[0];
                if (quitButton) quitButton.click();
                return;
            }

            if (scoreHistory && totalPoints.innerText !== "") {
                const allTimePoints = parseInt(scoreHistory.innerText.split(" ")[0]);
                if ((type === "mc" && allTimePoints >= (mclimit ? mclimit : 100)) ||
                    (type === "fitb" && allTimePoints >= (fitblimit ? fitblimit : 300))) {
                    document.getElementsByClassName("quitgame")[0].click();
                    return;
                }
            }

            if (totalPoints.innerText !== "") {
                const playAgain = document.getElementsByClassName("play_again")[0];
                if (playAgain) {
                    playAgain.click();
                    totalPoints.innerText = "";
                    setTimeout(() => continueAnswering(type), 2000);
                }
                return;
            }
            continueAnswering(type);
        }, Math.random() * (maxDelay - minDelay) + minDelay);
    }

    document.addEventListener("keydown", (e) => {
        if (
            e.key === "x" &&
            e.metaKey &&
            e.ctrlKey &&
            (location.pathname === "/multiple_choice.php" ||
                location.pathname === "/fill_in_the_blank.php" ||
                location.pathname === "/player_cdn.php")
        ) {
            downloadTranscript(
                `${location.host.charAt(0).toUpperCase()}${location.host
                    .split(".")[0]
                    .slice(1)} - ${
                    location.pathname === "/player_cdn.php"
                        ? document.title.split(":")[3]
                        : document.title.split(" -- ")[1]
                } transcript.txt`
            );
        }
    });

    function generateTranscript() {
        const transcript_obj = Array.from(
            document.getElementsByTagName("script")
        )
            .map(
                (script) =>
                    script.innerText.includes("var captions") &&
                    JSON.parse(
                        script.innerText
                            .split("\t")[3]
                            .split("var captions = $.extend(")
                            .join("")
                            .split(", PlayerCommon.Mixins.Captions),\n")
                            .join("")
                            .replace(/(\r\n|\n|\r)/gm, "")
                    )
            )
            .filter((item) => item)[0];

        return location.pathname === "/player_cdn.php"
            ? punctuation
                ? CAPTIONS.map((item) => item.transcript).join(" ")
                : CAPTIONS.map((item) =>
                      item.transcript_words.map(({ word }) => word)
                  )
                      .map((arr) => arr.join(" "))
                      .join(" ")
            : punctuation
            ? transcript_obj.map((item) => item.transcript).join(" ")
            : transcript_obj
                  .map((item) => item.transcript_words.map(({ word }) => word))
                  .map((arr) => arr.join(" "))
                  .join(" ");
    }

    function answerQuestion(type) {
        const transcript = generateTranscript();

        let words = document.getElementsByClassName("question")[0].children;
        let options = document.getElementsByClassName("choice_buttons")[0].children;

        let blankIndex, correctAnswer, correctAnswerIndex;

        for (let i = 0; i < words.length; i++)
            if (words[i].classList.contains("underline")) blankIndex = i;

        if (blankIndex === 0) {
            let wordsAfterBlank = "";

            for (let i = 1; i < words.length; i++)
                wordsAfterBlank += `${words[i].innerText} `;

            type === "mc"
                ? Array.from(options).forEach((option, i) => {
                      if (transcript.includes(
                          `${option.innerText} ${wordsAfterBlank}`
                      )) correctAnswerIndex = i;
                  })
                : (correctAnswer = transcript.match(
                      new RegExp(
                          "(\\p{L}+)(?=\\s" + wordsAfterBlank.trim() + "\\b)",
                          "gui"
                      )
                  )[0]);
        } else {
            let wordsBeforeBlank = "";

            for (let i = 0; i < blankIndex; i++)
                wordsBeforeBlank += `${words[i].innerText} `;

            type === "mc"
                ? Array.from(options).forEach((option, i) => {
                      if (transcript.includes(
                          `${wordsBeforeBlank}${option.innerText}`
                      )) correctAnswerIndex = i;
                  })
                : (correctAnswer = transcript.match(
                      new RegExp(
                          "(?<=\\b" + wordsBeforeBlank.trim() + "\\s)(\\p{L}+)",
                          "gui"
                      )
                  )[0]);
        }

        if (type === "mc" && correctAnswerIndex !== undefined) {
            let chance = Math.random() * 100;
            if (chance > chanceIncorrect) {
                options[correctAnswerIndex].click();
            }else{
                options[Math.floor(Math.random() * options.length)].click();
            }
        }
        if (type === "fitb" && correctAnswer) {
            const totalPoints = document.getElementsByClassName("total_points")[0];
            const potentialAnswers = [
                "calle", "nosotros", "hola", "segunda", 
                "companero", "gusta", "comprar", "escuela"
            ];
        
            let chance = Math.random() * 100;
        
            if (chance > chanceIncorrect) {
                // If not failing, enter the correct answer
                setAnswerAndTriggerEvents(correctAnswer);
                document.getElementById("submit_answer").click();

                const nextButton = document.getElementsByClassName("next")[0];
                setTimeout(() => nextButton.click(), 500);
            } else {
                // If failing, attempt random answers 3 times
                let attempts = 0;
        
                const tryAnswers = () => {
                    if (attempts < 5) {
                        const randomAnswer = potentialAnswers[Math.floor(Math.random() * potentialAnswers.length)];
                        setAnswerAndTriggerEvents(randomAnswer);
        
                        document.getElementById("submit_answer").click();
                        attempts++;
        
                        setTimeout(tryAnswers, 1000); // Wait 1 second and retry
                    } else {
                        // After 3 attempts, click 'Next'
                        const nextButton = document.getElementsByClassName("next")[0];
                        if (nextButton) nextButton.click();
                    }
                };
        
                tryAnswers();
            }
        }
        
    }
    function setAnswerAndTriggerEvents(answer) {
        const inputField = document.getElementsByClassName("answer")[0];
        inputField.value = answer;
    
        // Trigger input and change events to finalize the value
        inputField.dispatchEvent(new Event("input", { bubbles: true }));
        inputField.dispatchEvent(new Event("change", { bubbles: true }));
    }
    function downloadTranscript(filename) {
        const blob = new Blob([generateTranscript()], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    let keyState = {};

    document.addEventListener("keydown", (e) => {
        keyState[e.key] = true; // Mark key as pressed
    
        if (keyState["q"] && keyState["w"]) {
            toggleState = !toggleState;
    
            if (toggleState) {
                initializePopup();
            } else {
                const popup = document.getElementById("answer-popup");
                if (popup) {
                    popup.style.top = "0px";
                    popup.style.right = "0px";
                }
            }
        }
    });
    
    document.addEventListener("keyup", (e) => {
        keyState[e.key] = false; // Mark key as released
    });
    

    initializePopup();
})();
