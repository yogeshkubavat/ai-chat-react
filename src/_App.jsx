import { useEffect, useRef, useState } from "react";
import axios from "axios";


function App() {
  const[message, setMessage] = useState("")
  const[messages, setMessages] = useState([])
  const[istyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handelSend = async ()=>{
    if(message.trim() === "") return

    const newMessage = {
      text : message,
      sender : "user"
    }

    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: messages
                  .concat({ text: message, sender:"user"})
                  .map(msg => ({
                    role: msg.sender === "user" ? "user":"model",
                    parts:[{text:msg.text}]
                  }))
      },
    {
    headers: {
      "Content-Type": "application/json"
      }
    }
    );
    
      const aiText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

      const aiMessage = {
        text:aiText,
        sender: "AI"
      };

      setMessages(prev=>[...prev, aiMessage]);
      
    } catch (error) {
       console.log(error.response?.data || error.message);
       setMessages(prev => [...prev,{ text: "Error getting AI response", sender: "AI" }]);
    }
    setIsTyping(false)
  };

  const clearChat = ()=>{
      setMessages([]);
  } 


  useEffect(()=>{
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  },[messages])

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", fontFamily: "Arial" }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2>AI Chat App</h2>
          <button onClick={clearChat} style={{ marginBottom: 10 }}>
            Clear Chat
          </button>
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          height: 350,
          padding: 10,
          overflowY: "auto",
          marginBottom: 10,
          display:"flex",
          flexDirection:"column"
        }}
      >
        {messages.length === 0 && <p>No messages yet...</p>}
        {messages.map((msg,index)=>(
          <div key={index} style={{
            alignSelf:msg.sender === "user" ? "flex-end":"flex-start",
            marginBottom:"8px",
            backgroundColor:msg.sender==="user"?"#9be1e4":"#ededed",
            padding:"5px 10px",
            borderRadius:"6px"
            }}>
            
            <div><strong>{msg.sender === "user" ? "You":"Ai"} :</strong> {msg.text}</div>
          </div>
        ))}
        { istyping && <div
          style={{
            alignSelf:"flex-start",
            marginBottom:"8px",
            backgroundColor:"#ededed",
            padding:"5px 10px",
            borderRadius:"6px"
          }}
        >
          "AI Typing..."
          </div>}
        <div ref={chatEndRef}></div>
      </div>
      <div style={{display:"flex", gap:5}}>
      <input
        type="text"
        value={message}
        onChange={(e)=> setMessage(e.target.value)}
        onKeyDown={(e)=> {if(e.key === "Enter"){handelSend()}}}
        placeholder="Type your message..."
        style={{ flex:1 , padding: 8 }}
      />

      <button
        onClick={handelSend}
        style={{ padding: "8px 15px"}}
      >
        Send
      </button>
      </div>
    </div>
  );
}

export default App;