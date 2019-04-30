import socketio
import engineio
import eventlet
from threading import Thread
import datetime
import base64
import numpy as np
import cv2
import cv2.aruco as aruco
from utils import WebcamVideoStream

def application(environ, start_response):
    body = b'Hello world!\n'
    status = '200 OK'
    headers = [('Content-type', 'text/plain')]
    start_response(status, headers)
    return [body]

sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'},
    '/stream': application
})

@sio.on('connect')
def connect(sid, environ):
    print('connect ', sid)

@sio.on('my message')
def message(sid, data):
    print('message ', data)

@sio.on('disconnect')
def disconnect(sid):
    print('disconnect ', sid)

def run():
	cap = WebcamVideoStream(src=0, width=1920, height=1080).start()
	aruco_dict = aruco.Dictionary_get(aruco.DICT_4X4_100)
	parameters =  aruco.DetectorParameters_create()
	while True:
		frame = cap.read()
		fh, fw, _ = frame.shape

		gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		corners, ids, rejectedImgPoints = aruco.detectMarkers(gray, aruco_dict, parameters=parameters)
		# res = cv2.resize(frame, (320, 180))
		# retval, buffer = cv2.imencode('.jpg', res)
		# cv2.imshow('res',res)
		sio.emit('img', 'data:image/jpeg;base64,' + len(corners))# + base64.b64encode(buffer))
		# sio.emit('img', "asdsadad")
		# if cv2.waitKey(0) & 0xFF == ord('q'):
		# 	break

	cv2.destroyAllWindows()

if __name__ == '__main__':
	Thread(target=run, args=()).start()
	eventlet.wsgi.server(eventlet.listen(('', 5000)), app)
