let translateButton = document.querySelector("#chat_button");
const chatContainer = document.querySelector(".chat_messages");

translateButton.addEventListener("click", async () => {

  let text = document.querySelector("#chat_input")
  let inputText = text.value.trim();

  let selectedSpeaker = document.querySelector("#chat_select").value;

  if (!inputText || !selectedSpeaker) {
    alert("Porfavor, escriba un texto y seleccione un speaker.");
    return false;
  }

  // Mostrar el mensaje del usuario en la interfaz
  const userMessage = document.createElement("div");
  userMessage.className = "chat_message chat_message--user";
  userMessage.textContent = inputText;

  chatContainer.appendChild(userMessage);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const loading = document.createElement("div");
  loading.className = "chat_message chat_message--bot";
  loading.textContent = "Generando audio, porfavor espere...";

  chatContainer.appendChild(loading);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const response = await fetch("/api/speak", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: inputText,
        speaker: selectedSpeaker,
      }),
    });
    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Agregar mensaje traducido a la interfaz
      // const botMessage = document.createElement("div");
      const botMessage = loading;
      botMessage.className = "chat_message chat_message--bot";
      botMessage.innerHTML = `<audio controls>
        <source src="${audioUrl}" type="audio/mp3">
        Your browser does not support the audio element.
      </audio>`;

      chatContainer.appendChild(botMessage);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    text.value = "";
  } catch (error) {
    console.error("Error during translation:", error);
    alert("An error occurred while narrating. Please try again.");
  }
});
