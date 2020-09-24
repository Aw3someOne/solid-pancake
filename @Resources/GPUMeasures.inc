[Section]
@includeHWiNFO=#@#/HWiNFO.inc

; Measures
[iGPUClock]
Measure=Plugin
Plugin=HWiNFO.dll
HWiNFOSensorId=#iGPUClockSensorID#
HWiNFOSensorInstance=#iGPUClockInstance#
HWiNFOEntryId=#iGPUClockEntryID#
HWiNFOType=CurrentValue
MinValue=0
MaxValue=100

[iGPUCoreLoad]
Measure=Plugin
Plugin=HWiNFO.dll
HWiNFOSensorId=#iGPUCoreLoadSensorID#
HWiNFOSensorInstance=#iGPUCoreLoadInstance#
HWiNFOEntryId=#iGPUCoreLoadEntryID#
HWiNFOType=CurrentValue
MinValue=0
MaxValue=100

[iGPUTemperature]
Measure=Plugin
Plugin=HWiNFO.dll
HWiNFOSensorId=#iGPUTemperatureSensorID#
HWiNFOSensorInstance=#iGPUTemperatureInstance#
HWiNFOEntryId=#iGPUTemperatureEntryID#
HWiNFOType=CurrentValue
MinValue=0
MaxValue=100

[GPU1Clock]
Measure=Plugin
Plugin=HWiNFO.dll
HWiNFOSensorId=#GPU1ClockSensorID#
HWiNFOSensorInstance=#GPU1ClockInstance#
HWiNFOEntryId=#GPU1ClockEntryID#
HWiNFOType=CurrentValue
MinValue=0
MaxValue=100

[GPU1CoreLoad]
Measure=Plugin
Plugin=HWiNFO.dll
HWiNFOSensorId=#GPU1CoreLoadSensorID#
HWiNFOSensorInstance=#GPU1CoreLoadInstance#
HWiNFOEntryId=#GPU1CoreLoadEntryID#
HWiNFOType=CurrentValue
MinValue=0
MaxValue=100

[GPU1Temperature]
Measure=Plugin
Plugin=HWiNFO.dll
HWiNFOSensorId=#GPU1TemperatureSensorID#
HWiNFOSensorInstance=#GPU1TemperatureInstance#
HWiNFOEntryId=#GPU1TemperatureEntryID#
HWiNFOType=CurrentValue
MinValue=0
MaxValue=100
