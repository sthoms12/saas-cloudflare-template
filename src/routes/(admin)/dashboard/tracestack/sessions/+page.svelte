<!-- Tracestack Sessions List Page -->
<script>
  import { onMount } from 'svelte';
  let sessions = [];
  let loading = true;
  let error = '';

  async function fetchSessions() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/(admin)/dashboard/api/tracestack/sessions');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      sessions = await res.json();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  onMount(fetchSessions);
</script>
<h2>Sessions</h2>
{#if loading}
  <p>Loading...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else if sessions.length === 0}
  <p>No sessions found.</p>
{:else}
  <ul>
    {#each sessions as session}
      <li><strong>{session.title}</strong> — {session.status} ({session.priority})</li>
    {/each}
  </ul>
{/if}