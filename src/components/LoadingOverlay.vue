<template>
  <div class="loading-overlay">
    <div class="spinner"/>
  </div>
</template>

<script lang="ts">
import {Vue} from 'vue-property-decorator';

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
  background-color: rgba($whitish, 0.7);
  position: var(--loading-overlay-position, fixed);
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  .spinner {
    box-sizing: border-box;
    border: var(--loading-overlay-spinner-border-size, 10px) solid black;
    border-radius: 50%;
    z-index: 1111111;
    width: var(--loading-overlay-spinner-size, 115px);
    height: var(--loading-overlay-spinner-size, 115px);
    -webkit-animation: spin 1.1s infinite linear;
    font-size: 10px;
    border-left: .8em solid $whitish;
    animation: spin 1.1s infinite linear;
    left: 50%;
    top: 50%;
    position: absolute;
    margin-left: -50px;
    margin-top: -50px;
  }

  .spinner, .spinner:after {
    display: block;
    position: absolute;
  }

  @keyframes spin {
    0% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
}
</style>
