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
