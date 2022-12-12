<template>
  <div>
    <button
      class="scrollButton"
      :class="customClass"
      @click="scrollEmitted">
      <font-awesome-icon
        aria-hidden="true"
        :icon="downButtonIcon"
        class="icon"/>
    </button>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

@Component({
  components: {
    FontAwesomeIcon
  }
})
export default class ScrollDownButton extends Vue {
  private scrollEmitted() {
    this.$emit('emit-scroll');
  }

  @Prop({default: ''})
  private downButtonIcon!: string;
  @Prop({default: ''})
  private customClass!: string;
}
</script>

<style scoped lang="scss">
@import "../colors";

.scrollButton {
  width: 100vw;
  height: 100%;
  background: $whitish;
  border: none;
  outline: none;
  font-size: 2rem;
}
</style>
