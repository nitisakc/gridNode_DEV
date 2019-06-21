import math
#Y = y - hh
#X = x - hw
# degree = math.atan2(-112, 60)  #Y, X
# degree = math.degrees(degree)

degrees = 352.06 - 90
length = 663.5

# print(math.sin(49))
# print(12 * math.sin(90-41))
print(int(length * math.sin(math.radians(degrees)))) #y
print(int(length * math.cos(math.radians(degrees)))) #x

