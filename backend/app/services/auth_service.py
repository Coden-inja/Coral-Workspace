def login_user(email: str, password : str):
    if password != "123456":
        return {
            "error": "Invalid credentials"
        }
    return {
        "message": "User authenticated",
        "email": email
    }