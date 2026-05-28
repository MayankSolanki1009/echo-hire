/**
 * EchoHire - Native Fetch REST Integration Engine
 * No SDK dependencies required. Bypasses CDN library loading issues.
 */

const GEMINI_API_KEY = "AIzaSyBt91jEBqEjbB2H6qITY0L44uN6PTDssRI";

// 2. LIVE SIMULATION CORE APPLICATION STATE
let interviewActive = false;
let currentQuestionIndex = 1;
const totalQuestions = 5;
let confidenceChartInstance = null;

const appState = {
    candidateName: "Aarav Kumar",
    targetedRole: "Not Selected",
    overallConfidence: 0,
    statusText: "Idle",
    perceptionText: "Awaiting your target role submission to initialize telemetry systems...",
    proTip: "Type any career track below (e.g., Frontend Developer, Data Scientist) to unlock the live workspace panel.",
    insights: {
        confidence: { score: "—" },
        clarity: { score: "—" },
        structure: { score: "—" },
        enthusiasm: { score: "—" }
    },
    chatHistory: [] // Stores conversation history for ongoing context
};

// 3. APPLICATION RUNTIME CONTAINER LIFECYCLE
document.addEventListener('DOMContentLoaded', () => {
    injectChatBubbleStyles();
    initUIElements();
    renderGaugeChart(appState.overallConfidence);
    attachEventListeners();
});

function getChatContainer() {
    return document.getElementById('chat-bubble-container') || 
           document.querySelector('.flex-1.overflow-y-auto') ||
           document.getElementById('main-chat-view'); 
}

// 4. BIND INTERACTION ATTRIBUTES TO BOTH BUTTONS AND KEY INPUTS
function attachEventListeners() {
    const startSendBtn = document.getElementById('send-message-btn') || document.querySelector('.bg-indigo-600.text-white') || document.querySelector('button');
    const inputField = document.getElementById('chat-input-field') || document.querySelector('input');

    if (startSendBtn) {
        startSendBtn.onclick = (e) => {
            e.preventDefault();
            handleActionCycle();
        };
    }

    if (inputField) {
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleActionCycle();
            }
        });
    }
}

// 5. INTERVIEW PIPELINE STATE MACHINE CONTROL MATRIX
async function handleActionCycle() {
    const inputField = document.getElementById('chat-input-field') || document.querySelector('input');
    if (!inputField) return;

    const rawInput = inputField.value.trim();
    if (!rawInput) return;

    inputField.value = '';

    // PHASE ONE: Setup track and call initial system welcome parameters
    if (!interviewActive) {
        appState.targetedRole = rawInput;
        interviewActive = true;
        
        const roleHeader = document.querySelector('.text-sm.font-medium.text-indigo-600') || document.querySelector('[role="status"]');
        if (roleHeader) roleHeader.textContent = appState.targetedRole;

        clearMainWorkspaceForChat();
        showTypingIndicator(true);
        
        const systemPrompt = `You are a strict, highly encouraging executive AI Mock Interviewer. The candidate is targeting a '${appState.targetedRole}' position. Greet them by name (${appState.candidateName}) and ask Question 1: An engaging, open-ended introductory technical concept question designed for this exact specialty. Return raw plain text lines only, do not wrap your output message inside markdown blocks.`;
        
        const initialAIQuestion = await fetchGeminiNative(systemPrompt);
        showTypingIndicator(false);
        
        appendChatBubble("ai", initialAIQuestion);
        
        appState.overallConfidence = 65;
        appState.statusText = "GOOD";
        appState.perceptionText = `Track initialized for ${appState.targetedRole.toUpperCase()}. Workspace mapping operational arrays.`;
        appState.proTip = "Structure your answer by explaining your choices and detailing structural project trade-offs.";
        
        syncDashboardUI();
        return;
    }

    // PHASE TWO: Process dynamic answer tracking loops
    appendChatBubble("user", rawInput);
    showTypingIndicator(true);

    const evaluationContextPrompt = `The candidate is responding to your last interview question for the role of ${appState.targetedRole}. 
    Candidate response string data: "${rawInput}"
    
    Execute exactly these two structural requirements in your output payload:
    1. Reply with a highly professional feedback paragraph grading their answer content, then immediately frame your NEXT technical follow-up interview question. Keep it brief.
    2. At the absolute end of your response text, attach this exact JSON block token mapping structure wrapped inside <metrics></metrics> tags containing scoring metrics ranging from 40 to 100 based on their answer quality parameters:
    <metrics>{"confidence": 80, "clarity": 75, "structure": 85, "enthusiasm": 90, "overall": 82, "status": "GOOD", "perception": "Maintained strong clarity values in technical reasoning pathways."}</metrics>`;

    const rawAIResult = await fetchGeminiNative(evaluationContextPrompt);
    showTypingIndicator(false);

    const metricsRegex = /<metrics>([\s\S]*?)<\/metrics>/;
    const match = rawAIResult.match(metricsRegex);
    let visibleText = rawAIResult.replace(metricsRegex, '').trim();

    if (match && match[1]) {
        try {
            const metricsData = JSON.parse(match[1].trim());
            
            appState.overallConfidence = metricsData.overall || 75;
            appState.statusText = (metricsData.status || "GOOD").toUpperCase();
            appState.perceptionText = metricsData.perception || "Maintained stable domain authority parameters.";
            
            appState.insights.confidence.score = `${metricsData.confidence}%`;
            appState.insights.clarity.score = `${metricsData.clarity}%`;
            appState.insights.structure.score = `${metricsData.structure}%`;
            appState.insights.enthusiasm.score = `${metricsData.enthusiasm}%`;
        } catch (e) {
            calculateHeuristicFallbackMetrics(rawInput);
        }
    } else {
        calculateHeuristicFallbackMetrics(rawInput);
    }

    appendChatBubble("ai", visibleText);
    
    if (currentQuestionIndex < totalQuestions) {
        currentQuestionIndex++;
        updateProgressIndicator();
    } else {
        appState.proTip = "Interview tracks finished! Session summary generated successfully.";
    }

    syncDashboardUI();
}

// 6. NATIVE HTTP FETCH REQUEST PIPELINE (No SDK needed)
async function fetchGeminiNative(promptText) {
    // Add raw prompt into chat state history mapping logs
    appState.chatHistory.push({
        role: "user",
        parts: [{ text: promptText }]
    });

    const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(endpointUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: appState.chatHistory
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || "Server response breakdown configuration.");
        }

        const data = await response.json();
        const outputText = data.candidates[0].content.parts[0].text;

        // Keep system tracking logs synchronized
        appState.chatHistory.push({
            role: "model",
            parts: [{ text: outputText }]
        });

        return outputText;

    } catch (err) {
        console.error("Downstream API Error: ", err);
        return `Connection Error: ${err.message || "Failed to transfer request package to Google Endpoint models."}`;
    }
}

// --- RENDERING ROUTINES AND INTERACTIVE PANEL UI MANIPULATORS ---

function clearMainWorkspaceForChat() {
    const centerDisplay = getChatContainer();
    if (centerDisplay) {
        centerDisplay.innerHTML = '';
    }
}

function initUIElements() {
    const inputField = document.getElementById('chat-input-field') || document.querySelector('input');
    if (inputField) {
        inputField.placeholder = "Specify target role or paste job description to begin...";
    }
    syncDashboardUI();
}

function syncDashboardUI() {
    const scoreNum = document.getElementById('score-number');
    const scoreStat = document.getElementById('score-status') || document.querySelector('.text-blue-600') || document.querySelector('.text-emerald-500');
    const perception = document.getElementById('perception-box-text');
    const tipText = document.getElementById('pro-tip-text');
    const inputField = document.getElementById('chat-input-field') || document.querySelector('input');

    if (scoreNum) scoreNum.textContent = appState.overallConfidence > 0 ? `${appState.overallConfidence}/100` : '-- /100';
    if (scoreStat) scoreStat.textContent = appState.statusText;
    if (perception) perception.textContent = appState.perceptionText;
    if (tipText) tipText.textContent = appState.proTip;

    if (inputField && interviewActive) {
        inputField.placeholder = "Type your contextual answer here...";
    }

    updateInsightRow('Confidence', appState.insights.confidence.score);
    updateInsightRow('Clarity', appState.insights.clarity.score);
    updateInsightRow('Structure', appState.insights.structure.score);
    updateInsightRow('Enthusiasm', appState.insights.enthusiasm.score);

    renderGaugeChart(appState.overallConfidence);
}

function updateInsightRow(labelName, calculatedValue) {
    const containerRows = document.querySelectorAll('.flex.items-center.justify-between.p-2') || document.querySelectorAll('.flex.items-center.justify-between');
    containerRows.forEach(row => {
        if (row.firstElementChild && row.firstElementChild.textContent.includes(labelName)) {
            let scoreSpan = row.querySelector('.text-sm.font-semibold') || row.lastElementChild;
            if (scoreSpan) {
                scoreSpan.className = "text-sm font-semibold text-emerald-500";
                scoreSpan.textContent = calculatedValue;
            }
        }
    });
}

function updateProgressIndicator() {
    const progressLabel = document.querySelector('.text-xs.font-semibold.text-slate-500');
    if (progressLabel) {
        progressLabel.textContent = `QUESTION ${currentQuestionIndex} OF ${totalQuestions}`;
    }
    const fillBar = document.querySelector('.h-full.bg-indigo-600.rounded-full') || document.querySelector('.w-full.bg-indigo-600');
    if (fillBar) {
        fillBar.style.width = `${(currentQuestionIndex / totalQuestions) * 100}%`;
    }
}

function appendChatBubble(sender, contentText) {
    const container = getChatContainer();
    if (!container) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const wrapper = document.createElement('div');
    
    if (sender === "user") {
        wrapper.className = "bubble-row user-bubble-alignment animate-fade-in";
        wrapper.innerHTML = `
            <div class="bubble-inner user-bubble-styling">
                <div class="bubble-metadata" style="color: #cbd5e1;">${timestamp} • You</div>
                <div>${contentText}</div>
            </div>
        `;
    } else {
        wrapper.className = "bubble-row ai-bubble-alignment animate-fade-in";
        wrapper.innerHTML = `
            <div class="bubble-avatar">🤖</div>
            <div class="bubble-inner ai-bubble-styling">
                <div class="bubble-metadata" style="color: #64748b;">AI Interviewer • ${timestamp}</div>
                <div>${contentText}</div>
            </div>
        `;
    }

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator(visible) {
    const container = getChatContainer();
    if (!container) return;

    const existing = document.getElementById('echo-typing-node');
    if (existing) existing.remove();

    if (visible) {
        const pulseRow = document.createElement('div');
        pulseRow.id = "echo-typing-node";
        pulseRow.className = "bubble-row ai-bubble-alignment animate-pulse";
        pulseRow.innerHTML = `
            <div class="bubble-avatar">🤖</div>
            <div class="bubble-inner ai-bubble-styling" style="font-style: italic; color: #64748b; font-size: 13px;">
                Gemini is processing parameters and evaluating analytics responses...
            </div>
        `;
        container.appendChild(pulseRow);
        container.scrollTop = container.scrollHeight;
    }
}

function calculateHeuristicFallbackMetrics(textStr) {
    const baseVal = Math.min(95, Math.max(50, 65 + Math.floor(textStr.length / 8)));
    appState.overallConfidence = baseVal;
    appState.statusText = baseVal > 75 ? "STRONG" : "AVERAGE";
}

function renderGaugeChart(scoreValue) {
    const canvas = document.getElementById('confidenceGauge');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const remainingValue = 100 - scoreValue;

    if (confidenceChartInstance) {
        confidenceChartInstance.destroy();
    }

    confidenceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [scoreValue, remainingValue],
                backgroundColor: ['#4f46e5', '#e2e8f0'],
                borderWidth: 0,
                borderRadius: [8, 0]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 180,
            rotation: -90,
            cutout: '82%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

function injectChatBubbleStyles() {
    if (document.getElementById('echo-injected-css')) return;
    const stylesheet = document.createElement('style');
    stylesheet.id = "echo-injected-css";
    stylesheet.innerHTML = `
        .bubble-row { display: flex; gap: 12px; margin-bottom: 16px; width: 100%; font-family: sans-serif; box-sizing: border-box; }
        .user-bubble-alignment { justify-content: flex-end; }
        .ai-bubble-alignment { justify-content: flex-start; }
        .bubble-avatar { background: #e0e7ff; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 9999px; font-size: 16px; flex-shrink: 0; border: 1px solid #c7d2fe; }
        .bubble-inner { max-w-xl; padding: 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
        .user-bubble-styling { background: #4f46e5; color: #ffffff; border-top-right-radius: 0px; }
        .ai-bubble-styling { background: #f8fafc; color: #1e293b; border: 1px solid #e2e8f0; border-top-left-radius: 0px; }
        .bubble-metadata { font-size: 11px; font-weight: 500; margin-bottom: 4px; }
        @keyframes echoFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: echoFade 0.25s ease-out forwards; }
    `;
    document.head.appendChild(stylesheet);
}