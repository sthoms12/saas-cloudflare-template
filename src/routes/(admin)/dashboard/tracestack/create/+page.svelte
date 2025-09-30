<!-- Tracestack Create Session Page -->
<script>
  import { goto } from '$app/navigation';
  let title = '';
  let description = '';
  let priority = 'medium';
  let error = '';
  let loading = false;

  async function createSession() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/(admin)/dashboard/api/tracestack/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create session');
      // Redirect to sessions list or session view
      goto('/(admin)/dashboard/tracestack/sessions');
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>
<h2>Create Session</h2>
<form on:submit|preventDefault={createSession}>
  <label>
    Title:
    <input bind:value={title} required />
  </label>
  <br />
  <label>
    Description:
    <textarea bind:value={description}></textarea>
  </label>
  <br />
  <label>
    Priority:
    <select bind:value={priority}>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </label>
  <br />
  <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Session'}</button>
  {#if error}
    <p style="color:red">{error}</p>
  {/if}
</form>