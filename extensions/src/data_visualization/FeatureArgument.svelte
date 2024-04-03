<script lang="ts">
  import Extension, { features } from ".";
  import { ParameterOf, ArgumentEntry, ArgumentEntrySetter } from "$common";

  type Value = ParameterOf<Extension, "drawLinePlot", 0>;



  // svelte-ignore unused-export-let
  export let setter: ArgumentEntrySetter<Value>;

  // svelte-ignore unused-export-let
  export let current: ArgumentEntry<Value>;

  // svelte-ignore unused-export-let
  export let extension: Extension;
  let value = current.value;
  $: text = value;

  $: setter({ value, text });
</script>

<div>
  {#each features as f}
    <button on:click={() => {
        value = f; }}>
      {f}
    </button>
  {/each}
</div>

<style>
</style>
