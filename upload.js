require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

async function loginAndUploadImage(username, password, imagePaths, caption) {
  let driver = await new Builder().forBrowser('chrome').build();

  // 訪問 Instagram 首頁
  await driver.get('https://www.instagram.com/login');

  // 等待登入頁面出現，再輸入用戶名和密碼
  await driver.wait(until.elementLocated(By.name('username')), 5000);
  await driver.findElement(By.name('username')).sendKeys(username);
  await driver.findElement(By.name('password')).sendKeys(password, Key.RETURN);

  // 等待主頁面出現，再點擊「上傳」按鈕
  await driver.wait(until.elementLocated(By.xpath("//a[contains(.,'建立')]")), 5000);
  await driver.findElement(By.xpath("//a[contains(.,'建立')]")).click();

  // 等待上傳照片的模組出現，再點擊「選擇照片」按鈕
  await driver.wait(until.elementLocated(By.xpath("//div[contains(.,'從電腦選擇')]")), 5000);
  await driver.findElement(By.xpath("//div[contains(.,'從電腦選擇')]")).click();

  // 等待照片選擇器出現，再選擇指定照片
  await driver.wait(until.elementLocated(By.css('input[type="file"]')), 5000);
  await driver.findElement(By.css('input[type="file"]')).sendKeys(imagePaths[0]);
  for (var i = 1; i < 4; i++) {
    await driver.findElement(By.xpath('/html/body/div[2]/div/div/div/div[2]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[1]/div/div/div/div[3]/div/div[2]/div/button')).click();
    await driver.findElement(By.xpath('/html/body/div[2]/div/div/div/div[2]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[1]/div/div/div/div[3]/div/div[1]/div/div/div/div[2]/div')).click();
    await driver.wait(until.elementLocated(By.css('input[type="file"]')), 5000);
    await driver.findElement(By.css('input[type="file"]')).sendKeys(imagePaths[i]);
  }

  await driver.wait(until.elementLocated(By.xpath("//button[contains(.,'下一步')]")), 5000);
  await driver.findElement(By.xpath("//button[contains(.,'下一步')]")).click();
  await driver.wait(until.elementLocated(By.xpath("//button[contains(.,'下一步')]")), 5000);
  await driver.findElement(By.xpath("//button[contains(.,'下一步')]")).click();

  // 等待照片預覽出現，再輸入說明文字
  await driver.wait(until.elementLocated(By.xpath("//div[@aria-label='撰寫說明文字……']")), 5000);
  await driver.findElement(By.xpath("//div[@aria-label='撰寫說明文字……']")).sendKeys(caption);

  // 等待照片預覽出現，再點擊「發布」按鈕
  await driver.wait(until.elementLocated(By.xpath("//button[contains(.,'分享')]")), 5000);
  await driver.findElement(By.xpath("//button[contains(.,'分享')]")).click();

  await driver.wait(until.elementLocated(By.xpath("//span[contains(.,'貼文已分享。')]")), 10000);
  driver.quit();

}

module.exports = { loginAndUploadImage }