const five = require("johnny-five");
const board = new five.Board({ repl: false, debug: true });

board.on("ready", () => {
    console.log("ready");
  const imu = new five.IMU({
    controller: "MPU6050",
    // address: 0x68,
    freq: 10
  });
  let acceleration;
  imu.on("change", () => {
    acceleration = imu.accelerometer.acceleration;
    // if(acceleration < 0.8){
        console.log("  acceleration : ", acceleration);
    // }
    // console.log("Thermometer");
    // console.log("  celsius      : ", imu.thermometer.celsius);
    // console.log("  fahrenheit   : ", imu.thermometer.fahrenheit);
    // console.log("  kelvin       : ", imu.thermometer.kelvin);
    // console.log("--------------------------------------");

    // console.log("Accelerometer");
    // console.log("  x            : ", imu.accelerometer.x);
    // console.log("  y            : ", imu.accelerometer.y);
    // console.log("  z            : ", imu.accelerometer.z);
    // console.log("  pitch        : ", imu.accelerometer.pitch);
    // console.log("  roll         : ", imu.accelerometer.roll);
    // console.log("  acceleration : ", imu.accelerometer.acceleration);
    // console.log("  inclination  : ", imu.accelerometer.inclination);
    // console.log("  orientation  : ", imu.accelerometer.orientation);
    // console.log("--------------------------------------");

    // console.log("Gyroscope");
    // console.log("  x            : ", imu.gyro.x);
    // console.log("  y            : ", imu.gyro.y);
    // console.log("  z            : ", imu.gyro.z);
    // console.log("  pitch        : ", imu.gyro.pitch);
    // console.log("  roll         : ", imu.gyro.roll);
    // console.log("  yaw          : ", imu.gyro.yaw);
    // console.log("  rate         : ", imu.gyro.rate);
    // console.log("  isCalibrated : ", imu.gyro.isCalibrated);
    // console.log("--------------------------------------");
  });

  board.loop(40, ()=> {
    // if(acceleration < 0.8){
    //     console.log("  acceleration : ", acceleration);
    // }
  });

});