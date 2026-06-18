function openElementalFitMenu() {
    const arena = document.getElementById("game-arena");
    const controls = document.getElementById("game-controls");

    arena.innerHTML = "";
    controls.innerHTML = "";

    const container = document.createElement("div");
    container.className = "mode-select-container";

    container.innerHTML = `
    <div class="elemental-fit-layout">

        <div class="home-container">

            <div class="ui-section elemental-fit-section">
                
                <div class="section-title start-challenge-title">
                    Elemental Fit
                </div>

                <div class="section-title start-challenge-subtitle">
                    Choose your challenge.
                </div>

                <div class="phenonics-divider ef-divider"></div>


                <div class="home-card-container">

                    <div class="home-card" id="patch-context-mode">
                        <div class="home-icon">🧩</div>
                        <div class="home-label">Patch the Table</div>
                    </div>

                    <div class="home-card" id="timed-mode">
                        <div class="home-icon">⏱️</div>
                        <div class="home-label">Timed Trial</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

        arena.appendChild(container);

        document.getElementById("patch-context-mode").onclick = () => {
            openPatchModeMenu();
        };

        document.getElementById("timed-mode").onclick = () => {
            setMode("table_timed");
        }
}

function renderGameBoard() {
    const arena = document.getElementById('game-arena');
    arena.innerHTML = '';

    const gameLayout = document.createElement("div");
    gameLayout.className = "game-layout";
    arena.appendChild(gameLayout);

    const targetSet = new Set(gameElements.map(e => e.number));

    const isPatch = currentGameType === "patch";
    const isMaster = currentGameType === "master";

    buildPeriodicTable(
        gameLayout,
        targetSet,
        isPatch,
    );

    renderElementBank(gameLayout);
    // renderShuffleAndClearButtons(gameLayout, !isMaster);
}


function startGameMode(showContext = false) {
    currentStreak = 0;
    activeGameMode = showContext;

    gameMode = true;
    placedElements = {};
    gameFinished = false;

    currentPlacementMode = showContext;

    hideBankNumbers = 
        currentGameType === "patch" ||
        currentGameType === "blank";

    const pool = getLevelPool();
    gameElements = [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, getLevelSize());

    const arena = document.getElementById('game-arena');
    const controls = document.getElementById('game-controls');

    arena.innerHTML = '';
    controls.innerHTML = '';

    const targetSet = new Set(gameElements.map(e => e.number));

    const gameLayout = document.createElement("div");
    gameLayout.className = "game-layout";

    arena.appendChild(gameLayout);

    buildPeriodicTable(gameLayout, targetSet, showContext, true);
    renderElementBank(gameLayout);

    document.body.classList.add("game-mode");
}

function openPatchModeMenu() {

    const arena = document.getElementById("game-arena");
    const controls = document.getElementById("game-controls");

    arena.innerHTML = "";
    controls.innerHTML = "";

    const container = document.createElement("div");
    container.className = "mode-select-container";

    container.innerHTML = `
        <div class="elemental-fit-layout">
        
            <div class="home-container">
            
                <div class="ui-section elemental-fit-section">
                
                    <div class="section-title start-challenege-title">
                        Patch the Table!
                    </div>
                    
                    <div class="section-title start-challenge-subtitle">
                        Learn the elements level by level.
                    </div>
                    
                    <div class="phenonics-divider ef-divider"></div>
                    
                    <div class="home-card-container">
                    
                        <div class="home-card" id="show-grid-mode">
                            <div class="home-icon">🔲</div>
                            <div class="home-label">Gimme the Grid!</div>
                        </div>
                        
                        <div class="home-card" id="no-grid-mode">
                            <div class="home-icon">⬜</div>
                            <div class="home-label">Grid be Gone!</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    arena.appendChild(container);

    document.getElementById("show-grid-mode").onclick = () => {
        setMode("ef_patch_table");
    };

    document.getElementById("no-grid-mode").onclick = () => {
        setMode("ef_blank_table");
    };

    
}

function beginMasterGame() {
    currentStreak = 0;
    activeGameMode = true;
    placedElements = {};
    gameFinished = false;

    hideBankNumbers = true;

    gameElements = [...elements];

    for (let i = gameElements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [gameElements[i], gameElements[j]] = [gameElements[j], gameElements[i]];
    }

    const arena = document.getElementById('game-arena');
    const controls = document.getElementById('game-controls');

    arena.innerHTML = '';
    controls.innerHTML = '';

    const targetSet = new Set(gameElements.map(e => e.number));

    const gameLayout = document.createElement("div");
    gameLayout.className= "game-layout";

    arena.appendChild(gameLayout);

    buildPeriodicTable(gameLayout, targetSet, false, false);

    renderElementBank(gameLayout);
    // renderShuffleAndClearButtons(gameLayout, false) ;

    document.body.classList.add("game-mode");
}

function renderElementBank(container) {

    const divider = document.createElement("div");
    divider.className = "element-bank-divider";
    container.appendChild(divider);

    const wrapper = document.createElement("div");
    wrapper.className = "element-bank-wrapper";

    const controls = document.createElement("div");
    controls.className = "element-bank-controls";

    const shuffleBtn = document.createElement("button");
    shuffleBtn.classList.add("control-btn");
    shuffleBtn.innerText = "Shuffle";
    shuffleBtn.onclick = shuffleGameElements;

    const clearBtn = document.createElement("button");
    clearBtn.classList.add("control-btn");
    clearBtn.innerText = "Clear";
    clearBtn.onclick = clearBoard;

    if (currentGameType !== "master") {
        controls.appendChild(shuffleBtn);
    }

    controls.appendChild(clearBtn);

    if (currentGameType === "master") {
        wrapper.classList.add("collapsed");
    }

    const header = document.createElement("div");
    header.className = "element-bank-header";

    header.innerHTML = `
        <span>Element Bank</span>
        <span class="bank-toggle">▼</span>
    `;

    const bank = document.createElement('div');
    bank.className = 'element-bank flex flex-wrap justify-center gap-3';

    gameElements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element';
        div.dataset.number = el.number;

        div.innerHTML = `
            ${
                !hideBankNumbers
                ? `<div class="number">${el.number}</div>`
                : ""
            }
            <div class="symbol">${el.symbol}</div>
        `;

        div.onclick = () => {

            document
                .querySelectorAll(".element-bank .element")
                .forEach(el => el.classList.remove("selected"));
            div.classList.add("selected");

            selectedElementNumber = el.number;
        };

        bank.appendChild(div);
    });

    // container.appendChild(bank);

    header.onclick = () => {
        wrapper.classList.toggle("collapsed");
    };

    wrapper.appendChild(header);
    wrapper.appendChild(bank);
    wrapper.appendChild(controls)
    container.appendChild(wrapper);
}


function shuffleGameElements() {
    currentStreak = 0;

    if (Object.keys(placedElements).length > 0) {
        showShuffleWarningPopup();
        return;
    }

    const pool = getLevelPool();
    gameElements = [...pool]
        .sort(() => Math.random() - 0.5)
        .slice(0, getLevelSize());

    for (let i = gameElements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameElements[i], gameElements[j]] = [gameElements[j], gameElements[i]];
    }

    placedElements = {};
    gameFinished = false;

    const targetSet = new Set(gameElements.map(e => e.number));
    const arena = document.getElementById('game-arena');
    arena.innerHTML = '';

    const gameLayout = document.createElement("div");
    gameLayout.className = "game-layout";

    arena.appendChild(gameLayout);


    if (currentGameType === "patch") {
        buildPeriodicTable(gameLayout, targetSet, true, true);
    }

    if (currentGameType === "blank") {
        buildPeriodicTable(gameLayout, targetSet, false, false);
    }

    if (currentGameType === "master") {
        buildPeriodicTable(gameLayout, targetSet, false, false);
    }

    renderElementBank(arena);
}



function clearBoard() {
    currentStreak = 0;
    placedElements = {};
    gameFinished = false;
    renderGameBoard();
}


function showRestartButton() {
    const container = document.getElementById('grid-mode');

    const btn = document.createElement('button');
    btn.className = 'control-btn mt-6';
    btn.innerText = "Restart Game";

    btn.onclick = () => {
        resetGameMode();
        resetPatchProgress();
        startPatchLevel();
    };

    container.appendChild(btn)
}

// Elemental Fit Game Mode Intro Popups

function showGameIntroPopup(title, subtitle, buttonText = "Begin", onBegin = null) {
    const popup = document.createElement("div");

    popup.className = "correct-overlay visible";

    popup.innerHTML = `
        <div class="intro-popup-card">
            <div class="section-title ef-gamemode-title">
                ${title}
            </div>
            
            <div class="phenonics-subtitle ef-gamemode-subtitle">
                ${subtitle}
            </div>

            <button class="control-btn popup-btn" id="fit-popup-btn">
                ${buttonText}
            </button>

        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("fit-popup-btn").onclick = () => {

        popup.remove();
    
        if (onBegin) {
            onBegin();
        };
    };
}

function startPatchMode() {
    showGameIntroPopup(
        "Patch the Table: Gimme the Grid!",
        "Use what you know of the periodic table to fill in the missing elements.",
        "Start!",
        () => {
            currentGameType = "patch";
            startGameMode(true);
        }
    );
}

function startBlankMode() {
    showGameIntroPopup(
        "Patch the Table: Grid be Gone!",
        "The table is invisible. Fill in the elements that remain.",
        "Start!",
        () => {
            currentGameType = "blank";
            startGameMode(false);
        }
    );
}

function startMasterMode() {
    showGameIntroPopup(
        "Master the Table!",
        "Fill the ENTIRE table.",
        "Begin",
        () => {
            currentGameType = "master";
            beginMasterGame();
        }
    );
}

function startTimedMode() {
    showGameIntroPopup(
        "⏳ Timed Trial!",
        "Can you complete the table before time runs out?",
        "Start!",
        () => {
            showCountdownOverlay();
        }
    );
}

function resetTypingSlot(div) {
    const input = div.querySelector(".symbol-input");
    const questionMark = div.querySelector(".question-mark");
    div.classList.remove("typing");

    if (input) {
        input.value = "";
        input.classList.add("hidden");
    }

    if (questionMark) {
        questionMark.style.display = "block";
    }
    return;
}

function handleCorrectPlacement(div, el) {
    if (
        currentGameType === "patch" ||
        currentGameType === "blank" ||
        currentMode === "table_timed"
    ) {
        div.innerHTML = `
            <div class="symbol">${el.symbol}</div>
        `;
    }

    div.classList.remove("target-slot");
    div.classList.add("placed-correct");

    placedElements[el.number] = true;
    updatePlacedCounter();
    currentStreak++;

    if (currentMode === "table_timed") {
        const bonus = timedBonuses[el.number] || 0;
        timeRemaining += 1 + bonus;
        updateTimerDisplay();
    }

    const bankElement = document.querySelector(
        `.element-bank .element[data-number="${el.number}"]`
    );

    if (bankElement) {
        bankElement.remove();
    }

    if (currentStreak === 5) {
        showFitStreakPopup(
            "Nice!",
            "5 in a row!"
        );
    }

    if (currentStreak === 10) {
        showFitStreakPopup(
            "Excellent!",
            "10 streak!"
        );
    }

    if (currentStreak === 20) {
        showFitStreakPopup(
            "Wow!",
            "You are UNSTOPPABLE!"
        );
    }

    checkLevelCompletion();
}

function createScorePanel(totalElements) {
    const panel = document.createElement("div");

    panel.className = "score-panel";
    panel.innerHTML = `
        <div class="score-title">
            Elements Found
        </div>
        
        <div class="score-progress">

            <div
                class="score-progress-fill"
                id="score-progress-fill"
            ></div>

            <div
                class="score-progress-label"
                id="elements-placed-count"
            >
                0/${totalElements}
            </div>
        </div>
    `;

    return panel;
}

function updateScoreBar(current, total) {
    const fill = document.getElementById("score-progress-fill");

    if (!fill) return;

    const percent = (current / total) * 100;

    fill.style.width = `${percent}%`;

}

function createLivesPanel() {

    const panel = document.createElement("div");

    panel.className = "lives-panel";

    panel.innerHTML = `
        <div
            id="lives-display"
            class="lives-display"
        >
            Level ${currentLevel}  ${"♥".repeat(currentLives)}
        </div>
    `;

    return panel;
}

function animateLevelUp() {

    const display = document.getElementById("lives-display");

    if (!display) return;

    display.classList.remove("level-up-wiggle");

    void display.offsetWidth;

    display.classList.add("level-up-wiggle");
}


function getLevelSize() {
    return Math.min(6 + Math.floor((currentLevel - 1) / 2), 12);
}

function getLevelPool() {

    if (currentLevel <= 5) {
        return elements.slice(0,20);
    }

    if (currentLevel <= 10) {
        return elements.slice(0,36);
    }

    if (currentLevel < 15) {
        return elements.slice(0,54);
    }

    return elements;
}

function showLevelCompletePopup() {
    const popup = document.createElement("div");

    popup.className = 
        "correct-overlay visible";

    popup.innerHTML = `
        <div class="correct-popup-card">
        
            <div class="section-title patch-level-complete-title">
                Level Complete!
            </div>

            <div class="phenonics-subtitle continue-next-level-subtitle">
                Continue to Level ${currentLevel + 1} ?
            </div>
            
            <button
                class="control-btn popup-btn"
                id="next-level-btn"
            >
                Continue
            </button>
            
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById(
        "next-level-btn"
    ).onclick = () => {

        popup.remove();
        advanceLevel();
    };
}

function advanceLevel() {
    currentLevel++;
    gameFinished = false;
    placedElements = {};
    currentStreak = 0;

    startPatchLevel();

    setTimeout(() => {
        animateLevelUp();
    }, 50);
}

function startPatchLevel() {

    gameFinished = false;

    currentLevelSize = getLevelSize();

    const pool = getLevelPool();


    gameElements = [...pool]
        .sort(() => Math.random() - 0.5)
        .slice(0, currentLevelSize);

    placedElements = {};
    renderGameBoard();
    updateLivesDisplay();
}

function loseLife() {

    if (currentMode === "table_timed")
        return;

    currentLives--;

    updateLivesDisplay();

    if (currentLives <= 0) {
        gameOver();
    }
}



function updateLivesDisplay() {

    const display =
        document.getElementById("lives-display");

        if (!display) return;

        display.innerHTML = `
        Level ${currentLevel}  ${"♥".repeat(currentLives)}`;
}




// --------------------------


// STREAK Popup 

function showFitStreakPopup(title, subtitle) {
    const popup = document.createElement("div");
    popup.className = "correct-overlay visible";

    popup.innerHTML = `
        <div class="correct-popup-card">
            <div class="section-title">
                ${title}
            </div>
            <div class="phenonics-subtitle">
                ${subtitle}
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.remove("visible");
        setTimeout(() => popup.remove(), 250);
    }, 700);
}

function showShuffleWarningPopup() {
    const popup = document.createElement("div");
    popup.className = "wrong-overlay visible";

    popup.innerHTML = `
        <div class="wrong-popup-card">
            <div class="section-title wrong-popup-title">
                HOLD UP!
            </div>
            <div class="phenonics-subtitle">
                Clear the board first.
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.remove("visible");
        setTimeout(() => popup.remove(), 250);
    }, 800);
}

function checkLevelCompletion() {
    if (gameFinished) return;

    const total = gameElements.length;
    const placed = Object.keys(placedElements).length;

    if (placed >= total) {
        gameFinished = true;

        setTimeout(() => {
           showLevelCompletePopup();
        }, 200);
    }
}

function showFitCompletionPopup() {

    const popup = document.createElement("div");

    popup.className = "correct-overlay visible";

    popup.innerHTML = `
        <div class="correct-popup-card">
        
            <div class="section-title">
                Finished!
            </div>
            
            <div class="phenonics-subtitle">
                You restored the table.
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.remove("visible");

        setTimeout(() => {
            popup.remove();
        }, 250);
    }, 1400);
}

function updatePlacedCounter() {
    
    const counter = document.getElementById("elements-placed-count");

    if (!counter) return;

    const placed = Object.keys(placedElements).length;

    const total = gameElements.length;
    
    counter.innerText = `${placed}/${total}`;

    const fill =
        document.getElementById("score-progress-fill");

    if (fill) {
        fill.style.width =
        `${(placed / total) * 100}%`;
    }
}


function showCountdownOverlay() {
    const overlay = document.createElement("div");

    overlay.className = "countdown-overlay";

    document.body.appendChild(overlay);

    const sequence = ["3", "2", "1", "START"];

    let index = 0;

    function nextCount() {

        overlay.innerHTML = `
            <div class="countdown-number">
                ${sequence[index]}
            </div>
        `;

        index++;

        if (index < sequence.length) {

            setTimeout(nextCount, 800);

        } else {

            setTimeout(() => {
                overlay.remove();
                beginTimedGame();
            }, 700);
        }
    }

    nextCount();
}

function beginTimedGame() {
    clearInterval(timerInterval);
    gameStarted = true;
    currentMode = "table_timed";
    currentGameType = "master";
    timeRemaining = 180;

    timedBonuses = {};

    gameElements = [...elements];

    for (let i = gameElements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameElements[i], gameElements[j]] =
            [gameElements[j], gameElements[i]];
    }

    const shuffled = [...gameElements]
        .sort(() => Math.random() - 0.5);

    const bonus5 = shuffled.slice(0,6);
    const bonus7 = shuffled.slice(6,9);

    bonus5.forEach(el => {
        timedBonuses[el.number] = 5;
    });

    bonus7.forEach(el => {
        timedBonuses[el.number] = 7;
    });

    renderGameBoard();

    setTimeout(() => {
        updateTimerDisplay();
        updatePlacedCounter();
        startTimer();
    }, 50);
}

function startTimer() {
    
    clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(() => {

        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {

            clearInterval(timerInterval);
            gameFinished = true;
            showTimeUpPopup();
        }
    }, 1000);
}

function createTimerPanel() {
    
    const panel = document.createElement("div");

    panel.className = "timer-panel";
    panel.innerHTML = `
        <div
            id="timed-trial-clock"
            class="timer-value"
        >
            3:00
        </div>
    `;

    return panel;

}

function updateTimerDisplay() {

    const timer = document.getElementById("timed-trial-clock");

    if (!timer) return;

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    timer.innerText = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
}

function gameOver() {
    gameFinished = true;

    const placed = Object.keys(placedElements).length;
    const total = gameElements.length;

    const popup = document.createElement("div");

    popup.className = "wrong-overlay visible";

    popup.innerHTML = `
        <div class="wrong-popup-card">
        
            <div class="section-title wrong-popup-title">
                Level Failed
            </div>
            
            <div class="phenonics-subtitle wrong-popup-subtitle">
                You found ${placed} of ${total} elements.
            </div>


            <button class="control-btn popup-btn" id="retry-timed-btn">
                Try Again
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
        const fill = document.getElementById("gameover-progress-fill");

        if (fill) {
            fill.style.width = `${(placed / total) * 100}%`;
        }
    }, 500);

    document.getElementById("retry-timed-btn").onclick = () => {

        popup.remove();
        clearInterval(timerInterval);
        setMode("ef_patch_table");
        patchLives = 3;
        updateLivesDisplay();
    };
}



function showTimeUpPopup() {

    const popup = document.createElement("div");
    
    popup.className = "wrong-overlay visible";

    popup.innerHTML = `
        <div class="wrong-popup-card">

            <div class="section-title wrong-popup-title">
                Time's up!
            </div>

            <div class="phenonics-subtitle wrong-popup-subtitle">
                The table remains unconquered.
            </div>

            <button class="control-btn popup-btn" id="retry-timed-btn">
                Try Again
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("retry-timed-btn").onclick = () => {

        popup.remove();
        clearInterval(timerInterval);
        setMode("table_timed");
    };
}

function cleanupTimedMode() {
    clearInterval(timerInterval);

    timerInterval = null;

    gameStarted = false;
    gameFinished = true;
}