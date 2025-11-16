const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://example.com/api/v1';
const shouldMock = API_BASE_URL.includes('example.com');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  if (data.success === false) {
    throw new Error(data.message || 'Server returned an error.');
  }
  return data;
};

export async function uploadImage(file) {
  if (shouldMock) {
    await wait(1200);
    return {
      success: true,
      url: URL.createObjectURL(file),
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/images/upload`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function generateCard(payload) {
  if (shouldMock) {
    await wait(2500);
    return {
      success: true,
      title: 'The Journey of Cell Division',
      desc: 'Watch mitosis unfold to see how chromosomes duplicate and split between daughter cells.',
      central_object: 'Cells under a microscope',
      highlighted_image_url: '',
      audio_url: '',
    };
  }

  const response = await fetch(`${API_BASE_URL}/cards/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function chatWithCard(payload) {
  if (shouldMock) {
    await wait(1800);
    return {
      success: true,
      answer: 'Mitosis usually wraps in about 24 hours as the cell grows, copies DNA, and divides.',
      conversation_id: 'mock-conv-id',
      audio_url: '',
    };
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}
