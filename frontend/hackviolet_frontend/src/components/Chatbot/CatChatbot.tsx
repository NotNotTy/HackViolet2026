import { useState } from "react";
import './CatChatbot.css';

type ChatMode = 'motivate' | 'compliment' | 'insult';

const motivateMessages = [
    "🐱 You've got this! Time to crush those gains!",
    "🐱 Every rep counts! You're stronger than you think!",
    "🐱 Push through! Your future self will thank you!",
    "🐱 You're a fitness warrior! Let's go!",
    "🐱 No excuses! You're capable of amazing things!",
    "🐱 The only bad workout is the one you didn't do!",
    "🐱 You're building a better version of yourself!",
    "🐱 Pain is temporary, gains are forever!",
    "🐱 You didn't come this far to only come this far!",
    "🐱 Your body can do it, it's your mind you need to convince!"
];

const complimentMessages = [
    "🐱 You're absolutely amazing! Keep shining!",
    "🐱 You have such great dedication! I'm proud of you!",
    "🐱 Your commitment to fitness is inspiring!",
    "🐱 You're looking strong and confident!",
    "🐱 You have such a positive attitude!",
    "🐱 Your progress is incredible! Keep it up!",
    "🐱 You're doing great things for yourself!",
    "🐱 You're a true fitness champion!",
    "🐱 Your determination is admirable!",
    "🐱 You're absolutely crushing it! So proud!"
];

const insultMessages = [
    "🐱 Meow... are you even trying?",
    "🐱 *yawns* That's the best you can do?",
    "🐱 Hiss! Your form needs work, human!",
    "🐱 *stretches lazily* I've seen better effort from a sleeping cat.",
    "🐱 Meow meow... is that all?",
    "🐱 *rolls eyes* You call that a workout?",
    "🐱 Hiss! Even I work harder during nap time!",
    "🐱 *flicks tail* Your excuses are showing.",
    "🐱 Meow... I expected more from you.",
    "🐱 *sits judgmentally* That was... something."
];

function CatChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<ChatMode>('motivate');
    const [messages, setMessages] = useState<Array<{ text: string; from: 'bot' | 'user' }>>([
        { text: "🐱 Meow! I'm your fitness cat companion! Choose how you want me to talk to you!", from: 'bot' }
    ]);

    const getRandomMessage = (chatMode: ChatMode): string => {
        const messageArray = chatMode === 'motivate' ? motivateMessages :
                            chatMode === 'compliment' ? complimentMessages :
                            insultMessages;
        return messageArray[Math.floor(Math.random() * messageArray.length)];
    };

    const handleModeChange = (newMode: ChatMode) => {
        setMode(newMode);
        const modeMessage = newMode === 'motivate' ? "🐱 Meow! I'm here to motivate you! Let's get those gains!" :
                           newMode === 'compliment' ? "🐱 Purr! I'm feeling nice today! You're awesome!" :
                           "🐱 Hiss! Time for some tough love!";
        setMessages([{ text: modeMessage, from: 'bot' }]);
    };

    const handleSendMessage = () => {
        const botResponse = getRandomMessage(mode);
        setMessages(prev => [
            ...prev,
            { text: "Tell me something!", from: 'user' },
            { text: botResponse, from: 'bot' }
        ]);
    };

    return (
        <>
            {/* Chatbot Button */}
            {!isOpen && (
                <button 
                    className="chatbot-toggle"
                    onClick={() => setIsOpen(true)}
                    title="Open Cat Chatbot"
                >
                    🐱
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <span className="cat-emoji">🐱</span>
                            <span>Fitness Cat</span>
                        </div>
                        <button 
                            className="chatbot-close"
                            onClick={() => setIsOpen(false)}
                            title="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* Mode Selector */}
                    <div className="chatbot-modes">
                        <button
                            className={`mode-btn ${mode === 'motivate' ? 'active' : ''}`}
                            onClick={() => handleModeChange('motivate')}
                        >
                            💪 Motivate
                        </button>
                        <button
                            className={`mode-btn ${mode === 'compliment' ? 'active' : ''}`}
                            onClick={() => handleModeChange('compliment')}
                        >
                            ❤️ Compliment
                        </button>
                        <button
                            className={`mode-btn ${mode === 'insult' ? 'active' : ''}`}
                            onClick={() => handleModeChange('insult')}
                        >
                            😾 Insult
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.from === 'bot' ? 'bot-message' : 'user-message'}`}>
                                {msg.from === 'bot' && <span className="cat-icon">🐱</span>}
                                <span className="message-text">{msg.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="chatbot-input-area">
                        <button 
                            className="chatbot-send-btn"
                            onClick={handleSendMessage}
                            title="Get a message from the cat"
                        >
                            Get Message 🐾
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default CatChatbot;
