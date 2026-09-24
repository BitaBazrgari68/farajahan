const WORDPRESS_URL = 'https://farajahan.com';

export async function wordpressFetch(endpoint, options = {}) {
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

  if (!response.ok) {
    throw new Error(
      `WordPress API Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}