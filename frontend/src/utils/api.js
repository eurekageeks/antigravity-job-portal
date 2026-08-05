/**
 * Safely parse a fetch Response as JSON.
 * Falls back gracefully if the body is empty or not JSON.
 */
export const safeJson = async (response) => {
  const text = await response.text();
  if (!text || text.trim() === '') {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    // Backend returned plain text (e.g. HTML error page)
    return { message: text.substring(0, 200) };
  }
};
