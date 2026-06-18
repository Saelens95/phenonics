let selectedElementNumber = null;
let isEditing = false;
let currentMode = "home";
let hideTimeout = null;
let currentElement = null;
let currentTier = null;

let activeSubject = null;
let activeGameMode = null;
let currentGameType = null;
let activeOverlay = null;
let activeOverlayType = null;
let activeGroups = new Set();
let hideBankNumbers = false;


// GAME MODE STATE
let gameMode = false;
let gameElements = [];
let placedElements = {};
let gameFinished = false;
let timerInterval = null;
let timeRemaining = 180;
let gameStarted = false;
let currentStreak = 0;
let modeLock = null;

let currentLives = 3;
let currentLevel = 1;
let currentLevelSize = 0;
let timedBonuses = {};

let currentFlashcard = null;
let flashcardIndex = 0;
let flashcardScore = 0;

const originalColor = getThemeColor();



const MODE_TO_GROUP = {

    chemistry: "journey",

    table: "tools",
    lewis: "tools",
    elemental_fit_menu: "games",
    ef_patch_table: "games",
    ef_blank_table: "games",
    ef_master_table: "games",
    table_timed: "games",
    matchmaker: "games"
};

const SUBJECT_ROUTES = {
    Chemistry: "chemistry"
};

const overlays = {
    colorGrid: false,
    electronegativity: false,
    ionization: false,
    radius: false
};

function renderPhenonicsHome() {
    const arena = document.getElementById('game-arena');

    arena.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'home-container';

    container.innerHTML = `
        <div class="ui-section phenonics-section">
            
            <div class="phenonics-header">
                
                <div class="phenonics-title">
                    PhENONICS
                </div>
                
                <div class="phenonics-subtitle ">
                     Learn the language of phenomena.
                </div>

                <div class="phenonics-divider"></div>
                
            </div>
            
            <div class="phenonics-dropdown-wrapper">
                
                <button class="phenonics-dropdown-btn" id="phen-dropdown-btn">
                    Pick a subject ▼
                </button>
                
                <div class="phenonics-dropdown-menu hidden" id="phen-dropdown-menu">
                
                    <div class="phenonics-subject active-subject" data-subject="chemistry">
                        🧪 Chemistry
                    </div>

                     <div class="phenonics-subject active-subject" data-subject="physics">
                        ⚛️ Physics
                    </div>

                     <div class="phenonics-subject active-subject" data-subject="mathematics">
                        ➗ Mathematics
                    </div>

                    <div class="phenonics-subject active-subject" data-subject="engineering">
                        ⚙️ Engineering
                    </div>
                </div>
            </div>
        </div>
    `;

    arena.appendChild(container);

    const dropdownBtn = document.getElementById("phen-dropdown-btn");
    const dropdownMenu = document.getElementById("phen-dropdown-menu");

    dropdownBtn.onclick = () => {
        dropdownMenu.classList.toggle("hidden");
    };

    document.querySelectorAll(".phenonics-subject")
        .forEach(card => {
            card.onclick = () => {
                const subject = card.dataset.subject;

                setMode(subject);
            };
        });
}

function getThemeColor() {
    return document.body.classList.contains("game-mode")
    ? "#fca5a5"
    : "#69FAAD";
}

function setMode(mode) {
    mode = String(mode).trim();
    cleanupTimedMode();
    currentMode = mode;

    if (modeLock === mode) return;
    modeLock = mode;

    if (mode !== "table") modeLock = null;


    document.querySelectorAll(".sidebar-group")
        .forEach(g => g.classList.remove("open"));

    document.querySelectorAll("#sidebar [data-mode].active").forEach(el => {
        el.classList.remove("active");
    });

   

    if (mode !== "table") {
        Object.keys(overlays).forEach(k => overlays[k] = false);
    }

    const panel = document.getElementById("sidebar-dynamic-panel");

    if (mode === "table") {
        renderTableTools();
    } else {
        panel.innerHTML = "";
    }

    const activeItems = document.querySelectorAll(
        `#sidebar [data-mode="${mode}"]`);

    activeItems.forEach(el => el.classList.add("active"));

    switch (mode) {

        case "home":
            currentSubject = null;
            activeSubject = null;
            resetSidebar();

            document.getElementById("home-nav-item")?.classList.add("active");

            document.getElementById("active-subject-container").innerHTML = "";
            document.getElementById("sidebar-dynamic-panel").innerHTML = "";

            document.getElementById('game-arena').innerHTML = '';
            document.getElementById('game-controls').innerHTML = '';

            document.body.classList.remove("game-mode");
            document.body.classList.remove("chemistry-active");

            renderPhenonicsHome();
            return;

        case "tools_menu":
            document.body.classList.remove("game-mode");
            renderToolsMenu(currentSubject);
            return;

        case "games_menu":
            document.body.classList.remove("game-mode");
            renderGamesMenu();
            return;

        case "journey":
            document.body.classList.remove("game-mode");
            renderChemJourney();
            openSidebarGroupForMode("journey");
            return;
        
        case "chemistry":
            document.body.classList.remove("game-mode");
            document.getElementById("active-subject-container").innerHTML = "";
            currentSubject = "Chemistry";
            activeSubject = "Chemistry";
            document.body.classList.add("chemistry-active");
            document.body.classList.add("subject-active");
            updateSidebarSubject("Chemistry");
            renderChemistrySidebar();
            renderChemistryMenu();
            
            return;

        case "table":
            currentGameType = null;
            gameElements = [];
            document.getElementById('game-arena').innerHTML = '';
            document.getElementById('game-controls').innerHTML = '';
            document.body.classList.remove("game-mode");
            modeLock = "table";

            openSidebarIfCollapsed();

            renderDefaultLayout();
            openSidebarGroupForMode("table");

            document
                .querySelector('.sidebar-group.chemistry')
                ?.classList.add("open");

            return;
        
        case "elemental_fit_menu":
            openElementalFitMenu();
            openSidebarGroupForMode("elemental_fit_menu");
            return;
        
        case "ef_patch_table":
            document.body.classList.add("game-mode");
            startPatchMode();
            return;

        case "ef_blank_table":
            document.body.classList.add("game-mode");
            startBlankMode();
            return;

        case "ef_master_table":
            document.body.classList.add("game-mode");
            startMasterMode();
            return;

        case "table_timed":
            document.body.classList.add("game-mode");
            startTimedMode();
            return;

        case "matchmaker":
            document.body.classList.remove("game-mode");
            renderMatchMaker();
            openSidebarGroupForMode("matchmaker");
            return;
            
        default:
            console.warn("Unknown mode", mode);
            return;
    }
}

function openSidebarGroupForMode(mode) {
    const groupName = MODE_TO_GROUP[mode];
    if (!groupName) return;

    document.querySelectorAll(".sidebar-group")
        .forEach(g => g.classList.remove("open"));

        document
            .querySelector(`[data-group="${groupName}"]`)
            ?.classList.add("open");
}

function updateSidebarSubject(subject) {
    const sidebar = document.getElementById("sidebar");

    const existing = document.getElementById("subject-nav-item");
    if (existing) existing.remove();

    const item = document.createElement("div");
    item.id = "subject-nav-item";
    item.className = "overlay-item subject-item active";
    item.dataset.persistent = "subject";


    item.innerHTML = `
        <span class="dot"></span>
        <span class="label">${subject}</span>
    `;

    item.onclick = () => {
        const mode = SUBJECT_ROUTES[subject];
        if (mode) setMode(mode);
    };

    const homeItem = document.getElementById("home-nav-item");
    homeItem.after(item);
}

function getGroup(atomicNumber) {
    for (const [group, numbers] of Object.entries(GROUPS)) {
        if (numbers.includes(atomicNumber)) {
            return group;
        }
    }
    return;
}

elements.forEach(el => {
    el.group = getGroup(el.number);
    el.radius = ATOMIC_RADIUS[el.number] ?? null;
    el.electronegativity = ELECTRONEGATIVITY[el.number] ?? null;
    el.ionization = IONIZATION[el.number] ?? null;
});

function getRadiusSize(value) {
    if (value == null) return 18;

    const min = 50;
    const max = 280;

    let normalized = (value - min) / (max - min);

    normalized = Math.max(0, Math.min(1, normalized));

    normalized = (Math.pow(normalized, 1.4) * 0.6) + (normalized * 0.4);

    const minSize = 15;
    const maxSize = 75;

    let size = minSize + normalized * (maxSize - minSize);

    const SAFE_LIMIT = 65;

    return Math.min(size, SAFE_LIMIT);

}

function getIonizationColor(value) {
    if (value == null) return "#ffffff";

    const min = 400;
    const max = 1800;

    const clamped = Math.max(min, Math.min(max, value));
    let normalized = (clamped - min) / (max - min);

    const steps = 8;
    normalized = Math.round(normalized * steps) / steps;

    const hue = 120 - (120 * normalized);

    return `hsl(${hue}, 70%, 60%)`;
}

function renderTableTools() {
    const panel = document.getElementById("sidebar-dynamic-panel");
    panel.innerHTML = "";

    const template = document.getElementById("table-tools-template");
    const clone = template.cloneNode(true);
    clone.style.display = "block";

    const menu = clone.querySelector(".table-tools-menu");

    panel.appendChild(clone);

    requestAnimationFrame(() => {
        menu.classList.add("visible");
    });
}

function openColorGridSubmenu() {
    const panel = document.getElementById("sidebar-dynamic-panel");
    closeColorGridSubmenu();

    const submenu = document.createElement("div");
    submenu.id = "group-submenu";
    submenu.className = "group-submenu";

    Object.keys(GROUP_COLORS).forEach(group => {
        const item = document.createElement("div");

        item.className = `
            overlay-item subgroup-item
            ${activeGroups.has(group) ? "active" : ""}
        `;

        item.innerHTML = `
            <span class="dot"></span>
            <span class="label">
                ${group
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, c => c.toUpperCase())
                }
            </span>
        `;

        item.onclick = () => toggleGroup(group);

        submenu.appendChild(item);
    });

    panel.appendChild(submenu);
}

function closeColorGridSubmenu() {
    document.getElementById("group-submenu")?.remove();
}

function toggleGroup(group) {
    if (activeGroups.has(group)) {
        activeGroups.delete(group);
    } else {
        activeGroups.add(group);
    }
    refreshGrid();
    openColorGridSubmenu();
}

function getElementStyle(el) {
    if (overlays.colorGrid) {
        return GROUP_COLORS[el.group] || "#69FAAD";
    }
    return "#69FAAD";
}

function resetGroups() {
    activeGroups.clear();

    buildPeriodicTable(document.getElementById("game-arena"));

    openColorGridSubmenu();
}

function resetSidebar() {
    const sidebar = document.getElementById("sidebar");

    sidebar.querySelectorAll(".active").forEach(el => el.classList.remove("active"));
    sidebar.querySelectorAll(".open").forEach(el => el.classList.remove("open"));

    document.getElementById("active-subject-container").innerHTML = "";

    sidebar.querySelectorAll(".chemistry-inserted").forEach(el => el.remove());
    sidebar.querySelectorAll("#subject-nav-item").forEach(el => el.remove());

    document.body.classList.remove("chemistry-active");
    document.querySelectorAll(".chemistry-inserted").forEach(el => el.remove());

}

function goHome() {
    currentSubject = null;

    const subjectItem = document.getElementById("subject-nav-item");
    if (subjectItem) subjectItem.remove();

    const chemBlock = document.querySelector(".chemistry-sidebar-block");
    if (chemBlock) chemBlock.remove();

    setMode("home");
}

function renderChemistryMenu() {
    const arena = document.getElementById('game-arena');
    arena.innerHTML = '';

    const container = document.createElement('div');
    container.className = "home-container";

    container.innerHTML = `
        <div class="subject-hub">

            <div class="section-title subject-header">${currentSubject}</div>

            <div class="phenonics-divider subject-divider"></div>

            <div class="subject-panel">

                <div class="subject-hub-row">

                    <div class="subject-node" id="journey-node">
                        <div class="subject-circle">🧠</div>

                        <div class="subject-label">
                            Journey
                        </div>

                        <div class="phenonics-divider category-divider"></div>


                        <div class="subject-description">
                            Learn the language of chemistry!
                        </div>
                    </div>

                    <div class="subject-node" id="tools-node">
                        <div class="subject-circle">⚛️</div>

                        <div class="subject-label">
                            Tools
                        </div>

                        <div class="phenonics-divider category-divider"></div>


                        <div class="subject-description">
                            Explore interactive tools such as the Periodic Table!
                        </div>
                    </div>

                    <div class="subject-node" id="games-node">
                        <div class="subject-circle">🎮</div>

                        <div class="subject-label">
                            Games
                        </div>

                        <div class="phenonics-divider category-divider"></div>


                        <div class="subject-description">
                            Games that help build your knowledge of chemistry!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    arena.appendChild(container);

    // JOURNEY
    document.getElementById("journey-node").onclick = () => {
        setMode("journey");
    };

    // TOOLS
    document.getElementById("tools-node").onclick = () => {
        setMode("tools_menu");
    };

    // GAMES
    document.getElementById("games-node").onclick = () => {
        setMode("games_menu");
    };

}

function renderToolsMenu() {

    const arena = document.getElementById("game-arena");

    arena.innerHTML = "";

    const container = document.createElement("div");

    container.className = "home-container";

    container.innerHTML = `
        <div class="subject-hub">

            <div class="section-title subject-header">
               ${currentSubject} Tools
            </div>

            <div class="phenonics-divider subject-divider"></div>

            <div class="subject-panel">

                <div class="subject-hub-row">

                    <div class="subject-node" id="pt-card">

                        <div class="subject-circle">⚛️</div>

                        <div class="subject-label tools-label">
                            Periodic Table of Elements
                        </div>

                        <div class="phenonics-divider category-divider"></div>

                        <div class="subject-description">
                            Explore the elements and their properties!
                        </div>
                    </div>
                </dov>
            </div>
        </div>
    `;


    arena.appendChild(container);

    document.getElementById("pt-card")
        .onclick = () => {
            setMode("table");
        };
}

function renderGamesMenu() {

    const arena = document.getElementById("game-arena");

    arena.innerHTML = "";

    const container = document.createElement("div");

    container.className = "home-container";

    container.innerHTML = `
        <div class="subject-hub">

            <div class="section-title subject-header">
                ${currentSubject} Games
            </div>

            <div class="phenonics-divider subject-divider"></div>

            <div class="subject-hub-row">

                <div class="subject-panel">

                    <div class="subject-node" id="table_chal_card">
                        <div class="subject-circle">⚛️</div>
                        <div class="subject-label game-label">
                            Elemental Fit
                        </div>

                        <div class="phenonics-divider category-divider"></div>

                        <div class="subject-description">
                            Fix and master the periodic table!
                        </div>
                    </div>
                </div>
            
                <div class="subject-panel">

                    <div class="subject-node" id="matchmaker-card">
                        <div class="subject-circle">🃏</div>
                        <div class="subject-label game-label">
                            MatchMaker
                        </div>

                        <div class="phenonics-divider category-divider"></div>

                        <div class="subject-description">
                            Match chemistry concepts. Strengthen recall.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    arena.appendChild(container);

    document.getElementById("table_chal_card").onclick = () => {
        setMode("elemental_fit_menu");
    };

    document.getElementById("matchmaker-card").onclick = () => {
        setMode("matchmaker");
    };
}




function renderChemistrySidebar() {
    const sidebar = document.getElementById("sidebar");

    const oldBlock = sidebar.querySelector(".chemistry-inserted");
    if (oldBlock) oldBlock.remove();

    const template = document.getElementById("chemistry-sidebar-template");

    const block = template.querySelector(".chemistry-sidebar-block");

    const clone = block.cloneNode(true);
    clone.classList.add("chemistry-inserted");

    sidebar.appendChild(clone);
    
    attachSidebarHandlers();
    // attachSidebarDropdowns();
}

function attachSidebarHandlers() {
    const sidebar = document.getElementById("sidebar");

    if (sidebar._handlerAttached) return;
    sidebar._handlerAttached = true;

    sidebar.addEventListener("click", (e) => {

        const title = e.target.closest(".sidebar-title");
        if (title) {
            const group = title.closest(".sidebar-group");
            const mode = title.dataset.mode;

            if (group) {
                const isOpen = group.classList.contains("open");

                group.classList.toggle("open");

                if (!isOpen && mode) {
                    setMode(mode);
                }
            }

            return;
        }
    });
}

function renderChemJourney() {

    const arena = document.getElementById("game-arena");

    arena.innerHTML = "";

    const container = document.createElement("div");

    container.innerHTML = `

        <div class="journey-section-container">

            <div class="journey-header">

                <div class="journey-section-label">
                    Foundations
                </div>
            
                <div class="phenonics-subtitle foundations-subtitle">
                    Master chemistry step by step.
                </div>

                <div class="journey-divider"></div>
            
            </div>
        
            <div class="journey-grid">
        
                ${CHEM_JOURNEY.map(section => `
                    <div class="
                        journey-card
                        ${section.unlocked ? "unlocked" : "locked"}
                    "
                    data-id="${section.id}"
                    >
                    
                        ${
                            !section.unlocked
                            ? `
                                <div class="journey-lock">
                                    🔒
                                </div>
                            `
                            : ""
                        }
                        
                        <div class="journey-card-top">
                        
                            <div class="journey-title">
                                ${section.title}
                            </div>
                            
                            <div class="journey-count">
                                ${section.questions} Qs
                            </div>
                            
                        </div>
                        
                        <div class="journey-subtitle">
                            ${section.subtitle}
                        </div>
                        
                    </div>
                `).join("")}
            </div>
        </div>

 
    `;

    arena.appendChild(container);

    setupJourneyCards();
}

function setupJourneyCards() {
    document
        .querySelectorAll(".journey-card.unlocked")
        .forEach(card => {
            card.onclick = () => {

                const id = card.dataset.id;

                console.log("Selected:", id);

                startChemFlashcards(id);
            };
        });
}

function startChemFlashcards(tier) {

    currentTier = tier;
    const arena = document.getElementById("game-arena");

    arena.innerHTML = "";

    const questionPool = CHEM_QUESTIONS[tier];

    if (flashcardIndex >= questionPool.length) {
        
        showCompletionPopup(tier);
        return;
    }

    currentFlashcard = questionPool[flashcardIndex];

    const shuffledAnswers = [...currentFlashcard.answers]
        .sort(() => Math.random() - 0.5);

    const container = document.createElement("div");

    container.className = "flashcard-layout";

    container.innerHTML = `

        <div class="flashcard-score">
            ${flashcardScore} / ${questionPool.length} Correct
        </div>
        
        <div class="flashcard-question-card">
            <div class="flashcard-question">
                ${currentFlashcard.question}
            </div>
        </div>
        
        <div class="flashcard-answer-grid">
            ${shuffledAnswers.map(answer => `
                <div class="flashcard-answer" data-answer="${answer}">
                    ${answer}
                </div>
            `).join("")}
            
        </div>
    `;

    arena.appendChild(container);

    setupFlashcardAnswers(currentTier, questionPool);
}

function showCompletionPopup(tier) {
    const questionPool = CHEM_QUESTIONS[tier];
    const popup = document.createElement("div");

    popup.className = "correct-overlay visible";

    popup.innerHTML = `
        <div class="correct-popup-card">
            
            <div class="section-title correct-popup-title">
                Nice job!
            </div>
            
            <div class="phenonics-subtitle correct-popup-subtitle">
                You answered all ${questionPool.length} questions!
            </div>
            
            <button class="control-btn popup-btn" id="continue-btn">
                Continue
            </button>
            
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("continue-btn").onclick = () => {
        popup.remove();
        unlockNextTier(tier)
    };
}

function unlockNextTier(tier) {

    if (tier === "particles") {

        const atomsTier = CHEM_JOURNEY.find(
            section => section.id === "atoms"
        );

        if (atomsTier) {
            atomsTier.unlocked = true;
        }

        showUnlockPopup("Atoms");
    }

    if (tier === "atoms") {
        const moleculeTier = CHEM_JOURNEY.find(
            section => section.id === "molecules"
        );

        if (moleculeTier) {
            moleculeTier.unlocked = true;
        }

        showUnlockPopup("Molecules")
    }
}

function showUnlockPopup(nextTierName) {
    
    const popup = document.createElement("div");

    popup.className = "correct-overlay visible";

    popup.innerHTML = `
        <div class="correct-popup-card">
        
            <div class="section-title tier-unlocked-title">
                Tier Unlocked!
            </div>
            
            <div class="phenonics-subtitle tier-unlocked-subtitle">
                ${nextTierName}
            </div>
            
            <button class="control-btn popup-btn" id="unlock-ok-btn">
                Okay
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("unlock-ok-btn").onclick = () => {

        popup.remove();

        flashcardScore = 0;
        flashcardIndex = 0;

        renderChemJourney();
    };
}

function setupFlashcardAnswers(tier, questionPool) {
    
    document
        .querySelectorAll(".flashcard-answer")
        .forEach(card => {

            card.onclick = () => {

                const selected = card.dataset.answer;

                if (selected === currentFlashcard.correct) {
                    flashcardIndex++;
                    flashcardScore++;

                    card.classList.add("correct-answer");

                    showCorrectPopup(tier);

                    setTimeout(() => {
                        if (flashcardIndex >= questionPool.length) {
                            startChemFlashcards(tier);
                            return;
                        }

                        startChemFlashcards(tier);
                    }, 800);

                } else {

                    card.classList.add("wrong-answer");

                    showWrongPopup(tier);

                    setTimeout(() => {
                        card.classList.remove("wrong-answer");
                    }, 400);
                }

            };
        });
}

function showCorrectPopup(tier) {

    const popup = document.createElement("div");

    popup.className = "correct-overlay";

    popup.innerHTML = `
        <div class="correct-popup-card">
            
            <div class="section-title correct-popup-title">
                Correct!
            </div>
            
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add("visible");
    }, 10);

    setTimeout(() => {
        popup.classList.remove("visible");

        setTimeout(() => {
            popup.remove();
        }, 250);
    }, 700);
}

function showWrongPopup(tier) {
    const popup = document.createElement("div");

    popup.className = "wrong-overlay";

    popup.innerHTML = `
        <div class="wrong-popup-card">
            
            <div class="section-title wrong-popup-title">
                Not quite
            </div>
            
            <div class="phenonics-subtitle wrong-popup-subtitle">
                Try again!
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add("visible");
    }, 40);

    setTimeout(() => {
        popup.classList.remove("visible");

        setTimeout(() => {
            popup.remove();
        }, 250);
    }, 650);
}

function renderMatchMaker() {
    const arena = document.getElementById("game-arena");
    arena.innerHTML = "";

    const container = document.createElement("div");

    container.className = "home-container";

    container.innerHTML = `
        
        <div class="chemistry-sections">
        
            <div class="chem-section games">
                
                <div class="section-title matchmaker-title">
                    MatchMaker
                </div>
                
                <div class="phenonics-subtitle matchmaker-subtitle">
                    Train your chemsitry recall.
                </div>

                <div class="phenonics-divider"></div>
                
                <div class="home-card-container">
                
                    <div class="home-card" id="match-elements">
                    
                        <div class="home-icon">⚛️</div>
                        <div class="home-label">
                            Elements
                        </div>
                        
                    </div>
                    
                    <div class="home-card" id="math-molecules">
                    
                        <div class="home-icon">🧪</div>
                        <div class="home-label">
                            Molecules
                        </div>
                        
                    </div>
                    
                    <div class="home-card" id="math-equations">
                    
                        <div class="home-icon">⚗️</div>
                        <div class="home-label">
                            Equations
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    `;

    arena.appendChild(container);

}


function renderDefaultLayout() {
    const arena = document.getElementById('game-arena');
    const controls = document.getElementById('game-controls');

    arena.innerHTML = '';
    controls.innerHTML = '';

    buildPeriodicTable(arena);
}

function toggleOverlay(type) {
    if (currentMode !== "table") return;

    const isActive = overlays[type] === true;

    Object.keys(overlays).forEach(k => {
        overlays[k] = false;
    });

    if (!isActive) {
        overlays[type] = true;
    }


    document.querySelectorAll('[data-overlay]').forEach(btn => {
        btn.classList.remove("active");
    });

    if (overlays[type]) {
        document
        .querySelector(`[data-overlay="${type}"]`)
        ?.classList.add("active");

    }
    
    document.body.classList.toggle(
        "electronegativity-mode",
        overlays.electronegativity
    );

    document.body.classList.toggle(
        "ionization-mode",
        overlays.ionization
    );

    if (type === "colorGrid" && overlays.colorGrid) {
        openColorGridSubmenu();
    } else {
        closeColorGridSubmenu();
        activeGroups.clear();
    }

    refreshGrid();
}

function createElementSlot(el, targetSet = null) {
    const div = document.createElement('div');

    const isGame = !!targetSet;
    const isTarget = isGame && targetSet.has(el.number);

    if (isGame) {
        if (isTarget) {
            div.className = 'element';

            const bonus = timedBonuses?.[el.number];
            const hasBonus = currentMode === "table_timed" && bonus;

            console.log(
                el.symbol,
                bonus,
                hasBonus
            );

            if (hasBonus) {

                console.log(
                    "ADDING BONUS CLASS:",
                    el.symbol,
                    bonus
                );

                div.classList.add("timed-bonus");

                if (bonus === 5) div.classList.add("bonus-purple");
                if (bonus === 7) div.classList.add("bonus-gold");
            }

            if (
                currentGameType === "patch" ||
                currentGameType === "blank"
            ) {
                div.classList.add("patch-slot");
            }

            if (
                currentGameType === "patch" ||
                currentGameType === "blank" ||
                currentMode === "table_timed"
            ) {
                div.classList.add("question-slot");
                div.dataset.typable = "true";

                div.innerHTML = `
                    <div class="question-mark">?</div>
                    <input class="symbol-input hidden" maxlength="2" />
                `;
            }

            div.onmouseenter = ()=> {
                div.style.transform = "scale(1.5)";
            };

            div.onmouseleave = () => {
                div.style.transform = "scale(1)";
            };

            div.onclick = () => {

                if (div.classList.contains("typing")) return;

                const isTypable = div.dataset.typable === "true";
                const input = div.querySelector(".symbol-input");

                if (isTypable && input) {

                    div.classList.add("typing");
                    div.querySelector(".question-mark").style.display = "none";
                    input.classList.remove("hidden");
                    input.focus();

                    input.onkeydown = (e) => {
                        if (e.key === "Enter") {
                            input.blur();
                        }
                    };

                    input.onblur = () => {
                        const typed = input.value.trim();

                        if (typed === "") {
                            resetTypingSlot(div);
                            return;
                        }

                        if (typed.toLowerCase() === el.symbol.toLowerCase()) {
                            handleCorrectPlacement(div, el);
                            checkLevelCompletion();



                        } else {
                            currentStreak = 0;
                            loseLife();
                            div.classList.add("wrong-drop");

                            input.value = "";

                            setTimeout(() => {
                                div.classList.remove("wrong-drop");
                                input.focus();
                            }, 300);

                        }
                    };
                    
                }

                if (selectedElementNumber == null) {
                    return;
                }

                const chosenNumber = selectedElementNumber;
                
                if (chosenNumber === el.number) {
                    handleCorrectPlacement(div, el);
                    checkLevelCompletion();

                    if (!gameFinished && gameElements.every(el => placedElements[el.number])) {
                        gameFinished = true;
                        setTimeout(() => {
                            showFitCompletionPopup();

                            setTimeout(() => {
                                currentLevel++;

                                if (
                                    currentLevel % 5 === 0 &&
                                    currentLives < 5
                                ) {
                                    currentLives++;
                                }

                                startPatchLevel();
                            }, 1500);

                        }, 200);
                    }
                
                } else {
                    currentStreak = 0;
                    loseLife();

                    div.classList.add("wrong-drop");
                    setTimeout(() => {
                        div.classList.remove("wrong-drop");
                    }, 300);

                    
                }
            };
        }
    } else {
        div.className = overlays.radius ? 'element radius-mode' : 'element';

        
        if (overlays.radius) {
            const size = getRadiusSize(el.radius);

            div.innerHTML = `
                <div class="radius-wrapper">
                    <div class="radius-circle" style="
                        width:${size}px;
                        height:${size}px;
                    "></div>
                </div>
                <div class="symbol-overlay">${el.symbol}</div>
            `;

        } else {
            div.innerHTML = `
                <div class="number">${el.number}</div>
                <div class="symbol">${el.symbol}</div>
                <div class="mass">${el.mass}</div>
            `;
        

            div.style.borderColor = originalColor;
            div.style.boxShadow = `0 0 12px ${originalColor}`;
        }

        div.onmouseenter = (e) => {
            const groupColor = GROUP_COLORS[el.group] || originalColor;

            if (!overlays.radius) {
                div.style.borderColor = groupColor;
                div.style.boxShadow = `0 0 20px ${groupColor}`;
            }

            showHoloPopup(e, el);
        };

        div.onmouseleave = () => {

            if (!overlays.radius) {

                if (overlays.colorGrid) {
                    const groupColor = GROUP_COLORS[el.group] || originalColor;
                    div.style.borderColor = groupColor;
                    div.style.boxShadow = `0 0 20px ${groupColor}`;
                } else {
                    div.style.borderColor = originalColor;
                    div.style.boxShadow = `0 0 12px ${originalColor}`;
                }
            }

            hideHoloPopup();
        };
    }

    // Element Colors
    if (overlays.colorGrid && !overlays.radius) {

        if (
            !(currentMode === "table_timed" && timedBonuses?.[el.number]) 
        ) {
        
            const groupColor = GROUP_COLORS[el.group] || originalColor;
            const showAll = activeGroups.size === 0;
            const isActive = activeGroups.has(el.group);

            if (showAll || isActive) {
                div.style.borderColor = groupColor;
                div.style.boxShadow = `0 0 20px ${groupColor}`;
                div.style.opacity = "1";
            } else {

                div.style.opacity = "0.15";
                div.style.boxShadow = "none";
            }
        }
    }

    // Electronegativity
    if (overlays.electronegativity) {
        if (el.electronegativity == null) {
            div.style.background = "#ffffff";
            div.style.opacity = "0.4";
        } else {
            div.style.background = getEnergyColor(el.electronegativity);
        }

        div.style.color = "#fff"
    }

    if (overlays.ionization) {
        if (el.ionization == null) {
            div.style.background = "#ffffff";
            div.style.color = "#000";
        } else {
            div.style.background = getIonizationColor(el.ionization);
            div.style.color = "#000";
        }
    }
   
    return div;
}

function getEnergyColor(value) {
    if (value == null) return "#ffffff";

    const min = 0.7;
    const max = 4.0;

    const clamped = Math.max(min, Math.min(max, value));

    let normalized = (clamped - min) / (max - min);

    const steps = 8;
    normalized = Math.round(normalized * steps) / steps;

    const hue = 120 - (120 * normalized);

        return `hsl(${hue}, 75%, ${55 + (normalized * 5)}%)`;
    
    }


function renderTableCell(el, targetSet = null) {

   if (!targetSet || currentMode === "table") {
        return createElementSlot(el);
   }

    const isTarget = targetSet.has(el.number);

    if (currentGameType === "patch") {
        if (isTarget) {
            return createElementSlot(el, targetSet);
        }

        const filled = createElementDiv(el, true);

        filled.style.opacity = "0.81";
        filled.style.pointerEvents = "none";
        return filled;
    }

    if (currentGameType === "blank") {
        if (isTarget) {
            return createElementSlot(el, targetSet);
        }

        return createSpacer();
    }

    if (currentGameType === "master") {
        return createElementSlot(el, targetSet);
    }

    return createSpacer();
}

function renderTrendLines(container) {

    container.innerHTML = "";

    if (overlays.electronegativity) {

        container.innerHTML = `
            <div class="trend-line horizontal trend-right"></div>
            <div class="trend-line vertical trend-up"></div>
        `;
    }

    if (overlays.ionization) {

        container.innerHTML += `
            <div class="trend-line horizontal trend-right ion-color"></div>
            <div class="trend-line vertical trend-up ion-color"></div>
        `;
    }

    if (overlays.radius) {

        container.innerHTML += `
            <div class="trend-line horizontal trend-left radius-color"></div>
            <div class="trend-line vertical trend-down radius-color"></div>
        `;
    }
}


function createElementDiv(el, hideNumber = false) {
    const div = document.createElement('div');
    div.className = 'element';
    div.innerHTML = `
        ${
            !hideNumber
            ? `<div class="number">${el.number}</div>`
            : ""
        }

        <div class="symbol">${el.symbol}</div>

        ${
            !hideNumber
            ? `<div class="mass">${el.mass}</div>`
            : ""
        }
    `;

    const originalColor = "#69FAAD";
    div.style.borderColor = originalColor;
    div.style.boxShadow = `0 0 12px ${originalColor}`;

    div.onmouseenter = (e) => {
        const groupColor = GROUP_COLORS[el.group] || originalColor;
        div.style.borderColor = groupColor;
        div.style.boxShadow = `0 0 20px ${groupColor}, 0 0 40px ${groupColor}`;
        showHoloPopup(e, el);
    },
    div.onmouseleave = () => {
        if (colorGridEnabled) {
            const groupColor = GROUP_COLORS[el.group] || originalColor;
            div.style.borderColor = groupColor;
            div.style.boxShadow = `0 0 20px ${groupColor}, 0 0 40px ${groupColor}`;
        } else {
            div.style.borderColor = originalColor;
            div.style.boxShadow = `0 0 12px ${originalColor}`;
        }
        hideHoloPopup();
    };
    div.onclick = () => showCrystalModal(el);
    
    return div;
}

function createSpacer() {
    const div = document.createElement('div');
    div.className = 'spacer';
    return div;
}

// CREATE ELEMENTS
function createElements() {
    gameMode = false;
    const container = document.getElementById('grid-mode');
    buildPeriodicTable(container);
}

    
function hexToRgba(hex, alpha = 0.60) {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0,2), 16);
    const g = parseInt(clean.substring(2,4), 16);
    const b = parseInt(clean.substring(4,6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function showHoloPopup(e, el) {

    if (hideTimeout) clearTimeout(hideTimeout);

    const popup = document.getElementById('holo-popup');
    const groupColor = GROUP_COLORS[el.group] || "#69FAAD"
    const bgColor = hexToRgba(groupColor, 0.81);

    popup.innerHTML = `
        <div class="flex items-center gap-4 mb-3">
            <span
                class="text-7xl font-extrabold leading-none"
                style="color: #ffffff; text-shadow: 0 0 12px rgba(0,0,0, 0.8);"
                >
                ${el.symbol}
                </span>

            <div class="flex flex-col">

                <div
                    class="text-xl font-bold text-white"
                    style="text-shadow: 0 0 6px rgba(0,0,0,0.5)"
                >
                    ${el.number} — ${el.name}
                </div>

                ${
                    overlays.radius
                    ?`

                        <div
                            class="text-base font-semibold text-white mt-1"
                            style="text-shadow: 0 0 3px rgba(0,0,0,0.5);"
                        >
                            Period: ${el.period}
                        </div>

                        <div 
                            class="text-base font-semibold text-white mt-1"
                            style="text-shadow: 0 0 3px rgba(0,0,0,0.5);"

                        >
                            Atomic Radius: ${el.radius} pm
                        </div>
                    `
                    : `
                        <div
                            class="text-base font-semibold text-white mt-1"
                            style="text-shadow: 0 0 3px rgba(0,0,0,0.5);"
                        >
                            Mass: ${el.mass} u
                        </div>
                        
                        <div
                            class="text-base font-semibold text-white mt-1 capitalize"
                            style="text-shadow: 0 0 3px rgba(0,0,0,0.5);"
                        >
                            Group: ${el.group.replace(/_/g, " ")}
                         </div>
                    `
                }

            </div>
        </div>
        
        ${
            overlays.radius
            ?``
            :`
                <div
                    class="text-base font-medium leading-relaxed text-white"
                    style="text-shadow: 0 0 4px rgba(0,0,0,0.5)"
                >
                    ${el.notes}
                </div>

            `
        }
    `;


    popup.classList.remove('hidden');

    popup.style.display = "block";

    const popupRect = popup.getBoundingClientRect();

    let x = e.pageX + 100;
    let y = e.pageY - 170;

    const padding = 12;

    // Right Edge Check
    if (x + popupRect.width > window.innerWidth) {
        x = e.pageX - popupRect.width - 100;
    }

    // Left Edge Check
    if (x < padding) {
        x = padding;
    }

    // Bottom Edge Check
    if (y + popupRect.height > window.innerHeight) {
        y = window.innerHeight - popupRect.height - padding;
    }

    // Top Edge Check
    if (y < padding) {
        y = padding;
    }

    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    popup.style.visibility = "visible";

    // Style
    popup.style.background = bgColor;
    popup.style.border = `3px solid rgba(255,255,255,0.9)`;
    popup.style.boxShadow = `0 0 25px ${groupColor}`;

    // Keep Popup Visible While Hovering Over
    popup.onmouseenter = () => { if (hideTimeout) clearTimeout(hideTimeout); };
    popup.onmouseleave = hideHoloPopup;
}

function refreshGrid() {
    const container = document.getElementById('game-arena');
    if (!container) return;

    container.innerHTML = '';

    if (currentMode === "table") {
        const targetSet = new Set(gameElements.map(e => e.number));
        buildPeriodicTable(container, targetSet);
        return;
    }
}


function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");

    sidebar.classList.toggle("collapsed");

    if (sidebar.classList.contains("collapsed")) {
        content.style.transform = "translateX(0)";
        document.body.classList.remove("sidebar-open");
    } else {
        content.style.transform = "translateX(40px)";
        document.body.classList.add("sidebar-open");
    }
}

function openSidebarIfCollapsed () {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");

    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
        content.style.transform = "translateX(40px)";
        document.body.classList.add("sidebar-open");
    }

}

function toggleGameMode() {
    const body= document.body;

    if (gameMode) {
        resetGameMode();
        createElements();
        body.classList.remove("game-mode");
    } else { 
        console.log("starting game mode...");
        startGameMode();
        body.classList.add("game-mode");
    }
}

function resetGameMode() {
    gameMode = false;
    gameFinished = false;
    gameElements = [];
    placedElements = {};

    const container = document.getElementById('game-arena');
    container.innerHTML = '';

    tableContainer = null;
    bankContainer = null;
    controlsContainer = null;

    createElements();
}

function hideHoloPopup() {
    if (hideTimeout) clearTimeout(hideTimeout);

    hideTimeout = setTimeout(() => {
        const popup = document.getElementById('holo-popup');
        if (!popup) return;

        popup.classList.add('hidden');
        popup.style.display = "none";
    }, 0);
}

// ------------------------------------------------------------------------
window.onload =  function () {


    document.addEventListener('click', (e) => {
        const modeEl = e.target.closest('[data-mode]');
        if (modeEl) {
            console.log("mode:", modeEl.dataset.mode);
            setMode(modeEl.dataset.mode);
            return;
        }

        const overlayEl = e.target.closest('[data-overlay]');
        if (overlayEl) {
            console.log("overlay:", overlayEl.dataset.overlay);
            toggleOverlay(overlayEl.dataset.overlay);
            return;
        }
    });

    renderPhenonicsHome();
};