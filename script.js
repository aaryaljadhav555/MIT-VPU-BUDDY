const WEBHOOK_URL =
  'https://ajproject.app.n8n.cloud/webhook-test/6dbff203-9533-4557-8dc8-1e554fefa17c';

let isLoading = false;

const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 130) + 'px';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function now() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function scrollBottom() {
  chatArea.scrollTo({
    top: chatArea.scrollHeight,
    behavior: 'smooth'
  });
}

function hideWelcome() {
  const w = document.getElementById('welcomeScreen');
  if (w) w.remove();
}

function sendSuggestion(chip) {
  userInput.value = chip.textContent.trim();
  sendMessage();
}

function appendMessage(text, role) {

  const row = document.createElement('div');
  row.className = `message-row ${role}`;

  const av = document.createElement('div');
  av.className = `avatar ${role === 'user' ? 'user-av' : 'bot'}`;
  av.textContent = role === 'user' ? '👤' : '✦';

  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;

  bubble.innerHTML = `
    ${text}
    <span class="time">${now()}</span>
  `;

  row.appendChild(av);
  row.appendChild(bubble);

  chatArea.appendChild(row);

  scrollBottom();
}

function showTyping() {

  const row = document.createElement('div');
  row.className = 'typing-row';
  row.id = 'typingRow';

  row.innerHTML = `
    <div class="avatar bot">✦</div>

    <div class="typing-bubble">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  `;

  chatArea.appendChild(row);

  scrollBottom();
}

function hideTyping() {
  const r = document.getElementById('typingRow');
  if (r) r.remove();
}

async function sendMessage() {

  const text = userInput.value.trim();

  if (!text || isLoading) return;

  hideWelcome();

  appendMessage(text, 'user');

  userInput.value = '';

  isLoading = true;

  sendBtn.disabled = true;

  showTyping();

  try {

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        message: text,
        chatInput: text,
        sessionId: getSession()
      })
    });

    const data = await response.json();

    const reply =
      data.output ||
      data.message ||
      data.reply ||
      data.text ||
      'No response received';

    hideTyping();

    appendMessage(reply, 'bot');

  } catch (err) {

    hideTyping();

    appendMessage(
      '⚠️ Unable to connect to server.',
      'bot'
    );

  } finally {

    isLoading = false;

    sendBtn.disabled = false;

    userInput.focus();
  }
}

function getSession() {

  let sid = sessionStorage.getItem('mitvpu_session');

  if (!sid) {
    sid = 'mitvpu-' + Math.random().toString(36).slice(2, 10);

    sessionStorage.setItem('mitvpu_session', sid);
  }

  return sid;
}
