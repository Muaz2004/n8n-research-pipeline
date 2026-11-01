document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('research-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusMessage = document.getElementById('status-message');

  const urlParams = new URLSearchParams(window.location.search);
  const webhookUrl = urlParams.get('webhook') || window.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/research-request';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const topic = document.getElementById('topic').value.trim();
    const subtopics = document.getElementById('subtopics').value.trim();
    const description = document.getElementById('description').value.trim();
    const reviewer_email = document.getElementById('reviewer_email').value.trim();

    if (!topic || !reviewer_email) {
      statusMessage.className = 'status-message error';
      statusMessage.textContent = 'Please provide both a topic and a reviewer email.';
      return;
    }

    const payload = {
      topic,
      subtopics,
      description,
      reviewer_email,
      submitted_at: new Date().toISOString()
    };

    submitBtn.disabled = true;
    statusMessage.className = 'status-message submitting';
    statusMessage.textContent = 'Submitting task to n8n pipeline...';

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      statusMessage.className = 'status-message success';
      statusMessage.textContent = '✓ Research task dispatched successfully.';
      form.reset();
    } catch (err) {
      statusMessage.className = 'status-message error';
      statusMessage.textContent = `Submission failed (${err.message}). Check webhook URL.`;
    } finally {
      submitBtn.disabled = false;
    }
  });
});
