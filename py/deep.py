import cv2
from utils import WebcamVideoStream
import numpy as np
from matplotlib import pyplot as plt
import cv2.aruco as aruco

cap = WebcamVideoStream(src=1, width=1280*2, height=720).start()
aruco_dict = aruco.Dictionary_get(aruco.DICT_4X4_250)
parameters =  aruco.DetectorParameters_create()

while True:
	frame = cap.read()
	framel = frame[0:720, 0:1280]
	framer = frame[0:720, 1280:1280*2]

	fh, fw, _ = frame.shape
	res = cv2.resize(frame, (int(fw/2), int(fh/2)))

	cv2.imshow('disparity',res)

	# resl = cv2.resize(framel, (int(fw/2), int(fh/2)))
	# resr = cv2.resize(framer, (int(fw/2), int(fh/2)))
	# cv2.imshow('framel',resl)
	# cv2.imshow('framer',resr)

	# resl = cv2.cvtColor(resl, cv2.COLOR_BGR2GRAY)
	# resr = cv2.cvtColor(resr, cv2.COLOR_BGR2GRAY)

	# stereo = cv2.StereoBM_create(numDisparities=16, blockSize=15)
	# disparity = stereo.compute(resl,resr)
	# cv2.imshow('disparity',disparity)
	# plt.imshow(disparity,'gray')
	# plt.show()

	if cv2.waitKey(1) & 0xFF == ord('q'):
		break

cv2.destroyAllWindows()