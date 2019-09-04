import cv2
import numpy as np
import datetime
from threading import Thread
import subprocess
import time

class WebcamVideoStream:
    def __init__(self, src, width, height, sleep=0.0):
        self.stream = cv2.VideoCapture(src)
        self.stream.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        self.stream.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        # self.stream.set(cv2.CAP_PROP_EXPOSURE, 0)
        # self.stream.set(cv2.CAP_PROP_BRIGHTNESS, 90)
        # print(self.stream.get(cv2.CAP_PROP_EXPOSURE))
        self.width = width
        self.height = height
        self.sleep = sleep
        # command ="v4l2-ctl -d 0 -c auto_exposure=1 -c exposure_time_absolute=100"
        # op = subprocess.call(command, shell=True)

        (self.grabbed, self.frame) = self.stream.read()
        # self.frame = cv2.resize(frame, (self.width, self.height))
        
        self.stopped = False

    def start(self):
        Thread(target=self.update, args=()).start()
        return self

    def update(self):
        while True:
            if self.stopped:
                return

            (self.grabbed, self.frame) = self.stream.read()
            # self.frame = cv2.resize(frame, (self.width, self.height))

            if self.sleep > 0:
                time.sleep(self.sleep)

    def read(self):
        return self.frame

    def stop(self):
        self.stopped = True

class ImageUtils:
    def pptf(img, pts):
        rect = np.zeros((4, 2), dtype = "float32")

        s = pts.sum(axis = 1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]

        diff = np.diff(pts, axis = 1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]

        (tl, tr, br, bl) = rect

        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))

        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))

        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]], dtype = "float32")
     
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(img, M, (maxWidth, maxHeight))

        return warped
        
# usb-046d_Logitech_Webcam_C930e_48FBF67E-video-index0
# usb-046d_Logitech_Webcam_C930e_FA2CF67E-video-index0
#C930e@14200000
#C930e@14100000
# class CheckCam:
#     def __init__(self, name):
#         osname = platform.system()
#         command = "ls -l /dev/v4l/by-id"

#         if osname == 'Darwin':
#             command = "ioreg -p IOUSB | grep 'Logitech Webcam'"

#         cams = subprocess.check_output(command, stderr=subprocess.STDOUT, shell=True)
#         self.output = -1
#         loop = 0

#         for line in cams.splitlines():
#             l = str(line.decode('UTF-8'))
#             i = l.find(name)
#             loop = loop + 1

#             if i > -1:
#                 if osname == 'Darwin':
#                     self.output = loop
#                 else:
#                     self.output = int(l[len(l)-1:len(l)])

#     def get(self):
#         return self.output if self.output != 1 else self.output-1
