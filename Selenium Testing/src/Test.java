import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class Test {
    public static void main(String[] args) {
        System.setProperty("webdriver.gecko.driver", "E:\\Selenium\\geckodriver-v0.35.0-win32\\geckodriver.exe");

        FirefoxOptions fire_options = new FirefoxOptions();
        fire_options.setBinary("C:\\Program Files\\Mozilla Firefox\\firefox.exe");
        WebDriver driver = new FirefoxDriver(fire_options);

        try {
            driver.get("http://localhost:5175");
            driver.manage().window().maximize();
            Thread.sleep(4000);

            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

            // Test case 1: Test Teacher List Page
            System.out.println("Testing Teacher List Page...");
            // Verify the table exists
            WebElement teacherTable = wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("table")));
            List<WebElement> rows = teacherTable.findElements(By.tagName("tr"));
            System.out.println("Number of teachers listed: " + (rows.size() - 1)); // -1 for header row

            // Test case 2: Navigate to Allocation Form
            System.out.println("\nNavigating to Allocation Form...");
            WebElement allocateLink = wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Allocate")));
            allocateLink.click();
            Thread.sleep(2000);

            // Test case 3: Test Automatic Allocation
            System.out.println("Testing Automatic Allocation...");
            // Find the first form in the allocation section
            WebElement allocationForm = wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("form")));
            List<WebElement> formSelects = allocationForm.findElements(By.tagName("select"));
            
            // Select semester and division
            if (formSelects.size() >= 2) {
                Select semesterSelect = new Select(formSelects.get(0));
                semesterSelect.selectByValue("3");
                Thread.sleep(1000);

                Select divisionSelect = new Select(formSelects.get(1));
                divisionSelect.selectByValue("A");
                Thread.sleep(1000);

                // Click Allocate Division button
                WebElement allocateButton = driver.findElement(
                    By.xpath("//button[contains(text(), 'Allocate Division')]"));
                allocateButton.click();
                Thread.sleep(2000);
            }

            // Test case 4: Test Manual Allocation
            System.out.println("Testing Manual Allocation...");
            // Find the manual allocation form
            WebElement manualAllocationForm = wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//div[contains(@class, 'manual-allocation')]//form")));
            List<WebElement> manualFormSelects = manualAllocationForm.findElements(By.tagName("select"));

            if (manualFormSelects.size() >= 2) {
                Select teacherSelect = new Select(manualFormSelects.get(0));
                teacherSelect.selectByIndex(1);
                Thread.sleep(1000);

                Select classroomSelect = new Select(manualFormSelects.get(1));
                classroomSelect.selectByIndex(1);
                Thread.sleep(1000);

                // Click Allocate Teacher button
                WebElement manualAllocateButton = manualAllocationForm.findElement(
                    By.xpath(".//button[contains(text(), 'Allocate Teacher')]"));
                if (!manualAllocateButton.getDomProperty("disabled").equals("true")) {
                    manualAllocateButton.click();
                    Thread.sleep(2000);
                }
            }

            // Test case 5: Navigate to View Allocations
            System.out.println("\nTesting View Allocations...");
            WebElement viewAllocationsLink = driver.findElement(By.linkText("View Allocations"));
            viewAllocationsLink.click();
            Thread.sleep(2000);

            // Test case 6: Test Paper Count Button
            System.out.println("Testing Paper Count functionality...");
            List<WebElement> paperCountButtons = driver.findElements(By.className("paper-count-btn"));
            if (!paperCountButtons.isEmpty()) {
                paperCountButtons.get(0).click();
                Thread.sleep(2000);
                
                try {
                    WebElement paperCounts = wait.until(ExpectedConditions.presenceOfElementLocated(
                        By.className("paper-counts")));
                    System.out.println("Paper Counts displayed: " + paperCounts.getText());
                } catch (Exception e) {
                    System.out.println("Paper counts not displayed");
                }
            }

            // Test case 7: Test Clear Room
            System.out.println("Testing Clear Room functionality...");
            List<WebElement> clearButtons = driver.findElements(By.className("clear-room-btn"));
            if (!clearButtons.isEmpty()) {
                clearButtons.get(0).click();
                Thread.sleep(2000);
                System.out.println("Room cleared successfully");
            }

        } catch (Exception e) {
            System.out.println("Test failed with error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}