
/**
 * Generates a deterministic fallback pseudo-embedding vector in memory 
 * when heavy external LLM models providers are completely offline.
 */
function createLocalEmbedding(text) {
  const normalized = String(text || '').toLowerCase();
  const seed = [...normalized].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dimensions = Number(process.env.VECTOR_DIMENSIONS || 384);
  
  return Array.from({ length: dimensions }, (_, index) => {
    // Deterministic mathematical vector calculation over dimensions mapping array
    const value = Math.sin((seed + index + 1) * 0.7) * 0.5 + Math.cos((index + 1) * 0.3) * 0.25;
    return Number(value.toFixed(6));
  });
}

/**
 * Validates connection statuses or quota limitation exceptions on Gemini instances
 */
function isGeminiUnavailable(error) {
  const status = error?.status || error?.response?.status;
  const message = `${error?.message || ''} ${error?.statusText || ''}`.toLowerCase();
  return status === 404 || status === 429 || message.includes('quota') || message.includes('not found') || message.includes('rate limit');
}

/**
 * Validates connection statuses, unauthorized token access, or rate limitation bounds on Hugging Face API
 */
function isHuggingFaceUnavailable(error) {
  const status = error?.status || error?.response?.status;
  const message = `${error?.message || ''} ${error?.statusText || ''}`.toLowerCase();
  return status === 401 || status === 403 || status === 429 || message.includes('token') || message.includes('rate limit') || message.includes('not found');
}

/**
 * Compiles a structured, user-friendly conversational block when cloud completion gateways time out
 */
function createFallbackResponse(userMessage, context = {}) {
  const lowerMessage = String(userMessage || '').toLowerCase();
  const hasProductQuery = /product|buy|look|search|find|recommend|need|want/i.test(lowerMessage);
  
  const queryMatch = String(userMessage || '').match(/(?:find|search|looking for|need|want|recommend|buy)\s+(.+)/i);
  const queryText = queryMatch ? queryMatch[1].trim() : '';
  
  if (hasProductQuery) {
    if (queryText) {
      return `I’m currently unable to reach the Gemini API, so I can’t generate a live recommendation for "${queryText}" right now. Please try again shortly, or browse our products directly for the best available options.`;
    }
    return "I’m currently unable to reach the Gemini API, so I can’t generate a live recommendation right now. Please try again shortly, or browse our products directly for the best available options.";
  }
  
  return "I’m currently unable to reach the AI service, but I can still help you browse products or check order status manually. Please try again shortly.";
}

module.exports = {
  createLocalEmbedding,
  isGeminiUnavailable,
  isHuggingFaceUnavailable,
  createFallbackResponse
};