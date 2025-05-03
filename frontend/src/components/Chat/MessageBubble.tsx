import React from 'react';
import { Message, Participant } from '../../types/chat.type';
import { format } from 'date-fns';
import { CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  otherParticipant?: Participant;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, otherParticipant }) => {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const isMessageSeen = () => {
    // First check the isRead property directly on the message
    if (message.isRead !== undefined) {
      return message.isRead;
    }
    
    // Then fall back to the otherParticipant's seen property
    if (!otherParticipant || !otherParticipant.seen) return false;
    
    // Check if otherParticipant.seen refers to this message or a later one
    // A message is considered "seen" if the participant has seen this message or any message after it
    return otherParticipant.seen.id === message.id || 
           new Date(otherParticipant.seen.createdAt) >= new Date(message.createdAt);
  };

  const renderStatus = () => {
    if (!isOwnMessage) return null;

    if (isMessageSeen()) {
      return <CheckCircleOutlined className="message-status seen" />;
    }
    return <CheckOutlined className="message-status sent" />;
  };

  return (
    <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
      <div className="message-content">
        <p className="message-text">{message.content}</p>
        {message.images && message.images.length > 0 && (
          <div className="message-images">
            {message.images.map((url, idx) => (
              <img key={idx} src={url} alt={`Hình ảnh ${idx + 1}`} />
            ))}
          </div>
        )}
        <div className="message-meta">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 