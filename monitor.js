const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('CMS Application Tests', function() {
  let driver;

  // Increase the timeout for the entire test suite
  this.timeout(60000);

  before(async function() {
    const options = new chrome.Options();
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  it('should login successfully', async function() {
    await driver.get('http://localhost:3002');
    await driver.findElement(By.name('email')).sendKeys('testuser@example.com');
    await driver.findElement(By.name('password')).sendKeys('password123');
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(until.urlContains('/dashboard'), 10000);
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('/dashboard'), "Should be redirected to dashboard after login");
  });

  it('should navigate to policies page', async function() {
    await driver.get('http://localhost:3002/policies');
    await driver.wait(until.titleIs('Policies'), 10000);
    const pageTitle = await driver.getTitle();
    assert.strictEqual(pageTitle, 'Policies');
  });

  it('should navigate to claims page', async function() {
    await driver.get('http://localhost:3002/dashboard/claims');
    await driver.wait(until.titleIs('Claims'), 10000);
    const pageTitle = await driver.getTitle();
    assert.strictEqual(pageTitle, 'Claims');
  });

  it('should navigate to account page', async function() {
    await driver.get('http://localhost:3002/dashboard/account');
    await driver.wait(until.titleIs('Account'), 10000);
    const pageTitle = await driver.getTitle();
    assert.strictEqual(pageTitle, 'Account');
  });

  it('should logout successfully', async function() {
    await driver.get('http://localhost:3002/dashboard');
    const logoutButton = await driver.wait(until.elementLocated(By.linkText('Logout')), 10000);
    await logoutButton.click();

    await driver.wait(until.urlIs('http://localhost:3002/'), 10000);
    const currentUrl = await driver.getCurrentUrl();
    assert.strictEqual(currentUrl, 'http://localhost:3002/', "Should be redirected to login page after logout");
  });
});