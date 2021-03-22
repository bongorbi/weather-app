<template>
  <div class="loading-overlay">
    <div class="spinner"/>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';

export default class LoadingOverlay extends Vue {
}

</script>
<style lang="scss" scoped>
@import "../colors";

/* Safari */
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-overlay {
  z-index: 10000;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba($whitish, 0.7);
  position: var(--loading-overlay-position, fixed);
  top: 0;
  left: 0;

  .spinner {
    box-sizing: border-box;
    border: var(--loading-overlay-spinner-border-size, 10px) solid black;
    border-top-color: $whitish;
    border-radius: 50%;
    width: var(--loading-overlay-spinner-size, 115px);
    height: var(--loading-overlay-spinner-size, 115px);
    -webkit-animation: spin-data-v-681413a4 1s cubic-bezier(0.4, 0.15, 0.6, 0.85) infinite;
    animation: spin-data-v-681413a4 1s cubic-bezier(0.4, 0.15, 0.6, 0.85) infinite;
  }
}
</style>
