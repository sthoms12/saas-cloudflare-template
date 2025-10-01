<!-- Tracestack Session View Page (with tabs) -->
<script>
  // --- Raw Notes logic ---
  let rawNoteContent = '';
  let addingRawNote = false;
  let rawNoteError = '';

  async function addRawNote() {
    addingRawNote = true;
    rawNoteError = '';
    try {
      const res = await fetch('/(admin)/dashboard/api/tracestack/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, content: rawNoteContent, entry_type: 'note' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add note');
      rawNoteContent = '';
      await fetchEntries();
    } catch (e) {
      rawNoteError = e.message;
    } finally {
      addingRawNote = false;
    }
  }

  async function convertNote(noteId) {
    try {
      const res = await fetch('/(admin)/dashboard/api/tracestack/entries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId, entry_type: 'step', status: 'to_try' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to convert note');
      await fetchEntries();
    } catch (e) {
      alert(e.message);
    }
  }
  let tab = 'timeline';
  import { onMount } from 'svelte';
  let sessionId = '';
  let entries = [];
  let loading = true;
  let error = '';
  let newContent = '';
  let creating = false;

  // For demo: get sessionId from query param (replace with real routing in production)
  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    sessionId = params.get('id') || '';
    if (sessionId) fetchEntries();
  });

  async function fetchEntries() {
    loading = true;
    error = '';
    try {
      const res = await fetch(`/(admin)/dashboard/api/tracestack/entries?session_id=${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch entries');
      entries = await res.json();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function addEntry() {
    creating = true;
    error = '';
    try {
      const res = await fetch('/(admin)/dashboard/api/tracestack/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, content: newContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add entry');
      newContent = '';
      await fetchEntries();
    } catch (e) {
      error = e.message;
    } finally {
      creating = false;
    }
  }

  // Update entry status
  async function updateStatus(entryId, newStatus) {
    error = '';
    try {
      const res = await fetch('/(admin)/dashboard/api/tracestack/entries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entryId, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      await fetchEntries();
    } catch (e) {
      error = e.message;
    }
  }

  // --- Brainstorm logic ---
  let brainstorm_items = [];
  let brainstormContent = '';
  let addingBrainstorm = false;
  let brainstormError = '';

  async function fetchBrainstorm() {
    if (!sessionId) return;
    try {
      const res = await fetch(`/(admin)/dashboard/api/tracestack/brainstorm?session_id=${sessionId}`);
      brainstorm_items = res.ok ? await res.json() : [];
    } catch {}
  }

  async function addBrainstorm() {
    addingBrainstorm = true;
    brainstormError = '';
    try {
      const res = await fetch('/(admin)/dashboard/api/tracestack/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, content: brainstormContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add idea');
      brainstormContent = '';
      await fetchBrainstorm();
    } catch (e) {
      brainstormError = e.message;
    } finally {
      addingBrainstorm = false;
    }
  }

  // --- Hypothesis logic ---
  let hypothesis = [];
  let hypothesisDescription = '';
  let hypothesisConfidence = 'medium';
  let addingHypothesis = false;
  let hypothesisError = '';

  async function fetchHypotheses() {
    if (!sessionId) return;
    try {
      const res = await fetch(`/(admin)/dashboard/api/tracestack/hypothesis?session_id=${sessionId}`);
      hypothesis = res.ok ? await res.json() : [];
    } catch {}
  }

  async function addHypothesis() {
    addingHypothesis = true;
    hypothesisError = '';
    try {
      const res = await fetch('/(admin)/dashboard/api/tracestack/hypothesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, description: hypothesisDescription, confidence: hypothesisConfidence })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add hypothesis');
      hypothesisDescription = '';
      hypothesisConfidence = 'medium';
      await fetchHypotheses();
    } catch (e) {
      hypothesisError = e.message;
    } finally {
      addingHypothesis = false;
    }
  }

  // --- Fetch brainstorm and hypotheses on mount and when sessionId changes ---
  $: if (sessionId) { fetchBrainstorm(); fetchHypotheses(); }
</script>
<h2>Session View</h2>
<nav style="margin-bottom:1em;">
  <button on:click={() => tab = 'timeline'} class:active={tab==='timeline'}>Timeline</button>
  <button on:click={() => tab = 'kanban'} class:active={tab==='kanban'}>Kanban</button>
  <button on:click={() => tab = 'rawnotes'} class:active={tab==='rawnotes'}>RawNotes</button>
  <button on:click={() => tab = 'brainstorm'} class:active={tab==='brainstorm'}>Brainstorm</button>
  <button on:click={() => tab = 'hypothesis'} class:active={tab==='hypothesis'}>HypothesisTracker</button>
  <button on:click={() => tab = 'unified'} class:active={tab==='unified'}>UnifiedView</button>
</nav>
<style>
  button.active { font-weight: bold; text-decoration: underline; }
</style>
{#if tab === 'timeline'}
  <div>
    <h3>Timeline</h3>
    {#if loading}
      <p>Loading...</p>
    {:else if error}
      <p style="color:red">{error}</p>
    {:else}
      <ul>
        {#each entries as entry}
          <li>{entry.timestamp}: {entry.content}</li>
        {/each}
      </ul>
      <form on:submit|preventDefault={addEntry}>
        <input bind:value={newContent} placeholder="Add timeline entry..." required />
        <button type="submit" disabled={creating}>{creating ? 'Adding...' : 'Add Entry'}</button>
      </form>
    {/if}
  </div>
{:else if tab === 'kanban'}
  <div>
    <h3>Kanban</h3>
    {#if loading}
      <p>Loading...</p>
    {:else if error}
      <p style="color:red">{error}</p>
    {:else}
      <div style="display:flex;gap:2em;">
        {#each ['to_try','in_progress','done','blocked'] as col}
          <div style="min-width:180px;">
            <h4 style="text-transform:capitalize">{col.replace('_',' ')}</h4>
            <ul>
              {#each entries.filter(e => (e.status||'to_try')===col) as entry}
                <li style="margin-bottom:0.5em;">
                  <div>{entry.content}</div>
                  <div>
                    {#each ['to_try','in_progress','done','blocked'] as s}
                      {#if s!==col}
                        <button on:click={() => updateStatus(entry.id, s)}>{s.replace('_',' ')}</button>
                      {/if}
                    {/each}
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{:else if tab === 'rawnotes'}
  <div>
    <h3>RawNotes</h3>
    <form on:submit|preventDefault={addRawNote} style="margin-bottom:1em;">
      <textarea bind:value={rawNoteContent} placeholder="Quick note..." rows="2" style="width:100%" required></textarea>
      <button type="submit" disabled={addingRawNote}>{addingRawNote ? 'Adding...' : 'Add Note'}</button>
      {#if rawNoteError}
        <p style="color:red">{rawNoteError}</p>
      {/if}
    </form>
    <ul>
      {#each entries.filter(e => (e.entry_type||'note')==='note') as note}
        <li>{note.timestamp}: {note.content}
          <button style="margin-left:1em" on:click={() => convertNote(note.id)}>Convert to Timeline</button>
        </li>
      {/each}
    </ul>
    <!-- Convert a note to a Timeline entry (step) -->
    <script>
      async function convertNote(noteId) {
        try {
          const res = await fetch('/(admin)/dashboard/api/tracestack/entries', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: noteId, entry_type: 'step', status: 'to_try' })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to convert note');
          await fetchEntries();
        } catch (e) {
          alert(e.message);
        }
      }
    </script>
  </div>
  <script>
    let rawNoteContent = '';
    let addingRawNote = false;
    let rawNoteError = '';

    async function addRawNote() {
      addingRawNote = true;
      rawNoteError = '';
      try {
        const res = await fetch('/(admin)/dashboard/api/tracestack/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, content: rawNoteContent, entry_type: 'note' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add note');
        rawNoteContent = '';
        await fetchEntries();
      } catch (e) {
        rawNoteError = e.message;
      } finally {
        addingRawNote = false;
      }
    }
  </script>
{:else if tab === 'brainstorm'}
  <div>
    <h3>Brainstorm</h3>
    <form on:submit|preventDefault={addBrainstorm} style="margin-bottom:1em;">
      <input bind:value={brainstormContent} placeholder="Add brainstorm idea..." required />
      <button type="submit" disabled={addingBrainstorm}>{addingBrainstorm ? 'Adding...' : 'Add Idea'}</button>
      {#if brainstormError}
        <p style="color:red">{brainstormError}</p>
      {/if}
    </form>
    <ul>
      {#each brainstorm_items as item}
        <li>{item.created_date}: {item.content} <span style="font-size:0.9em;color:#888">[{item.category}]</span></li>
      {/each}
    </ul>
  </div>
  <script>
    // --- Brainstorm logic ---
    let brainstorm_items = [];
    let brainstormContent = '';
    let addingBrainstorm = false;
    let brainstormError = '';

    async function fetchBrainstorm() {
      if (!sessionId) return;
      try {
        const res = await fetch(`/(admin)/dashboard/api/tracestack/brainstorm?session_id=${sessionId}`);
        brainstorm_items = res.ok ? await res.json() : [];
      } catch {}
    }

    async function addBrainstorm() {
      addingBrainstorm = true;
      brainstormError = '';
      try {
        const res = await fetch('/(admin)/dashboard/api/tracestack/brainstorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, content: brainstormContent })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add idea');
        brainstormContent = '';
        await fetchBrainstorm();
      } catch (e) {
        brainstormError = e.message;
      } finally {
        addingBrainstorm = false;
      }
    }

    // --- Fetch brainstorm on mount and when sessionId changes ---
    $: if (sessionId) { fetchBrainstorm(); }
  </script>
{:else if tab === 'hypothesis'}
  <div>
    <h3>HypothesisTracker</h3>
    <form on:submit|preventDefault={addHypothesis} style="margin-bottom:1em;">
      <input bind:value={hypothesisDescription} placeholder="Describe hypothesis..." required />
      <select bind:value={hypothesisConfidence}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit" disabled={addingHypothesis}>{addingHypothesis ? 'Adding...' : 'Add Hypothesis'}</button>
      {#if hypothesisError}
        <p style="color:red">{hypothesisError}</p>
      {/if}
    </form>
    <ul>
      {#each hypothesis as h}
        <li>{h.created_date}: {h.description} <span style="font-size:0.9em;color:#888">[{h.confidence}]</span></li>
      {/each}
    </ul>
  </div>
  <script>
    // --- Hypothesis logic ---
    let hypothesis = [];
    let hypothesisDescription = '';
    let hypothesisConfidence = 'medium';
    let addingHypothesis = false;
    let hypothesisError = '';

    async function fetchHypotheses() {
      if (!sessionId) return;
      try {
        const res = await fetch(`/(admin)/dashboard/api/tracestack/hypothesis?session_id=${sessionId}`);
        hypothesis = res.ok ? await res.json() : [];
      } catch {}
    }

    async function addHypothesis() {
      addingHypothesis = true;
      hypothesisError = '';
      try {
        const res = await fetch('/(admin)/dashboard/api/tracestack/hypothesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, description: hypothesisDescription, confidence: hypothesisConfidence })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add hypothesis');
        hypothesisDescription = '';
        hypothesisConfidence = 'medium';
        await fetchHypotheses();
      } catch (e) {
        hypothesisError = e.message;
      } finally {
        addingHypothesis = false;
      }
    }

    // --- Fetch hypotheses on mount and when sessionId changes ---
    $: if (sessionId) { fetchHypotheses(); }
  </script>
{:else if tab === 'unified'}
  <div>
    <h3>UnifiedView</h3>
    <div style="margin-bottom:1em;">
      <strong>Quick Stats:</strong>
      <ul>
        <li>Total Timeline Entries: {entries.length}</li>
        <li>Kanban (To Try): {entries.filter(e => (e.status||'to_try')==='to_try').length}</li>
        <li>Kanban (In Progress): {entries.filter(e => e.status==='in_progress').length}</li>
        <li>Kanban (Done): {entries.filter(e => e.status==='done').length}</li>
        <li>Kanban (Blocked): {entries.filter(e => e.status==='blocked').length}</li>
        <li>Brainstorm Ideas: {brainstorm_items.length}</li>
        <li>Hypotheses: {hypothesis.length}</li>
      </ul>
    </div>
    <div style="display:flex;gap:2em;">
      <div style="flex:1;">
        <h4>Timeline</h4>
        <ul>
          {#each entries as entry}
            <li>{entry.timestamp}: {entry.content} <span style="font-size:0.9em;color:#888">[{entry.status}]</span></li>
          {/each}
        </ul>
      </div>
      <div style="flex:1;">
        <h4>Brainstorm</h4>
        <ul>
          {#each brainstorm_items as item}
            <li>{item.created_date}: {item.content} <span style="font-size:0.9em;color:#888">[{item.category}]</span></li>
          {/each}
        </ul>
        <h4>Hypotheses</h4>
        <ul>
          {#each hypothesis as h}
            <li>{h.created_date}: {h.description} <span style="font-size:0.9em;color:#888">[{h.confidence}]</span></li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}