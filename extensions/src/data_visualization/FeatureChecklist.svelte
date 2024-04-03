<script lang="ts">
    import Extension, { features } from ".";
    import { ParameterOf, ArgumentEntry, ArgumentEntrySetter, validGenericExtension } from "$common";
  
    type Value = ParameterOf<Extension, "createModel", 0>;
  
    // svelte-ignore unused-export-let
    export let setter: ArgumentEntrySetter<Value>;
  
    // svelte-ignore unused-export-let
    export let current: ArgumentEntry<Value>;
  
    // svelte-ignore unused-export-let
    export let extension: Extension;
    let checkedDict = {};
    let valueDict = {};
    let tempValue = current.text.split(", ");
    
    // Filtering out placeholder value
    tempValue = tempValue.filter(item => item !== "Nothing selected");
    // Creating the 2D array for x values
    let value = tempValue.map(str => {
        return [str.split(": ")[0], str.split(": ")[1]];
    });
    // Creating an array of features
    let curFeatures = tempValue.map((str) => {
        return str.split(": ")[0]
    })
    // Creating an array of prediction values
    let curValues = tempValue.map((str) => {
        return str.split(": ")[1];
    })
    // Initializing the checkbox and input HTML 
    for (let i = 0; i < features.length; i++) {
        if (curFeatures.includes(features[i])) {
            checkedDict[features[i]] = true;
            valueDict[features[i]] = curValues[curFeatures.indexOf(features[i])];
        } else {
            checkedDict[features[i]] = false;
        }
    }
    
    // Creating the display text
    $: text = value.length == 0 ? "Nothing selected" : value.reduce((str, cur) => {
        return str + ", " + cur[0] + ": " + cur[1];
    }, "placeholder").replace("placeholder, ", "");
  
    $: setter({ value, text });

    // Function for updating the text and value when a feature of value is updated
    function updateTextAndValue() {
        text = "placeholder";
        value = []
        for (let i = 0; i < features.length; i++) {
            if (checkedDict[features[i]]) {
                text = text + ", " + features[i] + ": " + valueDict[features[i]];
                value.push([features[i], valueDict[features[i]]])
            }
        }
        if (text == "placeholder") {
            text = "Nothing selected";
        }
        text = text.replace("placeholder, ", "");
    }

  </script>
  
  <div>
    {#each features as f}
    <div>
        <input type="checkbox" bind:checked={checkedDict[f]} on:change={(e) => {
            updateTextAndValue();
        }} id="{f}">
        <label for="{f}">
          {f}
        </label>
        <input type="text" bind:value={valueDict[f]} placeholder={valueDict[f] ? valueDict[f] : ""} on:input={(e) => {
            updateTextAndValue();
        }}>

      </div>
    {/each}
  </div>
  
  <style>
  </style>
  