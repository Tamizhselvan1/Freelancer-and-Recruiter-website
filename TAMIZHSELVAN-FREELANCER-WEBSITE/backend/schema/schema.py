from schema import Schema, And, Use, Optional

# Define the schema
user_schema = Schema({
    'name': str,
    'age': And(Use(int), lambda n: 0 < n < 120), # Converts string to int & validates range
    Optional('email'): str
})

# Validate data
data = {'name': 'Alice', 'age': '25'}
validated_data = user_schema.validate(data)


# simple schema model



# CREATE A HIOVER  GALLERY DOCS TO UPDATE SCHEMA AND RULES IN TEH FUNCTIONAND ALL THE UPLOADS IN THE PROGRAM