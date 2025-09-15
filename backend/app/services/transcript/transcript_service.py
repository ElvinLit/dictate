from datetime import datetime

class TranscriptService:
    def __init__(self):
        self.transcripts = []
    
    def store_transcript(self, text: str, sender: str = "User"):
        """Store transcript and return formatted message for WebSocket"""
        message = {
            "sender": sender,
            "text": text,
            "timestamp": datetime.now().isoformat()
        }
        
        self.transcripts.append(message)
        return message
    
