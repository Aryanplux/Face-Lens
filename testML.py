import requests, sys
r = requests.post('http://127.0.0.1:8000/detect', files={'file': open('FaceLens-sb/uploads/1/139/photos/ff066a0c-bbdd-4483-9b72-2cb11696a2a7.jpg', 'rb')})
print(r.status_code, r.text)

