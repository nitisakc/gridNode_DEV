from rplidar import RPLidar
import json
import numpy as np
import time
import sys
import subprocess
import requests

command = "ls /dev/tty.SLAB_USBtoUART*"
cams = subprocess.check_output(command, stderr=subprocess.STDOUT, shell=True)
for line in cams.splitlines():
	l = str(line.decode('UTF-8'))
	print(l)

lidar = RPLidar('/dev/tty.SLAB_USBtoUART')
lid = 'E9EA9AF2C1EA9FC3BEEB9CF366393203' #'EAC49AF2C1EA9FC3BEEB9CF365173203'
rid = 'D39C9AF2C1EA9FC0BEEB9CF35C4F3200' #'94E89AF2C1EA9FC3BEEB9CF31B3B3203'

try:
	data = [-1] * 360

	info = lidar.get_info()
	print(info['serialnumber'])
	side = 'r'
	if info['serialnumber'] == lid:
		side = 'l'

	health = lidar.get_health()
	print(health)

	iterator = lidar.iter_scans()

	i = 0
	while True:
		try:
			scan = next(iterator)
			i = i + 1
			line = []
			if i > 1:
				i = 0
				# line = [[int(v[1]), int(v[2] / 10)] for v in scan]
				for v in scan:
					if int(v[2] / 10) <= 200 and int(v[1]) < 183 or int(v[1]) > 280:
						line.append([int(v[1]), int(v[2] / 10)])
				# print(line)
				# sys.stdout.flush()
				r = requests.post('http://localhost:3001/safety/set/' + side , json=line)
		finally:
			ii = 0

except KeyboardInterrupt:
	# lidar.stop()
	# lidar.stop_motor()
	# lidar.disconnect()
	# lidar.reset()
	sys.exit(0)