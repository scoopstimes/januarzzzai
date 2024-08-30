    import { GoogleGenerativeAI } from "@google/generative-ai";
    import md from "markdown-it";

    // Initialize the model
    const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_API_KEY}`);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let history = [];

    async function getResponse(prompt) {
      const chat = await model.startChat({ history: history });
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(text);
      return text;
    }

    // user chat div
    export const userDiv = (data) => {
      return `
      <!-- User Chat -->
              <div class="chat-box-user">
                <img
                  src="user.jpg"
                  alt="user icon"
                />
                <p class="isi-chat-ai text-white p-1 rounded-md shadow-md  ">
                  ${data}
                </p>
              </div>
      `;
    };

    // AI Chat div
    export const aiDiv = (data) => {
      return `
      <!-- AI Chat -->
              <div class="chat-box-ai">
                <img
                  src="chat-bot.jpg"
                  alt="user icon"
                />
                <div class="data-chat-ai">
                <p>
                  ${data}
                </p>
                </div>
              </div>
      `;
    };

    async function handleSubmit(event) {
      event.preventDefault();
    
      let userMessage = document.getElementById("prompt");
      const chatArea = document.getElementById("chat-container");
    
      var prompt = userMessage.value.trim();
      if (prompt === "") {
        return;
      }
    
      console.log("user message", prompt);
     
      chatArea.innerHTML += userDiv(prompt);
      userMessage.value = "";

      const typingIndicator = document.createElement("div");
      typingIndicator.classList.add("chat-box-ai");
      typingIndicator.innerHTML = `
      
        <img src="chat-bot.jpg" alt="chat bot icon"/>
        <div class="data-chat-ai">
    
        <p class="typing-indicator text-gray-500 italic">Typing...</p>
        </div>
      `;
      chatArea.appendChild(typingIndicator);
    
      chatArea.scrollTop = chatArea.scrollHeight;
      const aiResponse = await getResponse(prompt);
      let md_text = md().render(aiResponse);
      chatArea.removeChild(typingIndicator);
      chatArea.innerHTML += aiDiv(md_text);
      chatArea.scrollTop = chatArea.scrollHeight;

      let newUserRole = {
        role: "user",
        parts: prompt,
      };
      let newAIRole = {
        role: "model",
        parts: aiResponse,
      };
    
      history.push(newUserRole);
      history.push(newAIRole);
    
      console.log(history);
    }
    

    const chatForm = document.getElementById("chat-form");
    chatForm.addEventListener("submit", handleSubmit);

    chatForm.addEventListener("keyup", (event) => {
      if (event.keyCode === 13) handleSubmit(event);
    });
