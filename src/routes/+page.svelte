<script lang="ts">
    import { landCopters } from "$lib/landCopters";
    import { store } from "$lib/store";
    import {onMount} from "svelte";

    function onPaste(event) {
        event.preventDefault();
        let paste = (event.clipboardData || window.clipboardData).getData(
            "text"
        );
    }

    let fragmentGroups = [{ text: "giganose" }, { text: "mask" }];
    let samples = [];

    let showGroups = true;
    function toggleGroups() {
        showGroups = !showGroups;
    }
    function calculate() {
        samples = [];
        let candidates = fragmentGroups.map((g) =>
            store.fragments.filter((f) => f.tags.includes(g.text))
        );
        for (let i = 0; i < candidates[0].length; i++) {
            for (let j = 0; j < candidates[1].length; j++) {
                const fragments = landCopters(JSON.parse(JSON.stringify([candidates[0][i], candidates[1][j]])));
                samples.push(
                    fragments.flatMap(f => f.layers).sort((a, b) => a.order - b.order)
                );
                console.log(fragments.flatMap(f => f.layers).filter(l => !l.copterOffsetY))
            }
        }
    }

    const previewWidth =     300;
    const previewHeight =    previewWidth * 965/581;

    onMount(calculate)
</script>

<svelte:window on:paste={onPaste} />
<div>
    <button on:click={toggleGroups}>
        {#if showGroups}
            -
        {:else}
            +
        {/if}
        groups</button
    >
</div>

{#if showGroups}
    <div class="flex flex-col">
        {#each fragmentGroups as group}
            <textarea type="text" bind:value={group.text} />
        {/each}
    </div>
    <div><button on:click={calculate}>calculate</button></div>
{/if}

<div class="w-full flex flex-wrap">
    {#each samples as layerlist}
        <div class="relative" style="width:{previewWidth}px;height:{previewHeight}px">
            {#each layerlist as layer, index}
                {#if layer.change}
                    <img
                        class="absolute"
                        style={`height:${
                            previewHeight *
                            (layer.copterScale ?? 1)
                        }px; width:${
                            previewWidth *
                            (layer.copterScale ?? 1)
                        }px; top:${
                            (layer.copterOffsetY
                                ? layer.copterOffsetY * previewHeight
                                : 0)
                        }px;left:${
                            (layer.copterOffsetX
                                ? layer.copterOffsetX * previewWidth
                                : 0)
                        }px;`}
                        src="bitmasks/export/{layer.change}"
                        alt=""
                    />
                {/if}
                <img
                    class="absolute"
                    style={`height:${
                        previewHeight *
                        (layer.copterScale ?? 1)
                    }px; width:${
                        previewWidth *
                        (layer.copterScale ?? 1)
                    }px; top:${
                        (layer.copterOffsetY
                            ? layer.copterOffsetY * previewHeight
                            : 0)
                    }px;left:${
                        (layer.copterOffsetX
                            ? layer.copterOffsetX * previewWidth
                            : 0)
                    }px;`}
                    src="bitmasks/export/{layer.outline}"
                    alt=""
                />
            {/each}
        </div>
    {/each}
</div>

<style>
    textarea {
        border: 1px solid black;
    }
</style>
