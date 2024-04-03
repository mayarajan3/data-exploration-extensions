<script lang="ts">
  import type Extension from ".";
  import { ReactiveInvoke, reactiveInvoke, color, ReactivityDependency } from "$common";

  // svelte-ignore unused-export-let
  export let extension: Extension;
  // svelte-ignore unused-export-let
  export let close: () => void;

  const invoke: ReactiveInvoke<Extension> = (functionName, ...args) => reactiveInvoke((extension = extension), functionName, args);
  let fileContent = "";

  function handleFileUpload(event) {
    const file = event.target.files[0]; 
    const reader = new FileReader();

    reader.onload = () => {
      // When the file is loaded, set the fileContent variable to the text content
      fileContent = reader.result;
      invoke("setText", fileContent);
    };

    reader.readAsText(file); // Read the file as text
    return fileContent;

  }

  
  const container = true;
</script>

<style>
  .container {
    width: 360px;
    padding: 10px;
  }
  button {
    border-radius: 10px;
    font-size: 40px;
  }
  .text-content {
    height: 290px;
    
  }
  .file-content {
    height: 240px;
    border: 1px solid black;
    overflow: scroll;
    padding: 10px;
    margin: 10px;
  }
  p {
    margin-top: 6px;
    margin-bottom: 6px;
  }
  .button-container {
    width: 100%;
    text-align: center;
    position: relative;
    bottom: -10px;
  }
  button {
    font-size: 15px;
  }
  input {
    margin: 10px;
  }
  pre {
    margin: 0px;
    white-space: pre-wrap;
  }
</style>

<div class:container style:background-color={color.ui.white}>
  <input id="clickMe" type="file" accept=".txt" on:change={handleFileUpload}>
    <div class="text-content">
    <div class="file-content">
    {#if fileContent == ""}
      <pre>No file has been uploaded yet.</pre>
    {:else}
      <pre>{fileContent}</pre>
    {/if}
    </div>
    <div class="button-container">
    <button on:click={() => close()}>Upload file</button>
    </div>
    </div>
</div>