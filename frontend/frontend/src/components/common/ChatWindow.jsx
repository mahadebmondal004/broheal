import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const ChatWindow = ({ bookingId, currentUserId, currentUserRole, receiverId, isChatDisabled }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (bookingId) {
            loadMessages();
            // Poll for new messages every 3 seconds
            const interval = setInterval(loadMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [bookingId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            const response = await api.get(`/chat/${bookingId}`);
            if (response.data.chat) {
                setMessages(response.data.chat.messages || []);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (isChatDisabled) return;

        setLoading(true);
        try {
            if (currentUserRole === 'admin') {
                await api.post('/chat/admin/message', {
                    message: newMessage,
                    messageType: 'text',
                    bookingId,
                    receiverId
                });
            } else {
                await api.post(`/chat/${bookingId}/message`, {
                    message: newMessage,
                    messageType: 'text'
                });
            }
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col w-full h-full bg-white md:rounded-lg md:border rounded-none border-0">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold">Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[60vh] md:max-h-[400px] pb-16">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwnMessage = msg.sender.toString() === currentUserId.toString();
                        return (
                            <div
                                key={index}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <p className="text-sm">{msg.message}</p>
                                    <p
                                        className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                                            }`}
                                    >
                                        {formatTime(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="px-3 py-2 border-t sticky bottom-0 bg-white z-10 max-w-full">
                <div className="flex items-center gap-2 w-full">
                    <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    >
                        <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="min-w-0 flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        disabled={loading || isChatDisabled}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newMessage.trim() || isChatDisabled}
                    className="w-10 h-10 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center flex-shrink-0"
                >
                    <Send className="w-5 h-5" />
                </button>
                </div
            >
            {isChatDisabled && (
                <div className="text-xs text-gray-500 mt-2">Chat disabled for this booking</div>
            )}
            </form>
        </div>
    );
};

export default ChatWindow;
