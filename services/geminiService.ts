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
      throw new Error(`Failed to generate subtitles: ${errorText}`);
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
    if (error instanceof Error) {
       throw new Error(`Failed to generate subtitles. Please check your server and try again. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the server.");
  }
};
