<template>
    <div class="about">
        <span class="about-title">About</span>

        <p>Created by Ellie A. (<a href="https://www.github.com/fangerm">fangerm on GitHub</a>)</p>
        <p>Runs on Django and Vue.</p>
        <p>Repository can be found on <a href="https://www.github.com/fangerm/musictube">GitHub</a> or <a href="https://gitea.angm.xyz/ellie/musictube">gitea</a>.</p>
    </div>
</template>

<script>
export default {}
</script>

<style lang="sass">
@import '../sass/colors'

.about
    padding: 20px
    box-shadow: 0 5px 10px 3px $shadow
    color: $settings-text
    background-color: $tr

.about-title
    margin: 0
    padding: 0
    text-align: center
    font-size: 1.3em

a

</style>
