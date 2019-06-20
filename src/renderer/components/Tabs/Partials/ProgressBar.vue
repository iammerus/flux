<template>
    <div class="progress">
        <div class="progress-bar">
            <div class="inner" :style="{width: (progressAsWidth + '%')}"></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ProgressBar",
        data() {
            return {
                progressAsWidth: 0
            }
        },
        created() {
            this.$eventHub.$on('player.track.progress.changed', (progress, duration) => {
                this.progressAsWidth = (progress / duration) * 100
            });

            this.$eventHub.$on('player.state.changed', (state) => {
                if (state === 'stopped') this.progressAsWidth = 0;
            })
        }
    }
</script>

<style scoped lang="scss">
    .progress-bar {
        width: 100%;
        height: 10px;
        background: #ccc;

        .inner {
            height: 100%;
            background: aqua;
            transition: width ease-in-out 50ms;
        }
    }
</style>