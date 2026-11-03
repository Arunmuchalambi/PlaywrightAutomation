@expand @api @smoke
Feature: ExpandTesting REST API checks
  As a Senior QA Engineer
  I want API health and documentation endpoints verified
  So that UI and API practice surfaces stay available together

  @api-only @rest
  Scenario: Health check API returns UP
    Given I have an API client for ExpandTesting
    When I GET ExpandTesting "/api/health-check"
    Then the ExpandTesting API response status should be 200
    And the ExpandTesting API JSON field "status" should be "UP"
    And the ExpandTesting API JSON field "success" should be true

  @api-only @rest
  Scenario: MyIP Address API returns public IP payload
    Given I have an API client for ExpandTesting
    When I GET ExpandTesting "/api/my-ip/"
    Then the ExpandTesting API response status should be 200
    And the ExpandTesting API JSON should contain key "ip"

  @api-only @rest
  Scenario: Notes API and Practice API Swagger docs are reachable
    Given I have an API client for ExpandTesting
    When I GET ExpandTesting "/notes/api/api-docs/"
    Then the ExpandTesting API response status should be 200
    When I GET ExpandTesting "/api/api-docs/"
    Then the ExpandTesting API response status should be 200

  @api-only @rest
  Scenario: Homepage and login pages return HTML 200
    Given I have an API client for ExpandTesting
    When I GET ExpandTesting "/"
    Then the ExpandTesting API response status should be 200
    And the ExpandTesting API body should contain "Automation Testing Practice"
    When I GET ExpandTesting "/login"
    Then the ExpandTesting API response status should be 200
