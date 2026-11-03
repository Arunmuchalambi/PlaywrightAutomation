@practice @form @smoke
Feature: Practice form and navigation
  As a QA engineer
  I want to validate the main form and top navigation
  So that basic data entry widgets work

  Background:
    Given I open the Automation Practice site

  Scenario: Navigation menu links are visible
    Then the navigation menu should contain "Home"
    And the navigation menu should contain "Udemy Courses"
    And the navigation menu should contain "PlaywrightPractice"

  Scenario: Fill name email phone address and gender
    When I fill the practice form with:
      | name    | Arun QA        |
      | email   | arun@test.com  |
      | phone   | 9876543210     |
      | address | Bengaluru, India |
      | gender  | male           |
    Then the name field should show "Arun QA"
    And the email field should show "arun@test.com"
