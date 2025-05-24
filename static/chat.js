'use strict';

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawUserMessage = userInput.value.trim();
    if (!rawUserMessage) return;

    userInput.value = '';

    const instructions = document.getElementById('mobile-instructions');
    if (instructions) {
        instructions.style.display = 'none';
    }

    let punctuatedMessage = rawUserMessage;
    try {
        const punctResponse = await fetch('/punctuate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: rawUserMessage })
        });
        const punctData = await punctResponse.json();
        if (punctData.punctuated) {
            punctuatedMessage = punctData.punctuated;
        }
    } catch (err) {
        console.warn("Punctuation fallback:", err);
    }

    chatBox.innerHTML += `
        <div class="flex items-start justify-end space-x-2 space-x-reverse">
            <div class="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xl text-left">${punctuatedMessage}</div>
            <i style="margin: 2.5px -5px 0 7.5px;" class="fa-solid fa-user"></i>
        </div>
    `;

    const thinkingIndicator = document.createElement('div');
    thinkingIndicator.className = "text-left flex items-center space-x-2";
    thinkingIndicator.innerHTML = `
        <div class="inline-block px-4 py-2 rounded-lg">
            <div class="dot-flashing"></div>
        </div>
    `;
    chatBox.appendChild(thinkingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: punctuatedMessage })
    });

    if (thinkingIndicator && thinkingIndicator.parentNode === chatBox) {
        chatBox.removeChild(thinkingIndicator);
    }

    const data = await response.json();
    const reply = data.response || `<span class="text-red-400">Error:</span> ${data.error}`;

    chatBox.innerHTML += `
        <div class="flex items-start space-x-2">
            <img src="/static/images/tps-logo.webp" alt="AI Logo" class="w-5 h-5 mt-2 rounded shadow-md" />
            <div class="bg-green-700 text-white px-4 py-2 rounded-lg max-w-xl">${reply}</div>
        </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;
});
