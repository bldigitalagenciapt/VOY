import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    page.on('requestfailed', request =>
        console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`)
    );

    console.log('Navigating to https://voy-appimigrante.vercel.app/ ...');
    try {
        const response = await page.goto('https://voy-appimigrante.vercel.app/', { waitUntil: 'networkidle0' });
        console.log('Status code:', response?.status());

        // Check if the page is literally blank
        const content = await page.content();
        if (content.includes('id="root"></div>')) {
            console.log('The root div is empty!');
        }

        // Try to get any text body to see if there is text
        const text = await page.evaluate(() => document.body.innerText);
        console.log('Page Text:', text.substring(0, 100));

    } catch (err) {
        console.error('Error during navigation:', err);
    }

    await browser.close();
})();
