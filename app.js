document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('research-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusMessage = document.getElementById('status-message');

  // Default endpoint for local n8n instance or configured webhook
  // Can be overridden via window.N8N_WEBHOOK_URL or query param
  const urlParams = new URLSearchParams(window.location.search);
  const webhookUrl = urlParams.get('webhook') || window.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/research-request';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      topic: document.getElementById('topic').value.trim(),
      subtopics: document.getElementById('subtopics').value.trim(),
      description: document.getElementById('description').value.trim(),
      reviewer_email: document.getElementById('reviewer_email').value.trim(),
      submitted_at: new Date().toISOString()
    };

    // UI Feedback: Submitting
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
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      statusMessage.className = 'status-message success';
      statusMessage.textContent = '✓ Request successfully dispatched to research pipeline.';
      form.reset();
    } catch (err) {
      statusMessage.className = 'status-message error';
      statusMessage.textContent = `Submission failed (${err.message}). Ensure n8n is running and webhook is active.`;
    } finally {
      submitBtn.disabled = false;
    }
  });
});
