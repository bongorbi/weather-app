<template>
  <div class="info-fields-wrapper">
    <h1 v-if="info">
      {{ info }}
    </h1>
    <div
      v-for="(field,index) in fields"
      :key="index"
      class="label-field">
      <label v-if="field.label">{{ field.label }}</label>
      <input
        ref="input"
        v-bind="$attrs"
        class="input"
        required aria-required="true"
        @keyup.enter="$emit('input-field-enter', {data: $event.target.value, field: field.field})"
        @focusout="$emit('input-field-focusout', {data: $event.target.value, field: field.field})"
      />
    </div>
    <div class="label-field">
      <slot name="bottomContent"/>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

@Component({
  props: {
    fields: [],
    info: String
  }
})
export default class Input extends Vue {
  $refs!: {
    input: HTMLInputElement;
  };

  public focusInput() {
    this.$refs.input.focus();
  }

  public selectInput() {
    this.$refs.input.select();
  }

  public clearInput() {
    this.$refs.input.value = '';
  }

  public blurInput() {
    this.$refs.input.blur();
  }
}

</script>
<style scoped lang="scss">

.info-fields-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;

  & > * {
    margin: 0 0 3px 0;
  }

  & > .input {
    width: 30%;
  }

  & .label-field {
    label {
      width: 33%;
    }

    display: flex;
    align-items: center;
    justify-content: space-between;
    width: var(--inputWidth, 70%);

    .input {
      --fontSize: var(--inputFontSize, 2.5rem);
      flex-grow: 1;
      --inputHeight: 100%;
      --borderRadius: var(--inputBorderRadius, 3px);
    }
  }
}
</style>
