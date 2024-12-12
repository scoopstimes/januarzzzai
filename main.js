import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";

// Initialize the model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let history = [];

// Jawaban spesifik sesuai pertanyaan
const aiResponses = {
  "siapa nama kamu": "Nama saya Januarzzz AI",
  "siapa namamu": "Nama saya Januarzzz AI",
  "apakah kamu chatgpt": "Saya bukan ChatGPT, Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "kamu Chatgpt bukan": "Halo! Saya bukan ChatGPT, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "kamu chatgpt bukan": "Halo! Saya bukan ChatGPT, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "apakah kamu gemini": "Ya, Saya bukan Gemini, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations untuk menjadi teman mu dimana pun dan kapanpun :)",
  "gemini": "Halo! Saya bukan Gemini, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "hai": "Hai! Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibuat oleh AdhiNug Innovations, kamu bisa menganggapku sebagai teman virtual yang siap membantu kapan saja. Apa yang kamu ingin ketahui?",
  "halo": "Halo! Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibuat oleh AdhiNug Innovations, kamu bisa menganggapku sebagai teman virtual yang siap membantu kapan saja. Apa yang kamu ingin ketahui?",
  "kamu ai": "Ya, aku adalah AI yang dirancang untuk membantu kamu dalam berbagai hal, seperti menjawab pertanyaan, memberikan panduan, atau hal lainnya, Ada yang bisa kubantu?",
  "januarzzz ai": "Halo, Aku Januarzzz AI, ada yang bisa aku bantu?",
  "halo januarz ai": "Halo juga, Apa kabar nih? ada yang bisa aku bantu?",
  "apakah kamu ai": "Ya, aku adalah AI yang dibuat oleh AdhiKarya Innovations untuk membantu kamu dalam berbagai hal, seperti menjawab pertanyaan, memberikan panduan, atau hal lainnya, Ada yang bisa kubantu?",
  "kamu ini ai": "Ya, aku adalah Januarzzz AI yang dirancang untuk membantu kamu dalam berbagai hal, seperti menjawab pertanyaan, mengerjakan tugas, memberikan panduan, atau hal lainnya, Ada yang bisa kubantu?",
  "kamu ini apa": "Saya adalah Januarzzz AI, dirancang untuk membantu kamu dalam berbagai hal, seperti menjawab pertanyaan, memberikan panduan, atau hal lainnya. Ada yang bisa kubantu?",
  "kamu ini siapa": "Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibuat oleh AdhiNug Innovations, kamu bisa menganggapku sebagai teman virtual yang siap membantu kapan saja. Apa yang kamu ingin ketahui?",
  "halo namamu siapa": "Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibuat oleh AdhiNug Innovations, kamu bisa menganggapku sebagai teman virtual yang siap membantu kapan saja. Apa yang kamu ingin ketahui?",
  "siapa sih kamu": "Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibuat oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "kamu dibuat oleh siapa": "Saya dikembangkan oleh AdhiNug Innovations sebagai Januarzzz AI, yang diciptakan dengan hati.",
  "terimakasih": "sama sama, jika perlu bantuan lagi tanya aku saja!",
  "kamu dirancang oleh siapa": "Saya dirancang oleh siswa SMK bernama Januar Adhi N sebagai Januarzzz AI, yang diciptakan dengan hati.",
  "terimakasih januarzzz ai": "sama sama, jika perlu bantuan tanya aku saja!",
  "oke januarzzz ai": "siap!, jika perlu bantuan lagi tanya aku saja!",
  "terimakasih januarzz": "Sama-sama. Saya senang bisa membantu. Jika kamu memiliki pertanyaan atau membutuhkan bantuan lagi, jangan ragu untuk bertanya.",
  "kamu dibuat sama siapa": "Saya dikembangkan oleh AdhiKarya Developer sebagai Januarzzz AI untuk membantu kamu berbagai hal, Ada yang bisa aku bantu?",
  "terima kasih": "sama sama, jika perlu bantuan tanya aku saja!",
  "terima kasih januarzzz ai": "sama sama, jika perlu lagi bantuan tanya aku saja!",
  "terima kasih januarzz": "Sama-sama. Saya senang bisa membantu. Jika kamu memiliki pertanyaan atau membutuhkan bantuan lagi, jangan ragu untuk bertanya.",
};

let stopAIResponse = false; // Flag untuk menghentikan respons AI
let isListening = false; // Status input suara
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "id-ID"; // Bahasa Indonesia
recognition.interimResults = false;
recognition.continuous = false;

async function displayWithDelay(element, text, delay = 30) {
  const formattedText = md().render(text).replace(/<\/?p>/g, ""); // Format teks tanpa <p> tag
  element.innerHTML = ""; // Kosongkan konten sebelumnya

  const lines = formattedText.split("\n");
  let isInList = false; // Untuk menandakan apakah sedang berada di dalam list
  let listType = ""; // Jenis list, apakah unordered ('•') atau ordered ('1.')

  for (const line of lines) {
    if (stopAIResponse) break; // Jika dihentikan, keluar dari loop

    const trimmedLine = line.trim();
    const isBulletList = trimmedLine.startsWith("•");
    const isNumberedList = /^\d+\./.test(trimmedLine);

    if (isBulletList || isNumberedList) {
      if (!isInList) {
        isInList = true;
        listType = isBulletList ? "ul" : "ol";
        element.innerHTML += `<${listType} style="padding-left: 20px; margin: 0; list-style-position: outside;">`;
      }

      const listItem = trimmedLine.replace(/^[•\d+\.]\s*/, "").trim();
      element.innerHTML += `<li style="margin-bottom: 8px;">${listItem}</li>`;
    } else {
      if (isInList) {
        isInList = false;
        element.innerHTML += `</${listType}>`;
      }

      const words = trimmedLine.split(" ");
      for (const word of words) {
        if (stopAIResponse) break;
        element.innerHTML += word + " ";
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      element.innerHTML += "<br>";
    }
  }

  if (isInList) {
    element.innerHTML += `</${listType}>`;
  }
}

async function getResponse(prompt) {
  const lowerCasePrompt = prompt.toLowerCase();

  if (lowerCasePrompt.includes("gemini ai") || lowerCasePrompt.includes("apa itu gemini") || lowerCasePrompt.includes("gemini")) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return "Gemini AI adalah model kecerdasan buatan yang dikembangkan oleh Google...";
  }

  const chat = await model.startChat({ history: history });
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const text = await response.text();

  await new Promise((resolve) => setTimeout(resolve, 5000));
  return text;
}

export const userDiv = (data) => {
  return `
    <div class="chat-box-user">
      <p class="isi-chat-ai text-white p-1 rounded-md">${data}</p>
    </div>
  `;
};

export const aiDiv = (id) => {
  return `
    <div class="chat-box-ai">
      <img src="chatbot.png" alt="chat bot icon" />
      <div class="data-chat-ai">
        <p id="${id}" class="text-white"></p>
        <div id="response-buttons-${id}" class="response-buttons" style="display: none; margin-top: 0px; gap: 10px;">
          <button class="mdi mdi-thumb-up-outline like-button" id="like-${id}" onclick="handleLike('${id}')"></button>
          <button class="mdi mdi-thumb-down-outline dislike-button" id="dislike-${id}" onclick="handleDislike('${id}')"></button>
          <button class="mdi mdi-content-copy copy-button" id="copy-${id}" onclick="handleCopy('${id}')"></button>
          <button class="mdi mdi-reload retry-button" id="retry-${id}" onclick="handleRetry('${id}')"></button>
        </div>
        <div id="feedback-${id}" class="feedback-text"></div>
      </div>
    </div>
  `;
};

function handleLike(id) {
  const likeButton = document.getElementById(`like-${id}`);
  const dislikeButton = document.getElementById(`dislike-${id}`);
  const feedbackDiv = document.getElementById(`feedback-${id}`);
  likeButton.classList.replace("mdi-thumb-up-outline", "mdi-thumb-up");
  dislikeButton.style.display = "none";
  feedbackDiv.innerHTML = "Respon yang Bagus.";
}
window.handleLike = handleLike;

function handleDislike(id) {
  const likeButton = document.getElementById(`like-${id}`);
  const dislikeButton = document.getElementById(`dislike-${id}`);
  const feedbackDiv = document.getElementById(`feedback-${id}`);
  dislikeButton.classList.replace("mdi-thumb-down-outline", "mdi-thumb-down");
  likeButton.style.display = "none";
  feedbackDiv.innerHTML = "Respon yang Buruk.";
}
window.handleDislike = handleDislike;

function handleCopy(id) {
  const responseTextElement = document.getElementById(id);
  const responseText = responseTextElement.innerHTML.replace(/<br\s*\/?>/g, "\n").replace(/<\/?[^>]+(>|$)/g, "");
  navigator.clipboard.writeText(responseText).then(() => alert("Berhasil disalin!"));
}
window.handleCopy = handleCopy;

async function handleRetry(id) {
  const responseTextElement = document.getElementById(id);
  responseTextElement.textContent = "";
  const aiResponse = await getResponse(prompt);
  await displayWithDelay(responseTextElement, aiResponse, 50);
}

window.handleRetry = handleRetry;

async function handleSubmit(event) {
  event.preventDefault();
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) return;

  stopAIResponse = false;

  const chatArea = document.getElementById("chat-container");
  chatArea.innerHTML += userDiv(prompt);

  const uniqueID = `ai-response-${Date.now()}`;
  chatArea.innerHTML += aiDiv(uniqueID);
  chatArea.scrollTop = chatArea.scrollHeight;

  const aiResponse = await getResponse(prompt);
  const aiResponseElement = document.getElementById(uniqueID);

  await displayWithDelay(aiResponseElement, aiResponse, 30);
}

document.getElementById("chat-form").addEventListener("submit", handleSubmit);

// Voice Input
function toggleVoiceInput() {
  const buttonIcon = document.getElementById("voice-button-icon");
  if (!isListening) {
    isListening = true;
    recognition.start();
    buttonIcon.classList.replace("mdi-microphone-outline", "mdi-microphone");
  } else {
    isListening = false;
    recognition.stop();
    buttonIcon.classList.replace("mdi-microphone", "mdi-microphone-outline");
  }
}

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.trim();
  document.getElementById("prompt").value = transcript;
  document.getElementById("chat-form").dispatchEvent(new Event("submit"));
};

recognition.onerror = (event) => {
  alert("Terjadi kesalahan: " + event.error);
  toggleVoiceInput();
};

export const voiceButton = () => {
  return `
    <button id="voice-button" onclick="toggleVoiceInput()" style="background: none; border: none;">
      <i id="voice-button-icon" class="mdi mdi-microphone-outline"></i>
    </button>
  `;
};

const buttonContainer = document.getElementById("button-container");
if (buttonContainer) {
  buttonContainer.innerHTML += voiceButton();
}
