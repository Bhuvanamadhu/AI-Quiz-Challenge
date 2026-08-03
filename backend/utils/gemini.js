const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Utility to communicate with the Gemini API.
 * Uses native fetch or standard HTTP calls to keep dependencies lightweight.
 * 
 * @param {Array} contents - Array of objects in the format: { role: 'user'|'model', parts: [{ text: '...' }] }
 * @param {string} systemInstruction - The persona or grounding instructions for the model
 * @returns {Promise<string>} - The model's textual response
 */
async function generateGeminiContent(contents, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment variables (.env).');
  }

  // Ensure roles are strictly 'user' and 'model' as required by Gemini API spec
  const formattedContents = contents.map(c => {
    let role = c.role;
    if (role === 'assistant') role = 'model';
    if (role !== 'user' && role !== 'model') role = 'user';
    return {
      role,
      parts: Array.isArray(c.parts) ? c.parts : [{ text: c.content || c.text || '' }]
    };
  });

  const payload = {
    contents: formattedContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status} Error`;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const responseData = await response.json();
  const candidateText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('Gemini API returned an empty or invalid response format.');
  }

  return candidateText;
}

module.exports = {
  generateGeminiContent
};
