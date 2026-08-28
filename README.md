# Backend API Documentation

## User Registration Endpoint

### POST /user/register

This endpoint allows users to register a new account by providing their personal details.

#### Request Body

The request must be sent as JSON with the following required fields:

- `fullname` (object): User's full name
  - `firstname` (string): First name, minimum 3 characters
  - `lastname` (string): Last name, minimum 3 characters
- `email` (string): Valid email address, must be unique
- `password` (string): Password, minimum 6 characters

Example request body:
```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}
```

#### Response

##### Success (201 Created)
Returns a JSON object containing the authentication token and user details.

Example response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

##### Validation Error (400 Bad Request)
Returns a JSON object with an array of validation errors.

Example response:
```json
{
  "error": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "First name must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    },
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

##### Server Error (500 Internal Server Error)
Returns a JSON object with an error message if something goes wrong on the server side.

Example response:
```json
{
  "error": "Internal server error"
}
```