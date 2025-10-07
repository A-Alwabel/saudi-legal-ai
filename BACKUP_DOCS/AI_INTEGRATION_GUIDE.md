# AI Integration Guide - Saudi Legal AI v2.0

## 🤖 Current Status

The system now has **intelligent AI integration** that can use either:
1. **Real OpenAI API** (when API key is provided)
2. **Enhanced Mock Responses** (fallback mode)

## 🚀 How to Enable Real AI

### Step 1: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Make sure you have credits/billing set up

### Step 2: Configure Environment
Create a `.env` file in the `server` directory:

```bash
# server/.env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

### Step 3: Restart Server
```bash
cd server
npx ts-node src/simple-server.ts
```

## 🔧 How It Works

### With Real AI (OpenAI API Key Present):
- Questions are sent to GPT-3.5-turbo
- AI understands context and provides specific legal advice
- Responses are tailored to Saudi law
- Supports both Arabic and English
- Real-time processing with actual understanding

### Without API Key (Enhanced Mock Mode):
- Uses intelligent fallback responses
- Still contextual based on case type and language
- Better than generic responses
- Good for demo/development

## 📊 AI Features

### Smart Legal Understanding:
- **Case Type Recognition**: Commercial, Labor, Family law
- **Bilingual Support**: Arabic (RTL) and English (LTR)
- **Saudi Law Focus**: Specialized in Saudi legal system
- **Structured Responses**: Answer + References + Suggestions

### Example Real AI Response:
```json
{
  "answer": "As a foreigner, you can establish a business in Saudi Arabia through several mechanisms under the Foreign Investment Law. The Saudi Arabian General Investment Authority (SAGIA) facilitates foreign investment...",
  "references": [
    {"title": "Foreign Investment Law - Article 3", "relevance": "high"},
    {"title": "Commercial Registration Law", "relevance": "medium"}
  ],
  "suggestions": [
    "Apply for foreign investor license through SAGIA",
    "Choose appropriate business structure (LLC, Branch, etc.)",
    "Ensure compliance with Saudization requirements"
  ],
  "confidence": 0.87
}
```

## 🛡️ Security & Compliance

- API keys are stored securely in environment variables
- No legal advice stored or logged
- Responses include appropriate disclaimers
- Confidence scores help users understand reliability

## 🧪 Testing AI Integration

### Test Real Questions:
```bash
# Commercial Law Question
curl -X POST -H "Content-Type: application/json" \
  -d '{"question":"ما هي شروط تأسيس شركة في السعودية؟","caseType":"commercial","language":"ar"}' \
  http://localhost:5000/api/v1/ai/consultation

# Labor Law Question  
curl -X POST -H "Content-Type: application/json" \
  -d '{"question":"What are employee rights in Saudi Arabia?","caseType":"labor","language":"en"}' \
  http://localhost:5000/api/v1/ai/consultation
```

## 💡 Why This Approach Works

1. **Graceful Fallback**: Works without API key for development
2. **Production Ready**: Just add API key for full AI power
3. **Cost Effective**: Enhanced mocks for testing, real AI for production
4. **Bilingual**: Proper Arabic legal terminology and English precision
5. **Contextual**: Understands different types of legal cases

The system is now **AI-ready** and will provide intelligent, context-aware legal consultations! 🎯
