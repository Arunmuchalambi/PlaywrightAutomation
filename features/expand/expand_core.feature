@expand @smoke @ui
Feature: ExpandTesting core UI journeys
  As a Senior QA Engineer
  I want E2E coverage of highlighted practice apps on practice.expandtesting.com
  So that auth, inputs, tables, dialogs and popups are regression-safe

  Background:
    Given I open the ExpandTesting practice home page

  @inputs
  Scenario: Web inputs Try it out end to end
    When I open ExpandTesting practice "Web inputs" via Try it out
    Then the ExpandTesting page URL should contain "/inputs"
    And the ExpandTesting web inputs form should be visible
    When I fill ExpandTesting web inputs with number "42" text "Playwright" password "Secret123" date "2026-11-03"
    Then the ExpandTesting web inputs form should be visible

  @login
  Scenario: Test Login Page Try it out end to end
    When I open ExpandTesting practice "Test Login Page" via Try it out
    And I login to ExpandTesting with username "practice" and password "SuperSecretPassword!"
    Then I should see ExpandTesting login success

  @register
  Scenario: Test Register Page is reachable via Try it out
    When I open ExpandTesting practice "Test Register Page" via Try it out
    Then the ExpandTesting page URL should contain "/register"
    And the ExpandTesting register form should be visible

  @forgot
  Scenario: Forgot Password Form Try it out end to end
    When I open ExpandTesting practice "Forgot Password Form" via Try it out
    And I submit ExpandTesting forgot password for email "practice@expandtesting.com"
    Then the ExpandTesting page URL should contain "/forgot-password"

  @otp
  Scenario: OTP login page opens via Try it out
    When I open ExpandTesting practice "OTP: One Time Password" via Try it out
    Then the ExpandTesting page URL should contain "/otp-login"

  @tables
  Scenario: Dynamic Table and Pagination Table via Try it out
    When I open ExpandTesting practice "Dynamic Table" via Try it out
    Then the ExpandTesting dynamic table should be visible
    When I open ExpandTesting practice "Dynamic Pagination Table" via Try it out
    Then the ExpandTesting pagination table should be visible

  @locators
  Scenario: Locators Page via Try it out
    When I open ExpandTesting practice "Locators Page" via Try it out
    Then the ExpandTesting page URL should contain "/locators"

  @dialogs
  Scenario: JavaScript Dialogs and unexpected popup handling
    When I open ExpandTesting practice "JavaScript Dialogs" via Try it out
    And I exercise ExpandTesting JavaScript alert confirm and prompt
    When I open ExpandTesting practice "Entry Ad" via Try it out
    And I close ExpandTesting entry ad modal if shown
    When I open ExpandTesting practice "Cookie Consent Alert" via Try it out
    And I accept ExpandTesting cookie consent if shown
