class HomePage {
  /**
   * define selectors using getter methods
   */
  public get cityInput() {
    return $('#search-bar');
  }
  public get cityInfo() {
    return $('.contentContainer');
  }
  public get cityChart() {
    return $('.chartPage');
  }

  public async enterCity(city: string) {
    await this.cityInput.setValue(city);
  }

  public openWebApp(port: number) {
    return browser.url(`http://localhost:${port.toString()}`);
  }
}

export default new HomePage();
