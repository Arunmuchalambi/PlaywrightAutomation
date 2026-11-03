@practice @smoke
Feature: Automation Practice Site
  As a Senior QA Engineer
  I want to automate critical widgets on testautomationpractice.blogspot.com
  So that form, date, popup, table, and footer behaviours are regression-safe

  Background:
    Given I open the Automation Practice site

  @form
  Scenario: Select Colors and Sorted List options
    When I select colors "red,yellow"
    And I select sorted list animals "cheetah,dog"
    Then the colors selection should be "red,yellow"
    And the sorted list selection should be "cheetah,dog"

  @dates
  Scenario: Fill Date Picker 1, Date Picker 2 and Date Range
    When I set Date Picker 1 to "11/03/2026"
    And I pick day "15" in Date Picker 2
    And I set date range from "2026-11-01" to "2026-11-10" and submit
    Then Date Picker 1 should show "11/03/2026"
    And Date Picker 2 should contain "15"
    And the date range result should not be empty

  @popups
  Scenario: Handle Confirmation Alert, Prompt Alert, New Tab and Popup Windows
    When I accept the Confirmation Alert
    And I accept the Prompt Alert with text "QA Engineer"
    And I open the New Tab and close it after verifying the URL
    And I open Popup Windows and verify Selenium and Playwright sites
    Then popup interactions should complete successfully

  @pagination
  Scenario: Select products across Pagination Web Table pages
    When I select product "Smartphone" on pagination page 1
    And I select product "Laptop" on pagination page 1
    And I select product "Television" on pagination page 2
    Then pagination page "2" should be active

  @footer
  Scenario: Verify Footer Links
    Then Footer Links should include "Home"
    And Footer Links should include "Hidden Elements"
    And Footer Links should include "Download Files"
    And Footer Links count should be 3

  @journey @release
  Scenario: End-to-end journey for screenshot widgets
    When I select colors "red,yellow"
    And I select sorted list animals "cheetah,dog"
    And I set Date Picker 1 to "11/03/2026"
    And I pick day "15" in Date Picker 2
    And I set date range from "2026-11-01" to "2026-11-10" and submit
    And I accept the Confirmation Alert
    And I accept the Prompt Alert with text "QA Engineer"
    And I open the New Tab and close it after verifying the URL
    And I open Popup Windows and verify Selenium and Playwright sites
    And I select product "Smartphone" on pagination page 1
    And I select product "Television" on pagination page 2
    Then the colors selection should be "red,yellow"
    And the sorted list selection should be "cheetah,dog"
    And Date Picker 1 should show "11/03/2026"
    And the date range result should not be empty
    And Footer Links should include "Home"
    And Footer Links should include "Download Files"
