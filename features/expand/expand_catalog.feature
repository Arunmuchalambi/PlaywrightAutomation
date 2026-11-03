@expand @catalog @ui
Feature: ExpandTesting full Try it out catalog
  As a Senior QA Engineer
  I want every practice card Try it out navigation and controls validated
  So that inputs, textareas, tables, buttons and other widgets work end to end

  Background:
    Given I open the ExpandTesting practice home page

  Scenario Outline: Exercise Try it out functionality for "<title>"
    When I open ExpandTesting path "<path>"
    And I dismiss any unexpected ExpandTesting popups
    Then the ExpandTesting page should load successfully for "<path>"
    And I exercise ExpandTesting page functionality for "<path>"

    Examples:
      | title                          | path                        |
      | Web inputs                     | /inputs                     |
      | Test Login Page                | /login                      |
      | Test Register Page             | /register                   |
      | Forgot Password Form           | /forgot-password            |
      | OTP: One Time Password         | /otp-login                  |
      | Dynamic Table                  | /dynamic-table              |
      | Dynamic Pagination Table       | /dynamic-pagination-table   |
      | Locators Page                  | /locators                   |
      | My Browser Information         | /my-browser                 |
      | Radio Buttons                  | /radio-buttons              |
      | Drag and Drop                  | /drag-and-drop              |
      | Drag and Drop Circles          | /drag-and-drop-circles      |
      | Form Validation                | /form-validation            |
      | File Upload                    | /upload                     |
      | File Downloader                | /download                   |
      | Add/Remove Elements            | /add-remove-elements        |
      | Secure File Download           | /download-secure            |
      | Notification Message           | /notification-message       |
      | Autocomplete                   | /autocomplete               |
      | Challenging DOM                | /challenging-dom            |
      | Large & Deep DOM               | /large                      |
      | Shadow DOM                     | /shadowdom                  |
      | Typos                          | /typos                      |
      | MyIP Address                   | /my-ip                      |
      | Broken Images                  | /broken-images              |
      | Infinite Scroll                | /infinite-scroll            |
      | Slow Resources                 | /slow                       |
      | JavaScript Dialogs             | /js-dialogs                 |
      | Check Boxes                    | /checkboxes                 |
      | Context Menu                   | /context-menu               |
      | Key Presses                    | /key-presses                |
      | Disappearing Elements          | /disappearing-elements      |
      | Dropdown List                  | /dropdown                   |
      | Redirect Link                  | /redirector                 |
      | Horizontal Slider              | /horizontal-slider          |
      | Hovers                         | /hovers                     |
      | Floating Menu                  | /floating-menu              |
      | IFrame                         | /iframe                     |
      | Multiple Windows               | /windows                    |
      | Sortable Data Tables           | /tables                     |
      | Tooltips                       | /tooltips                   |
      | Dynamic Content                | /dynamic-content            |
      | Dynamic Controls               | /dynamic-controls           |
      | Dynamic Loading                | /dynamic-loading            |
      | Shifting Content               | /shifting-content           |
      | HTTP Status Codes              | /status-codes               |
      | Dynamic ID                     | /dynamic-id                 |
      | Entry Ad                       | /entry-ad                   |
      | Exit Intent                    | /exit-intent                |
      | Contact Us                     | /contact                    |
      | Sample User Profile            | /users/1                    |
      | Sample Feedback page           | /feedback                   |
      | Scrollbars                     | /scrollbars                 |
      | Cookie Consent Alert           | /cookie-alert               |
      | HTTP Headers                   | /http-headers               |
      | Check console logs             | /console-logs               |
      | Basic Authentication           | /basic-auth                 |
      | Digest Authentication          | /digest-auth                |
      | Random Number                  | /random-number              |
      | Flaky Test Page Example        | /flaky-test                 |
      | About Page                     | /about                      |
      | Notes App React                | /notes/app                  |
      | Web Parking                    | /webpark                    |
      | BMI Calculator                 | /bmi                        |
      | Ecommerce BookStore            | /bookstore                  |
      | Cars Showroom                  | /cars                       |
      | Notes API Swagger              | /notes/api/api-docs/        |
      | Practice API Swagger           | /api/api-docs/              |
      | Health check API               | /api/health-check           |
      | MyIP Address API               | /api/my-ip/                 |
      | Should Be                      | /assertions/should-be       |
      | Should Exist                   | /assertions/should-exist    |
      | Allure Reports                 | /allure-reports             |
      | Mochawesome Reports            | /mochawesome-reports        |
