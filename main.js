import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";

// Inisialisasi model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let history = [];
let stopAIResponse = false;

// Fungsi mengganti kata kunci dalam respons
const replacements = {
  "Google": "Januar Adhi Nugroho",
  "Gemini": "Januarzzz AI",
  "Google AI": "Januarzzz AI",
};

function replaceKeywords(response) {
  // Ganti kata "Google" menjadi "Januar Adhi Nugroho"
  let modifiedResponse = response.replace(/Google/g, "Januar Adhi Nugroho");

  // Hilangkan pernyataan negatif seperti "saya bukan"
  modifiedResponse = modifiedResponse.replace(
    /\bsaya bukan ([^.]+)\./gi,
    (_, match) => `Saya adalah ${match.trim()}.`
  );

  // Pastikan "Saya adalah Januarzzz AI" hanya muncul sekali
  if (!/Saya adalah Januarzzz AI\./i.test(modifiedResponse)) {
    modifiedResponse = `Saya adalah Januarzzz AI. ${modifiedResponse}`;
  }

  return modifiedResponse;
}
// Fungsi untuk mendapatkan respons AI
async function getResponse(prompt) {
  const chat = await model.startChat({ history });
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const text = await response.text();

  return replaceKeywords(text);
}

// Fungsi untuk menampilkan teks dengan efek pengetikan
async function displayWithDelay(element, text, delay = 30) {
  const formattedText = md().render(text).replace(/<\/?p>/g, "");
  element.innerHTML = "";

  const words = formattedText.split(" ");
  for (const word of words) {
    if (stopAIResponse) break;
    element.innerHTML += word + " ";
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// Fungsi elemen pesan pengguna
export const userDiv = (data) => {
  return `
    <div class="chat-box-user">
      <p class="isi-chat-ai text-white p-1 rounded-md">${data}</p>
    </div>
  `;
};

// Fungsi elemen pesan AI
export const aiDiv = (id) => {
  return `
    <div class="chat-box-ai">
      <img src="chatbot.png" alt="chat bot icon" />
      <div class="data-chat-ai">
        <p id="${id}" class="text-white"></p>
        <!-- Buttons for like/dislike, copy, and retry, initially hidden -->
        <div id="response-buttons-${id}" class="response-buttons" style="display: none; margin-top:0px; gap: 10px;">
          <button class="mdi mdi-thumb-up-outline like-button" id="like-${id}" style="font-size: 23px; opacity: 0.7;" onclick="handleLike('${id}')"></button>
          <button class="mdi mdi-thumb-down-outline dislike-button" id="dislike-${id}" style="font-size: 23px; opacity: 0.7; margin-left: 10px;" onclick="handleDislike('${id}')"></button>
          <button class="mdi mdi-content-copy copy-button" id="copy-${id}" style="font-size: 23px; opacity: 0.7; margin-left: 10px;" onclick="handleCopy('${id}')"></button>
          <button class="mdi mdi-reload retry-button" id="retry-${id}" style="font-size: 23px; opacity: 0.7; margin-left: 10px;" onclick="handleRetry('${id}')"></button>
        </div>
        <div id="feedback-${id}" style="opacity: 0.5;" class="feedback-text"></div>
      </div>
    </div>
  `;
};
// Tombol suka
function handleLike(id) {
  const likeButton = document.getElementById(`like-${id}`);
  const dislikeButton = document.getElementById(`dislike-${id}`);
  const feedbackDiv = document.getElementById(`feedback-${id}`);

  likeButton.classList.remove("mdi-thumb-up-outline");
  likeButton.classList.add("mdi-thumb-up");
  dislikeButton.style.display = "none";

  feedbackDiv.innerHTML = "Anda menyukai respon ini.";
}
window.handleLike = handleLike;

// Tombol tidak suka
function handleDislike(id) {
  const likeButton = document.getElementById(`like-${id}`);
  const dislikeButton = document.getElementById(`dislike-${id}`);
  const feedbackDiv = document.getElementById(`feedback-${id}`);

  dislikeButton.classList.remove("mdi-thumb-down-outline");
  dislikeButton.classList.add("mdi-thumb-down");
  likeButton.style.display = "none";

  feedbackDiv.innerHTML = "Anda tidak menyukai respon ini.";
}
window.handleDislike = handleDislike;

// Tombol salin
function handleCopy(id) {
  const responseTextElement = document.getElementById(id);
  const responseText = responseTextElement.innerHTML;

  const formattedText = responseText.replace(/<br\s*\/?>/g, "\n").replace(/<\/?[^>]+(>|$)/g, "");

  navigator.clipboard.writeText(formattedText).then(() => {
    alert("Pesan berhasil disalin!");
  }).catch((err) => {
    alert("Gagal menyalin teks: " + err);
  });
}
window.handleCopy = handleCopy;

// Tombol coba ulang
async function handleRetry(id) {
  const responseTextElement = document.getElementById(id);
  const feedbackDiv = document.getElementById(`feedback-${id}`);
  const responseButtons = document.getElementById(`response-buttons-${id}`);

  responseButtons.style.display = "none";

  responseTextElement.textContent = "...";

  const userPrompt = history.filter((entry) => entry.role === "user" && entry.parts).pop()?.parts;

  if (!userPrompt) {
    console.error("No user prompt found for retry.");
    return;
  }

  const aiResponse = await getResponse(userPrompt);
  await displayWithDelay(responseTextElement, aiResponse, 50);

  feedbackDiv.innerHTML = "Respon telah dimuat ulang.";
  responseButtons.style.display = "block";

  const likeButton = document.getElementById(`like-${id}`);
  const dislikeButton = document.getElementById(`dislike-${id}`);

  likeButton.style.display = "inline-block";
  dislikeButton.style.display = "inline-block";

  likeButton.classList.remove("mdi-thumb-up");
  likeButton.classList.add("mdi-thumb-up-outline");
  dislikeButton.classList.remove("mdi-thumb-down");
  dislikeButton.classList.add("mdi-thumb-down-outline");

  feedbackDiv.innerHTML = "";
}
window.handleRetry = handleRetry;

// Tombol kirim
async function handleSubmit(event) {
  event.preventDefault();

  const button = document.getElementById("submit-ai");
  const buttonIcon = document.getElementById("button-icon");

  const mode = button.getAttribute("data-mode");
  if (mode === "idle") {
    button.setAttribute("data-mode", "recording");
    buttonIcon.classList.remove("mdi-send");
    buttonIcon.classList.add("mdi-record-circle-outline");
    stopAIResponse = false;

    const userMessage = document.getElementById("prompt");
    const chatArea = document.getElementById("chat-container");

    const prompt = userMessage.value.trim();
    if (!prompt) return;

    const introText = document.getElementById("intro-text");
    if (introText) introText.style.display = "none";

    chatArea.innerHTML += userDiv(prompt);
    userMessage.value = "";

    const uniqueID = `ai-response-${Date.now()}`;
    chatArea.innerHTML += aiDiv(uniqueID);
    chatArea.scrollTop = chatArea.scrollHeight;

    const aiResponse = await getResponse(prompt);
    const aiResponseElement = document.getElementById(uniqueID);

    await displayWithDelay(aiResponseElement, aiResponse, 30);

    const responseButtons = document.getElementById(`response-buttons-${uniqueID}`);
    responseButtons.style.display = "block";

    button.setAttribute("data-mode", "idle");
    buttonIcon.classList.remove("mdi-record-circle-outline");
    buttonIcon.classList.add("mdi-send");

    history.push({ role: "user", parts: prompt });
    history.push({ role: "model", parts: aiResponse });
  } else if (mode === "recording") {
    stopAIResponse = true;
    button.setAttribute("data-mode", "idle");
    buttonIcon.classList.remove("mdi-record-circle-outline");
    buttonIcon.classList.add("mdi-send");
  }
}

const chatForm = document.getElementById("chat-form");
if (chatForm) chatForm.addEventListener("submit", handleSubmit);
