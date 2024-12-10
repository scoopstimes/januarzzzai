import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";

// Initialize the model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let history = [];
let stopAIResponse = false; // Flag untuk menghentikan respons AI

// Jawaban spesifik sesuai pertanyaan
const aiResponses = {
  "kamu Chatgpt bukan": "Halo! Saya bukan ChatGPT, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "kamu chatgpt bukan": "Halo! Saya bukan ChatGPT, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "hai": "Hai! Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibuat oleh AdhiNug Innovations, kamu bisa menganggapku sebagai teman virtual yang siap membantu kapan saja. Apa yang kamu ingin ketahui?",
  "halo": "Halo! Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibuat oleh AdhiNug Innovations, kamu bisa menganggapku sebagai teman virtual yang siap membantu kapan saja. Apa yang kamu ingin ketahui?",
  "terimakasih": "Sama-sama! Jika perlu bantuan lagi, tanya aku saja!",
  "oke": "Siap! Jika perlu bantuan lagi, tanya aku saja!",
};

// Fungsi untuk mendapatkan respons dari AI atau jawaban khusus
async function getResponse(prompt) {
  const lowerCasePrompt = prompt.toLowerCase();

  for (const keyword in aiResponses) {
    if (lowerCasePrompt.includes(keyword)) {
      return aiResponses[keyword];
    }
  }

  // Jika tidak ada kecocokan, kirim prompt ke model AI
  const chat = await model.startChat({ history: history });
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const text = await response.text();
  return text;
}

// Fungsi untuk menampilkan pesan dengan penundaan
async function displayWithDelay(element, text, delay = 50) {
  const formattedText = md().render(text).replace(/<\/?p>/g, ""); // Format teks tanpa <p> tag
  element.innerHTML = "";

  const lines = formattedText.split("\n");
  for (const line of lines) {
    if (stopAIResponse) break;

    const words = line.split(" ");
    for (const word of words) {
      if (stopAIResponse) break;
      element.innerHTML += word + " ";
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    element.innerHTML += "<br>";
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// User Chat Div
export const userDiv = (data) => {
  return `
  <div class="flex items-center gap-2 justify-start">
    <img
      src="user.jpg"
      alt="user icon"
      class="w-10 h-10 rounded-full"
    />
    <p class="bg-gemDeep text-white p-1 rounded-md shadow-md">
      ${data}
    </p>
  </div>
  `;
};

// AI Chat Div
export const aiDiv = (id) => {
  return `
  <div class="flex gap-2 justify-end">
    <pre id="${id}" class="bg-gemRegular/40 text-gemDeep p-1 rounded-md shadow-md whitespace-pre-wrap"></pre>
    <img
      src="chat-bot.jpg"
      alt="AI icon"
      class="w-10 h-10 rounded-full"
    />
  </div>
  `;
};

// Submit Handler
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
    if (prompt === "") {
      button.setAttribute("data-mode", "idle");
      buttonIcon.classList.remove("mdi-record-circle-outline");
      buttonIcon.classList.add("mdi-send");
      return;
    }

    chatArea.innerHTML += userDiv(prompt);
    userMessage.value = "";

    const uniqueID = `ai-response-${Date.now()}`;
    chatArea.innerHTML += aiDiv(uniqueID);
    chatArea.scrollTop = chatArea.scrollHeight;

    const aiResponse = await getResponse(prompt);
    const aiResponseElement = document.getElementById(uniqueID);

    await displayWithDelay(aiResponseElement, aiResponse, 100);

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

// Event Listener untuk Form
const chatForm = document.getElementById("chat-form");
if (chatForm) {
  chatForm.addEventListener("submit", handleSubmit);
} else {
  console.error("chat-form element not found!");
}
