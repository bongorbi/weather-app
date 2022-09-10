import HomePage from '../pageobjects/home.page';

describe('My Login application', () => {
  it("should open the home page, enter city in the input and get the information about it's weather", async () => {
    await browser.maximizeWindow();
    await HomePage.openWebApp(8080);
    await browser.pause(2000);
    await HomePage.enterCity('Moscow');
    await browser.pause(2000);
    await browser.keys('Enter');
    await browser.pause(2000);

    await expect(HomePage.cityChart).toBeExisting();
    await expect(HomePage.cityInfo).toBeExisting();
  });
});
