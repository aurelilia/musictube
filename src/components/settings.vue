<template>
<div class="settings">
    <p class="settings-title">Settings</p>

    <a class="checkbox" @click="$emit('update:scroll_title', !scroll_title)">
        <i class="fa" :class="{'fa-check-square-o': scroll_title, 'fa-square-o': !scroll_title}" aria-hidden="true"></i>
        Scroll tab title
    </a>

    <p class="settings-theme-text">Theme</p>
    <select class="settings-theme" id="settings-theme" @change="$emit('update:theme')">
        <option v-for="t in themes" :value="t" :key="t" :selected="t === theme">{{ t }}</option>
    </select>
</div>
</template>

<script>
export default {
    props: ['themes', 'theme', 'scroll_title'],
}
</script>

<style lang="sass">

.settings
    padding: 20px
    margin: 0

.settings-title
    margin: 0
    padding: 0
    text-align: center
    font-size: 1.3em

.settings-theme-text
    display: inline-block
    padding: 0 20px
    margin: 5px 0 20px

.settings-theme
    background-color: rgba(#000, 0)
    border: none

    -moz-appearance: none
    -webkit-appearance: none
    appearance: none
    width: 20%

</style>
