const path = require('path');
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/**
 * Page Object for https://testautomationpractice.blogspot.com/
 * Covers every widget shown across the practice-site screenshots.
 */
class AutomationPracticePage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    // Navigation
    this.navLinks = page.locator('#PageList2 a');

    // Form
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('#phone');
    this.addressInput = page.locator('#textarea');
    this.maleRadio = page.locator('#male');
    this.femaleRadio = page.locator('#female');
    this.countrySelect = page.locator('#country');
    this.colorsSelect = page.locator('#colors');
    this.animalsSelect = page.locator('#animals');

    // Date pickers
    this.datePicker1 = page.locator('#datepicker');
    this.datePicker2 = page.locator('#txtDate');
    this.startDate = page.locator('#start-date');
    this.endDate = page.locator('#end-date');
    this.dateRangeSubmit = page.locator('button.submit-btn');
    this.dateRangeResult = page.locator('#result');

    // Wikipedia
    this.wikiSearchInput = page.locator('#Wikipedia1_wikipedia-search-input');
    this.wikiSearchButton = page.locator('.wikipedia-search-button');
    this.wikiResults = page.locator('#Wikipedia1_wikipedia-search-results');

    // Dynamic button (class toggles between .start / .stop)
    this.dynamicButton = page.locator('button.start, button.stop');

    // Alerts & popups
    this.simpleAlertBtn = page.locator('#alertBtn');
    this.confirmAlertBtn = page.locator('#confirmBtn');
    this.promptAlertBtn = page.locator('#promptBtn');
    this.newTabBtn = page.getByRole('button', { name: 'New Tab' });
    this.popupWindowsBtn = page.locator('#PopUp');

    // Mouse / double click / drag-drop
    this.pointMeBtn = page.locator('button.dropbtn');
    this.hoverMenu = page.locator('.dropdown-content');
    this.field1 = page.locator('#field1');
    this.field2 = page.locator('#field2');
    this.copyTextBtn = page.getByRole('button', { name: 'Copy Text' });
    this.draggable = page.locator('#draggable');
    this.droppable = page.locator('#droppable');

    // Upload
    this.singleFileInput = page.locator('#singleFileInput');
    this.singleFileUploadBtn = page.locator('#singleFileForm button[type="submit"]');
    this.singleFileStatus = page.locator('#singleFileStatus');
    this.multipleFilesInput = page.locator('#multipleFilesInput');
    this.multipleFilesUploadBtn = page.locator('#multipleFilesForm button[type="submit"]');
    this.multipleFilesStatus = page.locator('#multipleFilesStatus');

    // Tables
    this.bookTable = page.locator('table[name="BookTable"]');
    this.taskTable = page.locator('#taskTable');
    this.displayValues = page.locator('#displayValues');
    this.productTable = page.locator('#productTable');
    this.pagination = page.locator('#pagination');

    // Slider / SVG / scrolling dropdown
    this.priceAmount = page.locator('#amount');
    this.sliderRange = page.locator('#slider-range');
    this.svgContainer = page.locator('.svg-container');
    this.comboBox = page.locator('#comboBox');
    this.comboDropdown = page.locator('#dropdown');

    // Labels & links
    this.mobileLabels = page.locator('#mobiles label');
    this.laptopLinks = page.locator('#laptops a.link');
    this.brokenLinks = page.locator('#broken-links a.link');

    // Multi-section form + shadow DOM + footer
    this.section1Input = page.locator('#input1');
    this.section2Input = page.locator('#input2');
    this.section3Input = page.locator('#input3');
    this.section1Submit = page.locator('#btn1');
    this.section2Submit = page.locator('#btn2');
    this.section3Submit = page.locator('#btn3');
    this.shadowHost = page.locator('#shadow_host');
    this.youtubeLink = page.getByRole('link', { name: 'Youtube' });
    this.footerLinks = page.locator('#PageList1 a');
  }

  async open() {
    await this.goto('/');
    await expect(this.page).toHaveTitle(/Automation Testing Practice/i);
  }

  /** @param {string} day e.g. 'monday' */
  dayCheckbox(day) {
    return this.page.locator(`#${day}`);
  }

  /**
   * Fill the main practice form.
   * @param {ReturnType<typeof import('../fixtures/testData').buildUserFormData>} data
   */
  async fillMainForm(data) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.addressInput.fill(data.address);

    if (data.gender === 'female') {
      await this.femaleRadio.check();
    } else {
      await this.maleRadio.check();
    }

    for (const day of data.days) {
      await this.dayCheckbox(day).check();
    }

    await this.countrySelect.selectOption(data.country);
    await this.colorsSelect.selectOption(data.colors);
    await this.animalsSelect.selectOption(data.animals);
  }

  async assertMainForm(data) {
    await expect(this.nameInput).toHaveValue(data.name);
    await expect(this.emailInput).toHaveValue(data.email);
    await expect(this.phoneInput).toHaveValue(data.phone);
    await expect(this.addressInput).toHaveValue(data.address);
    await expect(data.gender === 'female' ? this.femaleRadio : this.maleRadio).toBeChecked();
    for (const day of data.days) {
      await expect(this.dayCheckbox(day)).toBeChecked();
    }
    await expect(this.countrySelect).toHaveValue(data.country);
  }

  async setDatePicker1(mmddyyyy) {
    await this.datePicker1.fill(mmddyyyy);
    await this.datePicker1.press('Enter');
  }

  async setDatePicker2ViaUi(dayLabel) {
    await this.datePicker2.click();
    await this.page.locator('.ui-datepicker-calendar td a').filter({ hasText: new RegExp(`^${dayLabel}$`) }).first().click();
  }

  async setDateRange(start, end) {
    await this.startDate.fill(start);
    await this.endDate.fill(end);
    await this.dateRangeSubmit.click();
  }

  async searchWikipedia(term) {
    await this.wikiSearchInput.fill(term);
    await this.wikiSearchButton.click();
    await this.wikiResults.locator('a').first().waitFor({ state: 'visible', timeout: 15_000 });
  }

  async toggleDynamicButton() {
    const before = (await this.dynamicButton.innerText()).trim();
    await this.dynamicButton.click();
    await expect(this.dynamicButton).not.toHaveText(before);
    return (await this.dynamicButton.innerText()).trim();
  }

  async hoverPointMe() {
    await this.pointMeBtn.hover();
    await expect(this.hoverMenu).toBeVisible();
  }

  async doubleClickCopyText() {
    await expect(this.field1).toHaveValue('Hello World!');
    await this.copyTextBtn.dblclick();
    await expect(this.field2).toHaveValue('Hello World!');
  }

  async dragAndDrop() {
    await this.draggable.dragTo(this.droppable);
    await expect(this.droppable.locator('p')).toHaveText(/Dropped!/i);
  }

  async uploadSingleFile(filePath) {
    const fileName = path.basename(filePath);
    await this.singleFileInput.setInputFiles(filePath);
    await this.singleFileUploadBtn.click();
    await expect(this.singleFileStatus).toContainText(`Single file selected: ${fileName}`);
  }

  async uploadMultipleFiles(filePaths) {
    await this.multipleFilesInput.setInputFiles(filePaths);
    await this.multipleFilesUploadBtn.click();
    await expect(this.multipleFilesStatus).toContainText('Multiple files selected');
    for (const filePath of filePaths) {
      await expect(this.multipleFilesStatus).toContainText(path.basename(filePath));
    }
  }

  async getBookRowByName(bookName) {
    return this.bookTable.locator('tr').filter({ hasText: bookName });
  }

  /**
   * Validate dynamic table summary strings against row/column values.
   */
  async assertDynamicTableSummaries() {
    await expect(this.taskTable).toBeVisible();
    await expect(this.displayValues).toBeVisible();

    const chromeCpuText = await this.displayValues.locator('.chrome-cpu').innerText();
    const firefoxMemoryText = await this.displayValues.locator('.firefox-memory').innerText();
    const chromeNetworkText = await this.displayValues.locator('.chrome-network').innerText();
    const firefoxDiskText = await this.displayValues.locator('.firefox-disk').innerText();

    const chromeRow = this.taskTable.locator('tbody tr').filter({ hasText: 'Chrome' });
    const firefoxRow = this.taskTable.locator('tbody tr').filter({ hasText: 'Firefox' });

    const headers = await this.taskTable.locator('thead th').allInnerTexts();
    const cpuIdx = headers.findIndex((h) => /CPU/i.test(h));
    const memIdx = headers.findIndex((h) => /Memory/i.test(h));
    const netIdx = headers.findIndex((h) => /Network/i.test(h));
    const diskIdx = headers.findIndex((h) => /Disk/i.test(h));

    const chromeCells = await chromeRow.locator('td').allInnerTexts();
    const firefoxCells = await firefoxRow.locator('td').allInnerTexts();

    expect(chromeCells[cpuIdx].trim()).toBe(chromeCpuText.trim());
    expect(firefoxCells[memIdx].trim()).toBe(firefoxMemoryText.trim());
    expect(chromeCells[netIdx].trim()).toBe(chromeNetworkText.trim());
    expect(firefoxCells[diskIdx].trim()).toBe(firefoxDiskText.trim());
  }

  async selectProductOnPage(productName, pageNumber = 1) {
    if (pageNumber > 1) {
      await this.pagination.locator('a').filter({ hasText: String(pageNumber) }).click();
    }
    const row = this.productTable.locator('tbody tr').filter({ hasText: productName });
    await row.locator('input[type="checkbox"]').check();
    await expect(row.locator('input[type="checkbox"]')).toBeChecked();
  }

  async moveSliderHandles() {
    await expect(this.priceAmount).toHaveValue(/\$75 - \$300/);
    const handles = this.sliderRange.locator('.ui-slider-handle');
    await expect(handles).toHaveCount(2);

    // Drive jQuery UI slider API directly — more reliable than raw mouse drag.
    await this.page.evaluate(() => {
      // eslint-disable-next-line no-undef
      const $ = window.jQuery || window.$;
      $('#slider-range').slider('values', [120, 350]);
      $('#amount').val('$' + $('#slider-range').slider('values', 0) + ' - $' + $('#slider-range').slider('values', 1));
    });

    await expect(this.priceAmount).toHaveValue('$120 - $350');
  }

  async assertSvgShapesVisible() {
    await expect(this.svgContainer.locator('circle')).toBeVisible();
    await expect(this.svgContainer.locator('rect')).toBeVisible();
    await expect(this.svgContainer.locator('polygon')).toBeVisible();
  }

  async selectScrollingDropdownItem(itemText) {
    await this.comboBox.click();
    await expect(this.comboDropdown).toBeVisible();

    // Scroll until the item is present (lazy-loaded list)
    for (let i = 0; i < 50; i++) {
      const option = this.comboDropdown.locator('div', { hasText: itemText });
      if (await option.count()) {
        await option.first().scrollIntoViewIfNeeded();
        await option.first().click();
        await expect(this.comboBox).toHaveValue(itemText);
        return;
      }
      await this.comboDropdown.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
    }
    throw new Error(`Item "${itemText}" not found in scrolling dropdown`);
  }

  async fillSectionForms() {
    await this.section1Input.fill('Section 1 input');
    await this.section1Submit.click();
    await this.section2Input.fill('Section 2 input');
    await this.section2Submit.click();
    await this.section3Input.fill('Section 3 input');
    await this.section3Submit.click();
    await expect(this.section1Input).toHaveValue('Section 1 input');
    await expect(this.section2Input).toHaveValue('Section 2 input');
    await expect(this.section3Input).toHaveValue('Section 3 input');
  }

  async interactWithShadowDom() {
    const shadowRoot = this.shadowHost;
    const mobiles = shadowRoot.locator('.info');
    await expect(mobiles).toHaveText('Mobiles');

    const nestedHost = shadowRoot.locator('#nested_shadow_host');
    await expect(nestedHost.locator('#nested_shadow_content div')).toHaveText('Laptops');

    const blogLink = shadowRoot.getByRole('link', { name: 'Blog' });
    await expect(blogLink).toHaveAttribute('href', /pavantestingtools/);

    await shadowRoot.locator('input[type="text"]').fill('Shadow input');
    await shadowRoot.locator('input[type="checkbox"]').check();
    await expect(shadowRoot.locator('input[type="checkbox"]')).toBeChecked();
  }
}

module.exports = { AutomationPracticePage };
