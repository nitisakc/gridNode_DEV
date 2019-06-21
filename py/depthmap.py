from threading import Thread
import time
import datetime
import base64
import numpy as np
import cv2
import cv2.aruco as aruco
import math
import json
import requests
from utils import WebcamVideoStream
from matplotlib import pyplot as plt


cap = WebcamVideoStream(src=1, width=2560, height=720).start()

while True:
	frame = cap.read()
	fh, fw, _ = frame.shape

	a = frame[0:720, 0:1280]
	afh, afw, _ = a.shape
	b = frame[0:720, 1280:2560]
	bfh, bfw, _ = b.shape

	# frame = cv2.resize(frame, (int(fw/2), int(fh/2)))
	a = cv2.resize(a, (int(afw/2), int(afh/2)))
	b = cv2.resize(b, (int(bfw/2), int(bfh/2)))
	cv2.imshow('a',a)
	cv2.imshow('b',b)
	# cv2.imshow('frame',frame)
	a = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
	b = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
	
	stereo = cv2.StereoBM_create(numDisparities=16, blockSize=15)
	disparity = stereo.compute(a,b)
	plt.imshow(disparity,'gray')
	plt.show()

	if cv2.waitKey(1) & 0xFF == ord('q'):
		break

cv2.destroyAllWindows()