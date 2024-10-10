import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai'

const runtimeConfig = useRuntimeConfig()

const apiKey = process.env.VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(apiKey!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 512,
}   

let chatSession: ChatSession

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!chatSession) {
    chatSession = model.startChat({ generationConfig })
  }

  try {
    const result = await chatSession.sendMessage(body.message)
    return { message: result.response.text()}
  } catch (error) {
    console.error('Error in chat API:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while processing your request.',
    })
  }
})