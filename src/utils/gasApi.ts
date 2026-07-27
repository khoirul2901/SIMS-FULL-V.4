/// <reference types="vite/client" />

export const gasApiCall = async (action: string, data: any = {}) => {
  const url = import.meta.env.VITE_GAS_URL;
  if (!url) {
    console.warn('VITE_GAS_URL is not set. Using local mock data only.');
    return { status: 'error', message: 'GAS URL not configured' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, ...data })
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.error('Error calling GAS API:', err);
    return { status: 'error', message: String(err) };
  }
};
