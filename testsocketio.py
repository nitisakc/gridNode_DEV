import socketio
import engineio
import eventlet
from threading import Thread
import datetime

sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
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
	while True:
		sio.emit('send', str(datetime.datetime.now()))

if __name__ == '__main__':
	Thread(target=run, args=()).start()
	eventlet.wsgi.server(eventlet.listen(('', 5000)), app)
