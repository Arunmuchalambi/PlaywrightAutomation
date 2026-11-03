@api @smoke
Feature: API testing
  As a Senior QA Engineer
  I want REST and site HTTP API checks
  So that backend contracts and link health are validated independently of the UI

  @rest
  Scenario: REST CRUD against JSONPlaceholder
    Given I have an API client for the REST practice API
    When I GET "/posts/1"
    Then the API response status should be 200
    And the API response JSON should contain key "title"
    When I POST "/posts" with body:
      """
      {"title":"Cucumber API","body":"Created via feature file","userId":1}
      """
    Then the API response status should be 201
    And the API response JSON should contain key "id"
    When I PUT "/posts/1" with body:
      """
      {"id":1,"title":"Updated","body":"Put via feature","userId":1}
      """
    Then the API response status should be 200
    When I DELETE "/posts/1"
    Then the API response status should be one of "200,204"

  @site-http
  Scenario: Practice site homepage is healthy
    Given I have an API client for the practice site
    When I GET "/"
    Then the API response status should be 200
    And the API response body should contain "Automation Testing Practice"

  @broken-links
  Scenario: Broken link endpoints return error status codes
    Given I open the Automation Practice site
    When I collect broken link hrefs from the page
    Then each broken link should return an HTTP error status
