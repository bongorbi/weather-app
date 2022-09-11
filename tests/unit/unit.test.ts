import {shallowMount} from '@vue/test-utils';
import App from '../../src/App.vue';

describe('Test the Weather app', () => {
  const wrapper = shallowMount(App);

  it('Return the correct response object from the request for weather forecast when searching city by name', async () => {
    await wrapper.setData({query: 'Sofia'});

    expect(await wrapper.vm.getWeatherBySearchQuery()).toHaveProperty('main');
    expect(await wrapper.vm.getWeatherBySearchQuery()).toHaveProperty('weather');
    expect(await wrapper.vm.getWeatherBySearchQuery()).toHaveProperty('name', 'Sofia');
  });
  it('Return the correct response object from the request when getting the weather forecast by coordinates', async () => {
    await wrapper.setData({coords: {lon: 2.154007, lat: 41.390205}});

    expect(await wrapper.vm.getWeatherByCoordsQuery()).toHaveProperty('main');
    expect(await wrapper.vm.getWeatherByCoordsQuery()).toHaveProperty('weather');
    expect(await wrapper.vm.getWeatherByCoordsQuery()).toHaveProperty('name', 'Barcelona');
  });
});
