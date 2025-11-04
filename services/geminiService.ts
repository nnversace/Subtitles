export const generateSubtitlesFromText = async (
  text: string, 
  lang: 'en' | 'zh',
  onStreamUpdate: (chunk: string) => void
): Promise<void> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, lang }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const detail = errorText 
        ? `Server returned: "${errorText}"` 
        : 'The server returned an empty error response. This often happens if the server is misconfigured (e.g., a missing API key) or crashed. Please check your server logs.';
      throw new Error(`Server request failed with status ${response.status}. ${detail}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      onStreamUpdate(chunk);
    }
  } catch (error) {
    console.error("Error fetching from backend API:", error);
    // Re-throw the more specific error from the try block or a generic one for network errors.
    if (error instanceof Error) {
       throw error;
    }
    throw new Error("An unknown error occurred while communicating with the server.");
  }
};