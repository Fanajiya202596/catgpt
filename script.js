"use strict";

/* =========================================================
   CATGPT - COMPLETE FRONTEND JAVASCRIPT
   Works with the current index.html
   ========================================================= */


/* =========================================================
   1. DATA
   ========================================================= */

const QUESTIONS = [
    {
        value: "mood",
        emoji: "😺",
        title: "Cat's Mood",
        description: "What mood does this cat seem to be in?"
    },
    {
        value: "thought",
        emoji: "💭",
        title: "What is the cat thinking?",
        description: "What might be going through its tiny brain?"
    },
    {
        value: "personality",
        emoji: "🧠",
        title: "Cat's Personality",
        description: "What kind of personality does this cat have?"
    },
    {
        value: "doing",
        emoji: "🐈",
        title: "What is the cat doing?",
        description: "What does the cat appear to be doing?"
    },
    {
        value: "want",
        emoji: "🍗",
        title: "What does the cat want?",
        description: "What might this cat be asking for?"
    },
    {
        value: "fun",
        emoji: "😹",
        title: "Fun Cat Analysis",
        description: "Give me a funny analysis of this cat."
    }
];


const LANGUAGES = [
    {
        value: "english",
        emoji: "🇬🇧",
        title: "English",
        description: "Normal English"
    },
    {
        value: "manglish",
        emoji: "🇮🇳",
        title: "Manglish",
        description: "Malayalam + English"
    }
];


const TALK_STYLES = [
    {
        value: "normal",
        emoji: "🤖",
        title: "Normal",
        description: "Clear and simple"
    },
    {
        value: "funny",
        emoji: "😂",
        title: "Funny",
        description: "Make it hilarious"
    },
    {
        value: "friendly",
        emoji: "😺",
        title: "Friendly",
        description: "Cute and friendly"
    },
    {
        value: "roast",
        emoji: "🔥",
        title: "Roast",
        description: "Roast the cat"
    }
];


/* =========================================================
   2. SAMPLE ANALYSIS DATA
   This is temporary frontend data.
   Later we can connect a real AI API.
   ========================================================= */

const ENGLISH_DATA = {

    mood: {
        emoji: "😐",
        name: "JUDGING",
        score: 87,
        text: "That face says you have disappointed this cat somehow."
    },

    thought: {
        text: "\"Why are you pointing that rectangle at me?\""
    },

    personality: {
        name: "PROFESSIONAL MENACE",
        text: "Looks innocent. Has probably already planned something against your curtains."
    },

    doing: {
        text: "Currently performing advanced cat activities: sitting, staring and judging humans."
    },

    want: {
        text: "Probably food. Or attention. Or food while receiving attention."
    },

    fun: {
        text: "This cat appears to have been promoted to CEO of the household without telling anyone."
    }
};


const MANGLISH_DATA = {

    mood: {
        emoji: "😐",
        name: "FULL JUDGING MODE",
        score: 87,
        text: "Ithu kandittu thonnunnathu cat ningale serious aayi judge cheyyunnund ennanu."
    },

    thought: {
        text: "\"Nee enthina aa rectangle ente nere pidichu nilkkunnathu?\""
    },

    personality: {
        name: "PROFESSIONAL MENACE",
        text: "Face innocent aanu... pakshe curtains-ne kurichu already entho plan undennu thonnunnu."
    },

    doing: {
        text: "Ippo cat serious aayi irikkunnu, nokkunnu, pinne human-ne judge cheyyunnu."
    },

    want: {
        text: "Most probably food venam. Allenkil attention. Maybe randum venam."
    },

    fun: {
        text: "Ee cat veetinte CEO position already eduthittundu. Ningalkku ariyillennu mathram."
    }
};


/* =========================================================
   3. STATE
   ========================================================= */

const state = {

    imageFile: null,
    imageUrl: null,

    soundFile: null,

    selectedQuestions: [
        "mood",
        "thought",
        "personality"
    ],

    language: "english",

    talkStyle: "funny",

    isAnalyzing: false
};


/* =========================================================
   4. HELPER FUNCTIONS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function pick(array) {
    return array[Math.floor(Math.random() * array.length)];
}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   5. ADD SELECTION CSS FROM JAVASCRIPT
   This makes the selected buttons visible even if the
   existing CSS expects radio buttons.
   ========================================================= */

function addSelectionStyles() {

    if ($("catgpt-js-styles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "catgpt-js-styles";

    style.textContent = `

        .option-card {
            cursor: pointer;
            position: relative;
            transition:
                transform 0.2s ease,
                background 0.2s ease,
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        .option-card:hover {
            transform: translateY(-2px);
        }

        .option-card.selected {
            background: var(--grad);
            border-color: transparent;
            color: #ffffff;
            box-shadow:
                0 8px 24px -6px rgba(236, 72, 153, 0.5);
            transform: translateY(-2px);
        }

        .option-card.selected .option-emoji {
            transform: scale(1.15);
        }

        .option-emoji {
            transition: transform 0.2s ease;
        }

        .question-check {
            margin-left: auto;
            font-weight: 900;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .option-card.selected .question-check {
            opacity: 1;
        }

        .sound-file-name {
            margin-top: 10px;
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .catgpt-empty-message {
            color: var(--text-muted);
            padding: 20px;
            text-align: center;
        }

    `;

    document.head.appendChild(style);
}


/* =========================================================
   6. CREATE OPTION BUTTON
   ========================================================= */

function createOptionCard(item, selected, type) {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "option-card";

    if (selected) {
        button.classList.add("selected");
    }

    button.dataset.value = item.value;
    button.dataset.type = type;

    button.innerHTML = `

        <span class="option-emoji">
            ${item.emoji}
        </span>

        <span class="option-content">

            <strong>
                ${escapeHTML(item.title)}
            </strong>

            <small>
                ${escapeHTML(item.description)}
            </small>

        </span>

        ${
            type === "question"
                ? `<span class="question-check">✓</span>`
                : ""
        }

    `;

    return button;
}


/* =========================================================
   7. QUESTION OPTIONS
   ========================================================= */

function renderQuestions() {

    const container = $("question-list");

    if (!container) {

        console.error(
            "CatGPT ERROR: #question-list was not found."
        );

        return;
    }

    container.innerHTML = "";

    QUESTIONS.forEach(question => {

        const selected =
            state.selectedQuestions.includes(question.value);

        const button = createOptionCard(
            question,
            selected,
            "question"
        );

        button.addEventListener("click", () => {

            toggleQuestion(question.value);

        });

        container.appendChild(button);

    });

    console.log(
        "CatGPT: Questions rendered:",
        QUESTIONS.length
    );
}


/* =========================================================
   8. TOGGLE QUESTION
   Multiple questions can be selected.
   ========================================================= */

function toggleQuestion(value) {

    if (state.selectedQuestions.includes(value)) {

        state.selectedQuestions =
            state.selectedQuestions.filter(
                question => question !== value
            );

    } else {

        state.selectedQuestions.push(value);

    }

    renderQuestions();

    console.log(
        "Selected questions:",
        state.selectedQuestions
    );
}


/* =========================================================
   9. LANGUAGE OPTIONS
   Only ONE language can be selected.
   ========================================================= */

function renderLanguages() {

    const container = $("language-list");

    if (!container) {

        console.error(
            "CatGPT ERROR: #language-list was not found."
        );

        return;
    }

    container.innerHTML = "";

    LANGUAGES.forEach(language => {

        const selected =
            state.language === language.value;

        const button = createOptionCard(
            language,
            selected,
            "language"
        );

        button.addEventListener("click", () => {

            state.language = language.value;

            renderLanguages();

        });

        container.appendChild(button);

    });

    console.log(
        "CatGPT: Languages rendered."
    );
}


/* =========================================================
   10. TALKING STYLE OPTIONS
   ========================================================= */

function renderTalkStyles() {

    const container = $("style-list");

    if (!container) {

        console.error(
            "CatGPT ERROR: #style-list was not found."
        );

        return;
    }

    container.innerHTML = "";

    TALK_STYLES.forEach(style => {

        const selected =
            state.talkStyle === style.value;

        const button = createOptionCard(
            style,
            selected,
            "style"
        );

        button.addEventListener("click", () => {

            state.talkStyle = style.value;

            renderTalkStyles();

        });

        container.appendChild(button);

    });

    console.log(
        "CatGPT: Talking styles rendered."
    );
}


/* =========================================================
   11. SOUND UPLOAD
   ========================================================= */

function setupSoundUpload() {

    const soundButton = $("choose-sound-btn");
    const soundInput = $("cat-sound-input");
    const soundStatus = $("sound-status");

    if (!soundButton || !soundInput) {

        console.warn(
            "CatGPT: Sound upload elements not found."
        );

        return;
    }

    soundButton.addEventListener("click", () => {

        soundInput.click();

    });


    soundInput.addEventListener("change", event => {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        state.soundFile = file;

        if (soundStatus) {

            soundStatus.textContent =
                `✓ Sound selected: ${file.name}`;

        }

        console.log(
            "CatGPT sound selected:",
            file.name
        );

    });
}


/* =========================================================
   12. IMAGE UPLOAD
   ========================================================= */

function setupImageUpload() {

    const uploadCard = $("upload-card");
    const choosePhotoButton = $("choose-photo-btn");
    const catInput = $("cat-input");

    const previewCard = $("preview-card");
    const catPreview = $("cat-preview");

    const changePhotoButton = $("change-photo-btn");
    const removePhotoButton = $("remove-photo-btn");

    const uploadError = $("upload-error");


    if (!catInput) {

        console.error(
            "CatGPT ERROR: #cat-input was not found."
        );

        return;
    }


    function openFilePicker(event) {

        if (
            event &&
            event.target &&
            (
                event.target.id === "choose-photo-btn"
            )
        ) {
            return;
        }

        catInput.click();
    }


    /* Upload card */

    if (uploadCard) {

        uploadCard.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        "#choose-photo-btn"
                    )
                ) {
                    return;
                }

                if (!state.imageFile) {
                    catInput.click();
                }

            }
        );


        uploadCard.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    catInput.click();

                }

            }
        );

    }


    /* Choose Photo button */

    if (choosePhotoButton) {

        choosePhotoButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                catInput.click();

            }
        );

    }


    /* File selected */

    catInput.addEventListener(
        "change",
        event => {

            const file = event.target.files[0];

            if (!file) {
                return;
            }

            handleImage(file);

        }
    );


    /* Change photo */

    if (changePhotoButton) {

        changePhotoButton.addEventListener(
            "click",
            () => {

                catInput.click();

            }
        );

    }


    /* Remove photo */

    if (removePhotoButton) {

        removePhotoButton.addEventListener(
            "click",
            () => {

                removeImage();

            }
        );

    }


    function handleImage(file) {

        if (!file.type.startsWith("image/")) {

            showUploadError(
                "Please choose an image file."
            );

            return;
        }


        if (file.size > 10 * 1024 * 1024) {

            showUploadError(
                "Please choose an image smaller than 10 MB."
            );

            return;
        }


        clearUploadError();


        state.imageFile = file;


        if (state.imageUrl) {

            URL.revokeObjectURL(
                state.imageUrl
            );

        }


        state.imageUrl =
            URL.createObjectURL(file);


        if (catPreview) {

            catPreview.src =
                state.imageUrl;

        }


        if (previewCard) {

            previewCard.hidden = false;

        }


        if (uploadCard) {

            uploadCard.hidden = true;

        }


        console.log(
            "CatGPT image selected:",
            file.name
        );

    }


    function removeImage() {

        state.imageFile = null;

        if (state.imageUrl) {

            URL.revokeObjectURL(
                state.imageUrl
            );

            state.imageUrl = null;

        }


        catInput.value = "";


        if (catPreview) {

            catPreview.removeAttribute(
                "src"
            );

        }


        if (previewCard) {

            previewCard.hidden = true;

        }


        if (uploadCard) {

            uploadCard.hidden = false;

        }

    }


    function showUploadError(message) {

        if (!uploadError) {
            return;
        }

        uploadError.textContent = message;

        uploadError.hidden = false;

    }


    function clearUploadError() {

        if (!uploadError) {
            return;
        }

        uploadError.textContent = "";

        uploadError.hidden = true;

    }

}


/* =========================================================
   13. LOADING
   ========================================================= */

let loadingInterval = null;
let loadingTimeout = null;


function showLoading() {

    const loading = $("loading");
    const message = $("loading-message");

    if (!loading) {
        return;
    }


    const messages = [
        "Scanning whiskers...",
        "Reading suspicious facial expressions...",
        "Analyzing tail position...",
        "Consulting the International Cat Council...",
        "Checking snack requirements...",
        "Interpreting the judgmental stare...",
        "Translating meow into human...",
        "Calculating cat attitude..."
    ];


    loading.hidden = false;


    let index = 0;


    if (message) {

        message.textContent =
            messages[index];

    }


    clearInterval(loadingInterval);


    loadingInterval = setInterval(() => {

        index =
            (index + 1) % messages.length;

        if (message) {

            message.textContent =
                messages[index];

        }

    }, 900);


    window.scrollTo({
        top: loading.offsetTop - 80,
        behavior: "smooth"
    });

}


/* =========================================================
   14. HIDE LOADING
   ========================================================= */

function hideLoading() {

    clearInterval(loadingInterval);

    loadingInterval = null;

    const loading = $("loading");

    if (loading) {
        loading.hidden = true;
    }

}


/* =========================================================
   15. GENERATE TEMPORARY ANALYSIS
   ========================================================= */

function generateDummyAnalysis() {

    const source =
        state.language === "manglish"
            ? MANGLISH_DATA
            : ENGLISH_DATA;


    const result = {};


    /*
       IMPORTANT:
       Only selected questions are added.
    */

    state.selectedQuestions.forEach(question => {

        if (source[question]) {

            result[question] =
                { ...source[question] };

        }

    });


    return result;

}


/* =========================================================
   16. APPLY TALKING STYLE
   ========================================================= */

function applyTalkStyle(text) {

    if (!text) {
        return "";
    }


    if (state.talkStyle === "normal") {

        return text;

    }


    if (state.talkStyle === "friendly") {

        return `${text} 😺`;

    }


    if (state.talkStyle === "funny") {

        return `${text} 😂`;

    }


    if (state.talkStyle === "roast") {

        return `${text} 🔥`;

    }


    return text;
}


/* =========================================================
   17. RENDER REPORT
   ========================================================= */

function renderReport(result) {

    const report = $("report");

    if (!report) {

        console.error(
            "CatGPT ERROR: #report was not found."
        );

        return;
    }


    /* -----------------------------------------
       Report subtitle
       ----------------------------------------- */

    const subtitle =
        $("report-subtitle");


    if (subtitle) {

        if (state.language === "manglish") {

            subtitle.textContent =
                "Analysis complete. Cat inte opinion ready aanu.";

        } else {

            subtitle.textContent =
                "Analysis complete. We have investigated the evidence.";

        }

    }


    /* -----------------------------------------
       Cat image
       ----------------------------------------- */

    const reportPhoto =
        $("report-photo");


    if (reportPhoto && state.imageUrl) {

        reportPhoto.src =
            state.imageUrl;

    }


    /* -----------------------------------------
       SUBJECT
       ----------------------------------------- */

    const subject =
        $("report-subject");


    if (subject) {

        subject.textContent =
            state.imageFile
                ? state.imageFile.name
                : "THE CAT";

    }


    /* -----------------------------------------
       MOOD
       ----------------------------------------- */

    const mood =
        result.mood;


    if (mood) {

        if ($("report-mood-emoji")) {

            $("report-mood-emoji").textContent =
                mood.emoji;

        }


        if ($("report-mood-name")) {

            $("report-mood-name").textContent =
                mood.name;

        }


        if ($("report-mood-bar")) {

            $("report-mood-bar").style.width =
                `${mood.score}%`;

        }


        if ($("report-mood-score")) {

            $("report-mood-score").textContent =
                `${mood.score}% visual confidence`;

        }


        if ($("report-mood-text")) {

            $("report-mood-text").textContent =
                applyTalkStyle(mood.text);

        }

    }


    /* -----------------------------------------
       PERSONALITY
       ----------------------------------------- */

    const personality =
        result.personality;


    if (personality) {

        if ($("report-personality")) {

            $("report-personality").textContent =
                personality.name;

        }


        if ($("report-personality-text")) {

            $("report-personality-text").textContent =
                applyTalkStyle(
                    personality.text
                );

        }

    }


    /* -----------------------------------------
       THOUGHT
       ----------------------------------------- */

    const thought =
        result.thought;


    if (thought) {

        if ($("report-thought")) {

            $("report-thought").textContent =
                applyTalkStyle(
                    thought.text
                );

        }

    }


    /* -----------------------------------------
       DOING
       ----------------------------------------- */

    const doing =
        result.doing;


    if (doing) {

        addExtraResultCard(
            "doing",
            "🐈 WHAT THE CAT IS DOING",
            applyTalkStyle(doing.text)
        );

    }


    /* -----------------------------------------
       WANT
       ----------------------------------------- */

    const want =
        result.want;


    if (want) {

        addExtraResultCard(
            "want",
            "🍗 WHAT THE CAT WANTS",
            applyTalkStyle(want.text)
        );

    }


    /* -----------------------------------------
       FUN
       ----------------------------------------- */

    const fun =
        result.fun;


    if (fun) {

        addExtraResultCard(
            "fun",
            "😹 FUN CAT ANALYSIS",
            applyTalkStyle(fun.text)
        );

    }


    /* -----------------------------------------
       Hide unselected report cards
       ----------------------------------------- */

    updateReportVisibility();


    /* -----------------------------------------
       Report visible
       ----------------------------------------- */

    report.hidden = false;


    window.scrollTo({
        top: report.offsetTop - 70,
        behavior: "smooth"
    });

}


/* =========================================================
   18. ADD EXTRA RESULT CARDS
   For "doing", "want", and "fun"
   ========================================================= */

function addExtraResultCard(
    key,
    title,
    text
) {

    const reportGrid =
        document.querySelector(
            ".report-grid"
        );


    if (!reportGrid) {
        return;
    }


    const existing =
        document.querySelector(
            `[data-extra-result="${key}"]`
        );


    if (existing) {

        const textElement =
            existing.querySelector(
                ".extra-result-text"
            );

        if (textElement) {

            textElement.textContent =
                text;

        }

        return;
    }


    const card =
        document.createElement("article");


    card.className =
        "report-card span-half";


    card.dataset.extraResult =
        key;


    card.innerHTML = `

        <p class="card-label">
            ${escapeHTML(title)}
        </p>

        <p
            class="card-text extra-result-text"
        >
            ${escapeHTML(text)}
        </p>

    `;


    /*
       Insert before the report actions.
    */

    const reportActions =
        reportGrid.querySelector(
            ".report-actions"
        );


    if (reportActions) {

        reportGrid.insertBefore(
            card,
            reportActions
        );

    } else {

        reportGrid.appendChild(card);

    }

}


/* =========================================================
   19. SHOW/HIDE REPORT CARDS
   Based on selected questions.
   ========================================================= */

function updateReportVisibility() {

    const selected =
        state.selectedQuestions;


    /* Mood */

    const moodCard =
        $("report-mood-emoji")
            ?.closest(".report-card");


    if (moodCard) {

        moodCard.hidden =
            !selected.includes("mood");

    }


    /* Personality */

    const personalityCard =
        $("report-personality")
            ?.closest(".report-card");


    if (personalityCard) {

        personalityCard.hidden =
            !selected.includes("personality");

    }


    /* Thought */

    const thoughtCard =
        $("report-thought")
            ?.closest(".report-card");


    if (thoughtCard) {

        thoughtCard.hidden =
            !selected.includes("thought");

    }


    /* Translation */

    const translationCard =
        $("report-translation")
            ?.closest(".report-card");


    if (translationCard) {

        translationCard.hidden =
            !selected.includes("thought");

    }


    /* Extra cards */

    document.querySelectorAll(
        "[data-extra-result]"
    ).forEach(card => {

        const key =
            card.dataset.extraResult;

        card.hidden =
            !selected.includes(key);

    });


    /*
       These older decorative cards are hidden
       because the user requested results based
       only on selected questions.
    */

    const compatibility =
        $("report-compat-score")
            ?.closest(".report-card");


    if (compatibility) {

        compatibility.hidden = true;

    }


    const threat =
        $("report-threat")
            ?.closest(".report-card");


    if (threat) {

        threat.hidden = true;

    }


    const action =
        $("report-action")
            ?.closest(".report-card");


    if (action) {

        action.hidden = true;

    }


    const roast =
        $("report-roast")
            ?.closest(".report-card");


    if (roast) {

        roast.hidden =
            !selected.includes("fun");

    }


    const status =
        $("report-status")
            ?.closest(".report-card");


    if (status) {

        status.hidden = true;

    }


    const stats =
        $("report-stats")
            ?.closest(".report-card");


    if (stats) {

        stats.hidden = true;

    }

}


/* =========================================================
   20. ASK CATGPT
   ========================================================= */

function analyzeCat() {

    if (state.isAnalyzing) {
        return;
    }


    /* Check image */

    if (!state.imageFile) {

        alert(
            "🐾 Please upload a cat photo first."
        );

        const upload =
            $("upload-wrap");

        if (upload) {

            upload.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

        return;
    }


    /* Check question */

    if (
        state.selectedQuestions.length === 0
    ) {

        alert(
            "🔍 Please choose at least one question."
        );

        const questionGroup =
            $("question-group");

        if (questionGroup) {

            questionGroup.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

        return;
    }


    state.isAnalyzing = true;


    const askButton =
        $("ask-catgpt-btn");


    if (askButton) {

        askButton.disabled = true;

        askButton.textContent =
            "ANALYZING... 🐾";

    }


    showLoading();


    /*
       Temporary demo delay.
       Later this will be replaced by
       the real AI API request.
    */

    clearTimeout(loadingTimeout);


    loadingTimeout = setTimeout(() => {

        const result =
            generateDummyAnalysis();


        hideLoading();

        renderReport(result);


        state.isAnalyzing = false;


        if (askButton) {

            askButton.disabled = false;

            askButton.textContent =
                "ASK CATGPT 🐾";

        }

    }, 2500);

}


/* =========================================================
   21. ANALYZE AGAIN
   ========================================================= */

function analyzeAgain() {

    const report =
        $("report");


    if (report) {

        report.hidden = true;

    }


    const analyze =
        $("analyze");


    if (analyze) {

        analyze.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   22. SURPRISE ME
   ========================================================= */

function surpriseMe() {

    /*
       Randomly select 1-3 questions.
    */

    const shuffled =
        [...QUESTIONS]
            .sort(() => Math.random() - 0.5);


    const count =
        Math.floor(
            Math.random() * 3
        ) + 1;


    state.selectedQuestions =
        shuffled
            .slice(0, count)
            .map(question => question.value);


    renderQuestions();


    /*
       Hide old report and go back to analysis.
    */

    const report =
        $("report");


    if (report) {

        report.hidden = true;

    }


    const questionGroup =
        $("question-group");


    if (questionGroup) {

        questionGroup.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    console.log(
        "Surprise questions:",
        state.selectedQuestions
    );

}


/* =========================================================
   23. MAIN INITIALIZATION
   ========================================================= */

function initializeCatGPT() {

    console.log(
        "🐾 CatGPT initialization started..."
    );


    /*
       Add JS selection styles.
    */

    addSelectionStyles();


    /*
       Render the three option sections.
    */

    renderQuestions();

    renderLanguages();

    renderTalkStyles();


    /*
       Setup upload systems.
    */

    setupImageUpload();

    setupSoundUpload();


    /*
       ASK CATGPT button.
    */

    const askButton =
        $("ask-catgpt-btn");


    if (askButton) {

        askButton.addEventListener(
            "click",
            analyzeCat
        );

    } else {

        console.error(
            "CatGPT ERROR: #ask-catgpt-btn not found."
        );

    }


    /*
       Analyze Again.
    */

    const againButton =
        $("again-btn");


    if (againButton) {

        againButton.addEventListener(
            "click",
            analyzeAgain
        );

    }


    /*
       Surprise Me.
    */

    const surpriseButton =
        $("surprise-btn");


    if (surpriseButton) {

        surpriseButton.addEventListener(
            "click",
            surpriseMe
        );

    }


    console.log(
        "🐾 CatGPT initialized successfully!"
    );

}


/* =========================================================
   24. START AFTER HTML LOADS
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCatGPT
    );

} else {

    initializeCatGPT();

}