Library    Collections

*** Settings ***
Library    RequestsLibrary
Library    Collections
Suite Setup    Create Session    api    ${BASE_URL}    headers={"Authorization": "${TOKEN}"}

*** Variables ***
${BASE_URL}    http://localhost:3000/api
${TOKEN}       Bearer ...

*** Test Cases ***
Get All Categories
    ${response}=    GET On Session    api    /category
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    data

Create New Category
    ${category}=    Create Dictionary    name=Test Category    color=#FF5733
    ${response}=    POST On Session    api    /category    json=${category}
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()['data']}    category
