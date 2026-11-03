const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Then('the navigation menu should contain {string}', async function (label) {
  await expect(this.practicePage.navLinks.filter({ hasText: label })).toBeVisible();
});

When('I fill the practice form with:', async function (dataTable) {
  const data = dataTable.rowsHash();
  await this.practicePage.nameInput.fill(data.name);
  await this.practicePage.emailInput.fill(data.email);
  await this.practicePage.phoneInput.fill(data.phone);
  await this.practicePage.addressInput.fill(data.address);
  if ((data.gender || '').toLowerCase() === 'female') {
    await this.practicePage.femaleRadio.check();
  } else {
    await this.practicePage.maleRadio.check();
  }
});

Then('the name field should show {string}', async function (value) {
  await expect(this.practicePage.nameInput).toHaveValue(value);
});

Then('the email field should show {string}', async function (value) {
  await expect(this.practicePage.emailInput).toHaveValue(value);
});
