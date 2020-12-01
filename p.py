import requests

for i in range(1,100):
    url = "http://localhost:5000/api/create"

    payload={}
    files=[
    ('image',('near-buildings-bg.png',open('C:/Users/Harsimrat/Pictures/near-buildings-bg.png','rb'),'image/png'))
    ]
    headers = {
    'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNWZjMzE3MmM0NTdhNjIwMDA0ZjNlNjZlIiwiaWF0IjoxNjA2NzkzNDMxLCJleHAiOjE2MDY4Nzk4MzF9.eLTsxXiWw0xTTUc8Pl8rxeWDLLbDXDlxVlpBMMD9LO4',
    'Cookie': 'connect.sid=s%3AoyE1CbFSttl0wJJ48F3fGjc1PLs2nsT_.yvxyEj9VFQYJfVdEs1wxMBnIUVjItZG0yVVNmYfEka4'
    }

    response = requests.request("POST", url, headers=headers, data=payload, files=files)

    print(response.text)
