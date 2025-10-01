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
<div class="max-w-3xl mx-auto flex flex-col gap-2 mb-4">
  <div class="alert alert-info shadow-sm">
    <span class="font-semibold">Stripe integration:</span> <span>Coming soon! Subscription and billing features will be available in a future update.</span>
  </div>
  <div class="alert alert-warning shadow-sm">
    <span class="font-semibold">Turnstile integration:</span> <span>Not currently required, but will be implemented in the future for enhanced security.</span>
  </div>
</div>
<div class="mb-6">
  <div class="tabs tabs-boxed w-full flex flex-wrap justify-center">
    <button class="tab" class:tab-active={tab==='timeline'} on:click={() => tab = 'timeline'}>Timeline</button>
    <button class="tab" class:tab-active={tab==='kanban'} on:click={() => tab = 'kanban'}>Kanban</button>
    <button class="tab" class:tab-active={tab==='rawnotes'} on:click={() => tab = 'rawnotes'}>RawNotes</button>
    <button class="tab" class:tab-active={tab==='brainstorm'} on:click={() => tab = 'brainstorm'}>Brainstorm</button>
    <button class="tab" class:tab-active={tab==='hypothesis'} on:click={() => tab = 'hypothesis'}>HypothesisTracker</button>
    <button class="tab" class:tab-active={tab==='unified'} on:click={() => tab = 'unified'}>UnifiedView</button>
  </div>
</div>
{#if tab === 'timeline'}
  <div class="card bg-base-100 shadow-md p-6 max-w-2xl mx-auto">
    <h3 class="card-title mb-4">Timeline</h3>
    {#if loading}
      <div class="flex justify-center items-center"><span class="loading loading-spinner loading-md"></span></div>
    {:else if error}
      <div class="alert alert-error mb-4">{error}</div>
    {:else}
      <ul class="mb-4 space-y-2">
        {#each entries as entry}
          <li class="flex items-center gap-2"><span class="badge badge-outline badge-info">{entry.timestamp}</span> <span>{entry.content}</span></li>
        {/each}
      </ul>
      <form class="flex gap-2" on:submit|preventDefault={addEntry}>
        <input class="input input-bordered flex-1" bind:value={newContent} placeholder="Add timeline entry..." required />
        <button class="btn btn-primary" type="submit" disabled={creating}>{creating ? 'Adding...' : 'Add Entry'}</button>
      </form>
    {/if}
  </div>
{:else if tab === 'kanban'}
  <div class="card bg-base-100 shadow-md p-6 max-w-4xl mx-auto">
    <h3 class="card-title mb-4">Kanban</h3>
    {#if loading}
      <div class="flex justify-center items-center"><span class="loading loading-spinner loading-md"></span></div>
    {:else if error}
      <div class="alert alert-error mb-4">{error}</div>
    {:else}
      <div class="flex gap-6 flex-wrap">
        {#each ['to_try','in_progress','done','blocked'] as col}
          <div class="min-w-[180px] flex-1">
            <h4 class="font-semibold capitalize mb-2">{col.replace('_',' ')}</h4>
            <ul class="space-y-2">
              {#each entries.filter(e => (e.status||'to_try')===col) as entry}
                <li class="card card-compact bg-base-200 p-3 flex flex-col gap-2">
                  <div>{entry.content}</div>
                  <div class="join">
                    {#each ['to_try','in_progress','done','blocked'] as s}
                      {#if s!==col}
                        <button class="btn btn-xs btn-outline join-item" on:click={() => updateStatus(entry.id, s)}>{s.replace('_',' ')}</button>
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
  <div class="card bg-base-100 shadow-md p-6 max-w-2xl mx-auto">
    <h3 class="card-title mb-4">RawNotes</h3>
    <form class="mb-4 flex flex-col gap-2" on:submit|preventDefault={addRawNote}>
      <textarea class="textarea textarea-bordered w-full" bind:value={rawNoteContent} placeholder="Quick note..." rows="2" required></textarea>
      <button class="btn btn-primary self-end" type="submit" disabled={addingRawNote}>{addingRawNote ? 'Adding...' : 'Add Note'}</button>
      {#if rawNoteError}
        <div class="alert alert-error mt-2">{rawNoteError}</div>
      {/if}
    </form>
    <ul class="space-y-2">
      {#each entries.filter(e => (e.entry_type||'note')==='note') as note}
        <li class="flex items-center gap-2"><span class="badge badge-outline badge-info">{note.timestamp}</span> <span>{note.content}</span>
          <button class="btn btn-xs btn-outline ml-2" on:click={() => convertNote(note.id)}>Convert to Timeline</button>
        </li>
      {/each}
    </ul>
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
  <div class="card bg-base-100 shadow-md p-6 max-w-2xl mx-auto">
    <h3 class="card-title mb-4">Brainstorm</h3>
    <form class="mb-4 flex gap-2" on:submit|preventDefault={addBrainstorm}>
      <input class="input input-bordered flex-1" bind:value={brainstormContent} placeholder="Add brainstorm idea..." required />
      <button class="btn btn-primary" type="submit" disabled={addingBrainstorm}>{addingBrainstorm ? 'Adding...' : 'Add Idea'}</button>
    </form>
    {#if brainstormError}
      <div class="alert alert-error mb-2">{brainstormError}</div>
    {/if}
    <ul class="space-y-2">
      {#each brainstorm_items as item}
        <li class="flex items-center gap-2"><span class="badge badge-outline badge-info">{item.created_date}</span> <span>{item.content}</span> <span class="badge badge-ghost badge-sm">[{item.category}]</span></li>
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
  <div class="card bg-base-100 shadow-md p-6 max-w-2xl mx-auto">
    <h3 class="card-title mb-4">HypothesisTracker</h3>
    <form class="mb-4 flex flex-col md:flex-row gap-2" on:submit|preventDefault={addHypothesis}>
      <input class="input input-bordered flex-1" bind:value={hypothesisDescription} placeholder="Describe hypothesis..." required />
      <select class="select select-bordered" bind:value={hypothesisConfidence}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button class="btn btn-primary" type="submit" disabled={addingHypothesis}>{addingHypothesis ? 'Adding...' : 'Add Hypothesis'}</button>
    </form>
    {#if hypothesisError}
      <div class="alert alert-error mb-2">{hypothesisError}</div>
    {/if}
    <ul class="space-y-2">
      {#each hypothesis as h}
        <li class="flex items-center gap-2"><span class="badge badge-outline badge-info">{h.created_date}</span> <span>{h.description}</span> <span class="badge badge-ghost badge-sm">[{h.confidence}]</span></li>
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
  <div class="card bg-base-100 shadow-md p-6 max-w-4xl mx-auto">
    <h3 class="card-title mb-4">UnifiedView</h3>
    <div class="mb-6">
      <strong>Quick Stats:</strong>
      <div class="stats stats-vertical md:stats-horizontal shadow">
        <div class="stat">
          <div class="stat-title">Timeline Entries</div>
          <div class="stat-value">{entries.length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Kanban (To Try)</div>
          <div class="stat-value">{entries.filter(e => (e.status||'to_try')==='to_try').length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Kanban (In Progress)</div>
          <div class="stat-value">{entries.filter(e => e.status==='in_progress').length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Kanban (Done)</div>
          <div class="stat-value">{entries.filter(e => e.status==='done').length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Kanban (Blocked)</div>
          <div class="stat-value">{entries.filter(e => e.status==='blocked').length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Brainstorm Ideas</div>
          <div class="stat-value">{brainstorm_items.length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Hypotheses</div>
          <div class="stat-value">{hypothesis.length}</div>
        </div>
      </div>
    </div>
    <div class="flex flex-col md:flex-row gap-8">
      <div class="flex-1">
        <h4 class="font-semibold mb-2">Timeline</h4>
        <ul class="space-y-2">
          {#each entries as entry}
            <li class="flex items-center gap-2"><span class="badge badge-outline badge-info">{entry.timestamp}</span> <span>{entry.content}</span> <span class="badge badge-ghost badge-sm">[{entry.status}]</span></li>
          {/each}
        </ul>
      </div>
      <div class="flex-1">
        <h4 class="font-semibold mb-2">Brainstorm</h4>
        <ul class="space-y-2">
          {#each brainstorm_items as item}
            <li class="flex items-center gap-2"><span class="badge badge-outline badge-info">{item.created_date}</span> <span>{item.content}</span> <span class="badge badge-ghost badge-sm">[{item.category}]</span></li>
          {/each}
        </ul>
        <h4 class="font-semibold mt-4 mb-2">Hypotheses</h4>
        <ul class="space-y-2">
          {#each hypothesis as h}
            <li class="flex items-center gap-2"><span class="badge badge-outline badge-info">{h.created_date}</span> <span>{h.description}</span> <span class="badge badge-ghost badge-sm">[{h.confidence}]</span></li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}