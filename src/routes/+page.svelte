<script lang="ts">
    import { landCopters } from "$lib/landCopters";
    import { store } from "$lib/store";

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
            }
        }
    }
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
            <textarea type="text" value={group.text} />
        {/each}
    </div>
    <div><button on:click={calculate}>calculate</button></div>
{/if}

<div class="w-full flex flex-wrap">
    {#each samples as layerlist}
        <div class="relative" style="width:100px;height:200px">
            {#each layerlist as layer}
                {#if layer.change}
                    <img
                        class="absolute"
                        style="width:100px;height:200px;"
                        src="bitmasks/export/{layer.change}"
                        alt=""
                    />
                {/if}
                <img
                    class="absolute"
                    style="width:100px;height:200px;"
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
