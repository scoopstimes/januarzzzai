import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";

// Initialize the model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let history = [];

// Jawaban spesifik sesuai pertanyaan
const aiResponses = {
  "kamu Chatgpt bukan": "Halo! Saya bukan ChatGPT, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "kamu chatgpt bukan": "Halo! Saya bukan ChatGPT, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "apakah kamu gemini": "Ya, Saya bukan Gemini, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations untuk menjadi teman mu dimana pun dan kapanpun :)",
  "gemini": "Halo! Saya bukan Gemini, tetapi saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibangun oleh AdhiNug Innovations, Apa yang kamu ingin ketahui?",
  "hai": "Hai! Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibuat oleh AdhiNug Innovations, kamu bisa menganggapku sebagai teman virtual yang siap membantu kapan saja. Apa yang kamu ingin ketahui?",
  "halo": "Saya adalah Januarzzz AI, asisten berbasis kecerdasan buatan yang dibuat oleh AdhiNug Innovations, kamu bisa menganggapku sebagai teman virtual yang siap membantu kapan saja. Apa yang kamu ingin ketahui?",
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
  "oke": "siap!, jika perlu bantuan lagi tanya aku saja!",
  "terimakasih januarzz": "Sama-sama. Saya senang bisa membantu. Jika kamu memiliki pertanyaan atau membutuhkan bantuan lagi, jangan ragu untuk bertanya.",
  "kamu dibuat sama siapa": "Saya dikembangkan oleh AdhiKarya Developer sebagai Januarzzz AI untuk membantu kamu berbagai hal, Ada yang bisa aku bantu?",
  "terima kasih": "sama sama, jika perlu bantuan tanya aku saja!",
  "terima kasih januarzzz ai": "sama sama, jika perlu lagi bantuan tanya aku saja!",
  "terima kasih januarzz": "Sama-sama. Saya senang bisa membantu. Jika kamu memiliki pertanyaan atau membutuhkan bantuan lagi, jangan ragu untuk bertanya.",
  "machine learning": "Machine learning adalah cabang dari kecerdasan buatan (AI) yang memungkinkan sistem untuk belajar dari data dan pengalaman tanpa perlu diprogram secara eksplisit.",
  "chatbot": "Chatbot adalah program komputer yang dirancang untuk mensimulasikan percakapan dengan pengguna manusia, biasanya melalui aplikasi perpesanan atau suara.",
  "artificial intelligence": "Kecerdasan buatan (Artificial Intelligence / AI) adalah cabang dari ilmu komputer yang berfokus pada pembuatan sistem yang dapat melakukan tugas yang biasanya membutuhkan kecerdasan manusia, seperti pemecahan masalah dan pembelajaran."
};
let stopAIResponse = false; // Flag untuk menghentikan respons AI

async function displayWithDelay(element, text, delay = 300) {
  const formattedText = md().render(text).replace(/<\/?p>/g, ""); // Format teks dan hapus tag <p>
  element.innerHTML = ""; // Kosongkan konten sebelumnya

  const words = formattedText.split(" "); // Pisahkan teks berdasarkan kata
  for (const word of words) {
    if (stopAIResponse) break; // Jika dihentikan, keluar dari loop
    element.innerHTML += word + " "; // Tambahkan kata satu per satu
    await new Promise((resolve) => setTimeout(resolve, delay)); // Tunggu sesuai delay
  }
}

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
  const text = await response.text(); // Pastikan await digunakan
  return text;
}

// user chat div
export const userDiv = (data) => {
  return `
    <div class="chat-box-user">
      <p class="isi-chat-ai text-white p-1 rounded-md">
        ${data}
      </p>
    </div>
  `;
};

// AI Chat div
export const aiDiv = (id) => {
  return `
    <div class="chat-box-ai">
      <img src="chatbot-bg.jpeg" alt="chat bot icon" />
      <div class="data-chat-ai">
        <p id="${id}" class="text-white inline-block"></p>
      </div>
    </div>
  `;
};

// Tombol Dinamis untuk Kirim dan Hentikan Respons
async function handleSubmit(event) {
  event.preventDefault();

  const button = document.getElementById("submit-ai");
  const buttonIcon = document.getElementById("button-icon");

  const mode = button.getAttribute("data-mode");
  if (mode === "idle") {
    // Ubah tombol menjadi mode merekam
    button.setAttribute("data-mode", "recording");
    buttonIcon.classList.remove("mdi-send");
    buttonIcon.classList.add("mdi-record-circle-outline");
    stopAIResponse = false;

    const userMessage = document.getElementById("prompt");
    const chatArea = document.getElementById("chat-container");

    const prompt = userMessage.value.trim();
    if (prompt === "") {
      // Reset tombol jika input kosong
      button.setAttribute("data-mode", "idle");
      buttonIcon.classList.remove("mdi-record-circle-outline");
      buttonIcon.classList.add("mdi-send");
      return;
    }

    chatArea.innerHTML += userDiv(prompt);
    userMessage.value = "";

    const uniqueID = `ai-response-${Date.now()}`; // ID unik untuk setiap respons
    chatArea.innerHTML += aiDiv(uniqueID);
    chatArea.scrollTop = chatArea.scrollHeight;

    const aiResponse = await getResponse(prompt);
    const aiResponseElement = document.getElementById(uniqueID);

    await displayWithDelay(aiResponseElement, aiResponse, 300);

    // Reset tombol ke mode idle
    button.setAttribute("data-mode", "idle");
    buttonIcon.classList.remove("mdi-record-circle-outline");
    buttonIcon.classList.add("mdi-send");

    history.push({ role: "user", parts: prompt });
    history.push({ role: "model", parts: aiResponse });
  } else if (mode === "recording") {
    // Jika tombol ditekan kembali, hentikan respons AI
    stopAIResponse = true;

    // Reset tombol ke mode idle
    button.setAttribute("data-mode", "idle");
    buttonIcon.classList.remove("mdi-record-circle-outline");
    buttonIcon.classList.add("mdi-send");
  }
}

const chatForm = document.getElementById("chat-form");
if (chatForm) {
  chatForm.addEventListener("submit", handleSubmit);
} else {
  console.error("chat-form element not found!");
}
