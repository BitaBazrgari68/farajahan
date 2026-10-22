const WORDPRESS_URL = 'https://farajahan.com';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function wordpressFetch(endpoint, options = {}) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let retryable = true;

    try {
      const response = await fetch(
        `${WORDPRESS_URL}/wp-json/${endpoint}`,
        {
          ...options,
          next: {
            revalidate: 60,
            ...options.next,
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }

      lastError = new Error(
        `WordPress API Error: ${response.status} ${response.statusText}`
      );

      // خطای ۴xx (مثل ۴۰۴) با تکرار درست نمی‌شود
      retryable = response.status >= 500;
    } catch (error) {
      lastError = error;
    }

    if (!retryable || attempt === MAX_ATTEMPTS) break;

    await wait(RETRY_DELAY_MS * attempt);
  }

  throw lastError;
}