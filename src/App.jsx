import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function App() {
  const[message, setMessage]= useState("");
  const[messages, setMessages] = useState([]);
  const[isTyping,setIsTyping] = useState(false)
  const chatRef = useRef(null)
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  
  const handleSend = async ()=>{

    if(message.trim() === "") return;
    const newMessage = {
        text : message,
        sender : "User"
    }
    setMessages(prev => [...prev, newMessage]);
    setMessage("")

    setIsTyping(true);
    try {                        
      const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
        {
          contents:messages
                    .concat({text:message, sender: "User"})
                    .map(msg => ({
                       role:msg.sender === "User" ? "User":"model",
                       parts:[{text:msg.text}] 
                    }))
        },
        {
          headers :{"Content-Type" : "application/json"}
        }
      )
      const apiTxt = res.data.candidates[0].content.parts[0].text || "No response text found." 
      
      const aiMessage = {
          text:apiTxt,
          sender:"AI"
      }
      setMessages(prev => [...prev, aiMessage]);
      

    } catch (error) {
      console.log(error.res?.data || error.message);
      setMessages(prev=>[...prev,{ text: "Error getting AI response", sender: "AI" }])
    }
    setIsTyping(false)
  }

  useEffect(()=>{
    chatRef?.current?.scrollIntoView({behavior:"smooth"});
  },[messages])

  return (
    <div className="chat-wrapper">
      <style>{`

*{
box-sizing:border-box;
font-family:Arial, Helvetica, sans-serif;
}

.chat-wrapper{
height:100vh;
background:#f5f7fb;
display:flex;
justify-content:center;
align-items:center;
}

.chat-container{
width:420px;
height:620px;
background:white;
border-radius:14px;
box-shadow:0 10px 30px rgba(0,0,0,0.12);
display:flex;
flex-direction:column;
overflow:hidden;
}

.chat-header{
background:#111827;
color:white;
padding:16px;
font-size:18px;
font-weight:600;
}

.chat-messages{
flex:1;
padding:20px;
display:flex;
flex-direction:column;
gap:16px;
overflow-y:auto;
background:#f9fafb;
}

.chat-row{
display:flex;
gap:10px;
align-items:flex-start;
}

.chat-row.user{
flex-direction:row-reverse;
}

.avatar{
width:34px;
height:34px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:18px;
}

.ai-avatar{
background:#e5e7eb;
}

.user-avatar{
background:#2563eb;
color:white;
}

.message{
padding:10px 14px;
border-radius:14px;
max-width:70%;
font-size:14px;
line-height:1.5;
}

.ai-message{
background:#e5e7eb;
}

.user-message{
background:#2563eb;
color:white;
}

.typing{
background:#e5e7eb;
padding:10px 14px;
border-radius:14px;
display:flex;
gap:5px;
width:50px;
}

.dot{
width:6px;
height:6px;
background:#6b7280;
border-radius:50%;
animation:typing 1.4s infinite;
}

.dot:nth-child(2){
animation-delay:0.2s;
}

.dot:nth-child(3){
animation-delay:0.4s;
}

@keyframes typing{
0%,80%,100%{opacity:0}
40%{opacity:1}
}

.chat-input{
padding:12px;
border-top:1px solid #e5e7eb;
background:white;
}

.input-box{
position:relative;
}

.input-box input{
width:100%;
padding:10px 70px 10px 12px;
border:1px solid #d1d5db;
border-radius:10px;
outline:none;
font-size:14px;
}

.clear-icon{
position:absolute;
right:75px;
top:50%;
transform:translateY(-50%);
cursor:pointer;
color:#9ca3af;
font-size:14px;
}

.send-btn{
position:absolute;
right:5px;
top:50%;
transform:translateY(-50%);
border:none;
background:#2563eb;
color:white;
padding:6px 12px;
border-radius:8px;
cursor:pointer;
font-size:13px;
}

.send-btn:hover{
background:#1d4ed8;
}

      `}</style>

      <div className="chat-container">
        <div className="chat-header">AI Assistant</div>

        <div className="chat-messages">

          {/* AI Message */}
          {/* <div className="chat-row">
            <div className="avatar ai-avatar">🤖</div>
            <div className="message ai-message">
              Hello! How can I help you today?
            </div>
          </div> */}

          {/* User Message */}
          { messages.length === 0 && <div style={{textAlign:"center"}}>No Message</div>}
          {
            messages.map((msg, index)=>
                <div className={msg.sender === "User" ? "chat-row user": "chat-row"} key={index}>
                  <div className={msg.sender === "User" ? "avatar ai-user": "avatar ai-avatar"}>
                    {msg.sender === "User" ? "👤":"🤖"}</div>
                  <div className={`message ${msg.sender === "User" ? "user-message": "ai-message"}`}>
                      {msg.text}
                  </div>
               </div>
            )
          }
          

          {/* AI Message */}
          {/* <div className="chat-row">
            <div className="avatar ai-avatar">🤖</div>
            <div className="message ai-message">
              This is a UI layout example for a React chat interface.
            </div>
          </div> */}

          {/* Typing Animation */}
          {isTyping && <div className="chat-row">
            <div className="avatar ai-avatar">🤖</div>
            <div className="typing">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>}
            <div ref={chatRef}></div>
        </div>

        <div className="chat-input">
          <div className="input-box">
            <input onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e)=>{e.key === "Enter" && handleSend()}} value={message} type="text" placeholder="Type your message..." />
            {message && <span className="clear-icon" onClick={()=> setMessage("")}>✖</span>}
            <button onClick={handleSend} className="send-btn">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}