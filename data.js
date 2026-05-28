const liveInterviewTimeline = [{
        aiQuestion: "Excellent. Now, how do you handle state management in a large-scale application to prevent unnecessary re-renders?",
        mockUserResponse: "I primarily use Redux Toolkit or the Context API with useMemo. I structure slices cleanly and ensure components only select the exact piece of state they need.",
        metricsAfter: { confidence: 85, clarity: 90, structure: 80, enthusiasm: 88, status: "Excellent", perception: "Demonstrates strong architectural awareness. Communication is sharp, structured, and technically accurate." }
    },
    {
        aiQuestion: "Great. Tell me about a time you had a major conflict with a team member. How did you resolve it?",
        mockUserResponse: "We disagreed on using SQL vs NoSQL. Instead of arguing, I pulled benchmarking data for our specific use case, scheduled a 10-minute sync, and we objectively chose the best fit together.",
        metricsAfter: { confidence: 92, clarity: 88, structure: 95, enthusiasm: 90, status: "Outstanding", perception: "High emotional intelligence (EQ) detected. Exceptional behavioral framework alignment using the STAR method." }
    }
];

// Track the active live question step
let liveStep = 0;
// The data displaying on the right-hand panel
const interviewState = {
    candidate: {
        name: "Candidate Name"
    },
    liveAnalysis: {
        overallConfidence: 78,
        statusText: "Good",
        interviewerPerception: "You sound technically strong and enthusiastic. Keep structuring your answers a bit more for clarity.",
        keyInsights: {
            confidence: { status: "Good", trend: "up" },
            clarity: { status: "Average", trend: "neutral" },
            structure: { status: "Average", trend: "neutral" },
            enthusiasm: { status: "Good", trend: "up" }
        },
        proTip: "Take a moment, think, and answer with structure. You've got this!"
    },
    transcript: []
};
let confidenceChart;

function renderGaugeChart(scoreValue) {
    const ctx = document.getElementById('confidenceGauge').getContext('2d');

    // Balance the rest of the chart to complete the 100 points scale
    const remainingValue = 100 - scoreValue;

    if (confidenceChart) confidenceChart.destroy(); // Prevent memory leaks on update

    confidenceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [scoreValue, remainingValue],
                backgroundColor: ['#4f46e5', '#e2e8f0'], // Indigo color vs slate background
                borderWidth: 0,
                borderRadius: [10, 0]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 180, // Forces semi-circle structure
            rotation: -90, // Rotates chart to start from left side
            cutout: '85%', // Controls thickness of the ring
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

function updateUIElements() {
    // 1. Update Candidate Info Header & Sidebar
    document.getElementById('candidate-display-name').innerText = interviewState.candidate.name;

    // 2. Render Live Analysis Side-text
    document.getElementById('score-number').innerText = interviewState.liveAnalysis.overallConfidence;
    document.getElementById('score-status').innerText = interviewState.liveAnalysis.statusText;
    document.getElementById('perception-box-text').innerText = interviewState.liveAnalysis.interviewerPerception;
    document.getElementById('pro-tip-text').innerText = interviewState.liveAnalysis.proTip;

    // 3. Render the Key Insights Trends
    updateInsightRow('insight-confidence', interviewState.liveAnalysis.keyInsights.confidence);
    updateInsightRow('insight-clarity', interviewState.liveAnalysis.keyInsights.clarity);
    updateInsightRow('insight-structure', interviewState.liveAnalysis.keyInsights.structure);
    updateInsightRow('insight-enthusiasm', interviewState.liveAnalysis.keyInsights.enthusiasm);

    // 4. Render the Chat Bubbles dynamically
    const chatContainer = document.getElementById('chat-bubble-container');
    chatContainer.innerHTML = ''; // Reset container frame

    interviewState.transcript.forEach(msg => {
        const bubble = document.createElement('div');

        if (msg.sender === 'ai') {
            bubble.className = "flex gap-3 mb-4 items-start";
            bubble.innerHTML = `
        <div class="bg-indigo-100 p-2 rounded-full text-indigo-600 font-bold text-sm">🤖</div>
        <div>
          <div class="text-xs text-slate-400 font-medium mb-1">AI Interviewer • ${msg.time}</div>
          <div class="bg-indigo-50 text-slate-800 p-4 rounded-2xl rounded-tl-none max-w-xl text-sm border border-indigo-100 leading-relaxed">${msg.text}</div>
        </div>`;
        } else {
            bubble.className = "flex gap-3 mb-4 items-start justify-end text-right";
            bubble.innerHTML = `
        <div>
          <div class="text-xs text-slate-400 font-medium mb-1">${msg.time} • You</div>
          <div class="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-xl text-sm text-left leading-relaxed">${msg.text}</div>
        </div>`;
        }
        chatContainer.appendChild(bubble);
    });
}

function updateInsightRow(elementId, dataset) {
    const target = document.getElementById(elementId);
    const colorClass = dataset.status === "Good" ? "text-emerald-600" : "text-amber-500";
    const arrowSymbol = dataset.trend === "up" ? "↑" : "→";

    target.innerHTML = `<span class="${colorClass} font-semibold flex items-center gap-1">${arrowSymbol} ${dataset.status}</span>`;
}

function setupInteractionHandlers() {
    const sendBtn = document.getElementById('send-message-btn');
    const textInput = document.getElementById('chat-input-field');

    sendBtn.addEventListener('click', () => {
        const userText = textInput.value.trim();
        if (!userText) return;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // 1. Push user's answer
        interviewState.transcript.push({
            sender: "user",
            time: currentTime,
            text: userText
        });

        textInput.value = '';
        updateUIElements();

        // 2. INNOVATION: Simulate Live AI Analysis & Dynamic Score Shifting
        // We mock a variance in scores based on the answer length to simulate analysis
        setTimeout(() => {
            // Calculate dynamic score shifts
            const delta = userText.length > 40 ? 4 : -3;
            interviewState.liveAnalysis.overallConfidence = Math.min(100, Math.max(50, interviewState.liveAnalysis.overallConfidence + delta));

            // Update perception text based on content
            if (userText.length > 40) {
                interviewState.liveAnalysis.interviewerPerception = "Excellent depth in your last response. Technical maturity score increased.";
                interviewState.liveAnalysis.keyInsights.clarity.status = "Good";
            } else {
                interviewState.liveAnalysis.interviewerPerception = "Your last answer was slightly brief. Try expanding on your specific engineering trade-offs.";
                interviewState.liveAnalysis.keyInsights.clarity.status = "Needs Work";
            }

            // 3. Update the AI's follow-up question dynamically
            interviewState.transcript.push({
                sender: "ai",
                time: currentTime,
                text: "Got it. Based on that, how do you scale this architecture if simultaneous active user requests increase by 10x?"
            });

            // 4. Re-render everything instantly with smooth visual updates
            updateUIElements();
            renderGaugeChart(interviewState.liveAnalysis.overallConfidence);

            const container = document.getElementById('chat-bubble-container');
            container.scrollTop = container.scrollHeight;
        }, 1500); // 1.5 second "thinking" delay
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateUIElements();
    renderGaugeChart(interviewState.liveAnalysis.overallConfidence);
    setupInteractionHandlers();
});

function triggerLiveAIStep() {
    if (liveStep >= liveInterviewTimeline.length) {
        // Interview completed loop
        alert("🎉 Live Mock Interview Session Completed! Final reports compiled successfully.");
        return;
    }

    const currentData = liveInterviewTimeline[liveStep];
    const chatContainer = document.getElementById('chat-bubble-container');
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Show AI "Thinking/Typing" State
    const typingIndicator = document.createElement('div');
    typingIndicator.id = "ai-typing-indicator";
    typingIndicator.className = "flex gap-3 mb-4 items-start animate-pulse";
    typingIndicator.innerHTML = `
    <div class="bg-indigo-100 p-2 rounded-full text-indigo-600 font-bold text-sm">🤖</div>
    <div class="bg-slate-100 text-slate-500 p-3 rounded-2xl rounded-tl-none text-xs italic">AI Interviewer is analyzing and typing...</div>
  `;
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 2. AI speaks after a 2-second realistic delay
    setTimeout(() => {
        // Remove typing indicator
        const indicator = document.getElementById('ai-typing-indicator');
        if (indicator) indicator.remove();

        // Append actual AI Question
        const aiBubble = document.createElement('div');
        aiBubble.className = "flex gap-3 mb-4 items-start";
        aiBubble.innerHTML = `
      <div class="bg-indigo-100 p-2 rounded-full text-indigo-600 font-bold text-sm">🤖</div>
      <div>
        <div class="text-xs text-slate-400 font-medium mb-1">AI Interviewer • ${currentTime}</div>
        <div class="bg-indigo-50 text-slate-800 p-4 rounded-2xl rounded-tl-none max-w-xl text-sm border border-indigo-100 leading-relaxed">${currentData.aiQuestion}</div>
      </div>`;
        chatContainer.appendChild(aiBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Increment question tracker dots in the bottom right corner layout
        updateQuestionProgressDots(liveStep + 3); // Since image shows step 2 out of 5 initially

        // 3. Simulate Candidate responding after another short pause
        setTimeout(() => {
            const userBubble = document.createElement('div');
            userBubble.className = "flex gap-3 mb-4 items-start justify-end text-right";
            userBubble.innerHTML = `
        <div>
          <div class="text-xs text-slate-400 font-medium mb-1">${currentTime} • You</div>
          <div class="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-xl text-sm text-left leading-relaxed">${currentData.mockUserResponse}</div>
        </div>`;
            chatContainer.appendChild(userBubble);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // 4. Update Metrics based on this exchange
            updateLiveAnalysisDashboard(currentData.metricsAfter);

            // Move to next step array pointer
            liveStep++;

        }, 4000); // Time candidate takes to formulate response

    }, 2000);
}

// Helper to push new stats up to layout metrics view instantly
function updateLiveAnalysisDashboard(metrics) {
    // Update numbers and badges
    document.getElementById('score-number').innerText = metrics.confidence;
    document.getElementById('score-status').innerText = metrics.status;
    document.getElementById('perception-box-text').innerText = metrics.perception;

    // Redraw the chart circle with the updated confidence score instantly
    renderGaugeChart(metrics.confidence);

    // Update specific lists/trends if needed
    document.getElementById('insight-confidence').innerHTML = `<span class="text-emerald-600 font-semibold flex items-center gap-1">↑ Good</span>`;
    document.getElementById('insight-clarity').innerHTML = `<span class="text-emerald-600 font-semibold flex items-center gap-1">↑ Good</span>`;
}

// Helper to highlight the numeric tracking steps (1, 2, 3, 4, 5) at the bottom right
function updateQuestionProgressDots(stepNumber) {
    const dots = document.querySelectorAll('[id^="step-dot-"]');
    dots.forEach((dot, idx) => {
        if (idx + 1 === stepNumber) {
            dot.className = "w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs";
        } else if (idx + 1 < stepNumber) {
            dot.className = "w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs";
        }
    });
}

function triggerLiveAIStep() {
    if (liveStep >= liveInterviewTimeline.length) {
        // Interview completed loop
        alert("🎉 Live Mock Interview Session Completed! Final reports compiled successfully.");
        return;
    }

    const currentData = liveInterviewTimeline[liveStep];
    const chatContainer = document.getElementById('chat-bubble-container');
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Show AI "Thinking/Typing" State
    const typingIndicator = document.createElement('div');
    typingIndicator.id = "ai-typing-indicator";
    typingIndicator.className = "flex gap-3 mb-4 items-start animate-pulse";
    typingIndicator.innerHTML = `
    <div class="bg-indigo-100 p-2 rounded-full text-indigo-600 font-bold text-sm">🤖</div>
    <div class="bg-slate-100 text-slate-500 p-3 rounded-2xl rounded-tl-none text-xs italic">AI Interviewer is analyzing and typing...</div>
  `;
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 2. AI speaks after a 2-second realistic delay
    setTimeout(() => {
        // Remove typing indicator
        const indicator = document.getElementById('ai-typing-indicator');
        if (indicator) indicator.remove();

        // Append actual AI Question
        const aiBubble = document.createElement('div');
        aiBubble.className = "flex gap-3 mb-4 items-start";
        aiBubble.innerHTML = `
      <div class="bg-indigo-100 p-2 rounded-full text-indigo-600 font-bold text-sm">🤖</div>
      <div>
        <div class="text-xs text-slate-400 font-medium mb-1">AI Interviewer • ${currentTime}</div>
        <div class="bg-indigo-50 text-slate-800 p-4 rounded-2xl rounded-tl-none max-w-xl text-sm border border-indigo-100 leading-relaxed">${currentData.aiQuestion}</div>
      </div>`;
        chatContainer.appendChild(aiBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Increment question tracker dots in the bottom right corner layout
        updateQuestionProgressDots(liveStep + 3); // Since image shows step 2 out of 5 initially

        // 3. Simulate Candidate responding after another short pause
        setTimeout(() => {
            const userBubble = document.createElement('div');
            userBubble.className = "flex gap-3 mb-4 items-start justify-end text-right";
            userBubble.innerHTML = `
        <div>
          <div class="text-xs text-slate-400 font-medium mb-1">${currentTime} • You</div>
          <div class="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-xl text-sm text-left leading-relaxed">${currentData.mockUserResponse}</div>
        </div>`;
            chatContainer.appendChild(userBubble);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // 4. Update Metrics based on this exchange
            updateLiveAnalysisDashboard(currentData.metricsAfter);

            // Move to next step array pointer
            liveStep++;

        }, 4000); // Time candidate takes to formulate response

    }, 2000);
}

// Helper to push new stats up to layout metrics view instantly
function updateLiveAnalysisDashboard(metrics) {
    // Update numbers and badges
    document.getElementById('score-number').innerText = metrics.confidence;
    document.getElementById('score-status').innerText = metrics.status;
    document.getElementById('perception-box-text').innerText = metrics.perception;

    // Redraw the chart circle with the updated confidence score instantly
    renderGaugeChart(metrics.confidence);

    // Update specific lists/trends if needed
    document.getElementById('insight-confidence').innerHTML = `<span class="text-emerald-600 font-semibold flex items-center gap-1">↑ Good</span>`;
    document.getElementById('insight-clarity').innerHTML = `<span class="text-emerald-600 font-semibold flex items-center gap-1">↑ Good</span>`;
}

// Helper to highlight the numeric tracking steps (1, 2, 3, 4, 5) at the bottom right
function updateQuestionProgressDots(stepNumber) {
    const dots = document.querySelectorAll('[id^="step-dot-"]');
    dots.forEach((dot, idx) => {
        if (idx + 1 === stepNumber) {
            dot.className = "w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs";
        } else if (idx + 1 < stepNumber) {
            dot.className = "w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs";
        }
    });
}
k