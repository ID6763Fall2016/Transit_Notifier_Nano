EESchema Schematic File Version 2
LIBS:power
LIBS:device
LIBS:transistors
LIBS:conn
LIBS:linear
LIBS:regul
LIBS:74xx
LIBS:cmos4000
LIBS:adc-dac
LIBS:memory
LIBS:xilinx
LIBS:microcontrollers
LIBS:dsp
LIBS:microchip
LIBS:analog_switches
LIBS:motorola
LIBS:texas
LIBS:intel
LIBS:audio
LIBS:interface
LIBS:digital-audio
LIBS:philips
LIBS:display
LIBS:cypress
LIBS:siliconi
LIBS:opto
LIBS:atmel
LIBS:contrib
LIBS:valves
LIBS:ESP8266
LIBS:TNN-cache
EELAYER 25 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 1 1
Title ""
Date ""
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L CONN_01X10 P1
U 1 1 5808F590
P 1350 1450
F 0 "P1" H 1350 2000 50  0000 C CNN
F 1 "CONN_01X10" V 1450 1450 50  0000 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x10" H 1350 1450 50  0000 C CNN
F 3 "" H 1350 1450 50  0000 C CNN
	1    1350 1450
	1    0    0    -1  
$EndComp
$Comp
L CONN_01X10 P3
U 1 1 5808FADF
P 2050 1450
F 0 "P3" H 2050 2000 50  0000 C CNN
F 1 "CONN_01X10" V 2150 1450 50  0000 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x10" H 2050 1450 50  0000 C CNN
F 3 "" H 2050 1450 50  0000 C CNN
	1    2050 1450
	-1   0    0    1   
$EndComp
Text GLabel 2250 1300 2    60   Input ~ 0
4-CLOCK
Text GLabel 2250 1200 2    60   Input ~ 0
5-DATA
$Comp
L R R1
U 1 1 5808FF31
P 3200 2750
F 0 "R1" V 3280 2750 50  0000 C CNN
F 1 "10K" V 3200 2750 50  0000 C CNN
F 2 "Resistors_SMD:R_0805" V 3130 2750 50  0000 C CNN
F 3 "" H 3200 2750 50  0000 C CNN
	1    3200 2750
	1    0    0    -1  
$EndComp
Text GLabel 2250 1700 2    60   Input ~ 0
VCC
Text GLabel 3650 1850 2    60   Input ~ 0
15
$Comp
L GND #PWR01
U 1 1 5808FC4B
P 1150 1900
F 0 "#PWR01" H 1150 1650 50  0001 C CNN
F 1 "GND" H 1150 1750 50  0000 C CNN
F 2 "" H 1150 1900 50  0000 C CNN
F 3 "" H 1150 1900 50  0000 C CNN
	1    1150 1900
	1    0    0    -1  
$EndComp
Text GLabel 2250 1600 2    60   Input ~ 0
15
Text GLabel 3200 750  1    60   Input ~ 0
VCC
$Comp
L CONN_01X04 P4
U 1 1 580905C2
P 4450 1000
F 0 "P4" H 4450 1250 50  0000 C CNN
F 1 "CONN_01X04" V 4550 1000 50  0000 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x04" H 4450 1000 50  0000 C CNN
F 3 "" H 4450 1000 50  0000 C CNN
	1    4450 1000
	-1   0    0    1   
$EndComp
$Comp
L GND #PWR02
U 1 1 58090796
P 4650 1150
F 0 "#PWR02" H 4650 900 50  0001 C CNN
F 1 "GND" H 4650 1000 50  0000 C CNN
F 2 "" H 4650 1150 50  0000 C CNN
F 3 "" H 4650 1150 50  0000 C CNN
	1    4650 1150
	1    0    0    -1  
$EndComp
Text GLabel 4650 950  2    60   Input ~ 0
5-DATA
Text GLabel 4650 1050 2    60   Input ~ 0
4-CLOCK
$Comp
L SPST SW1
U 1 1 58092A93
P 3200 1350
F 0 "SW1" H 3200 1450 50  0000 C CNN
F 1 "SPST" V 3200 1250 50  0000 C CNN
F 2 "Buttons_Switches_SMD:SW_SPST_EVQPE1" H 3200 1350 50  0000 C CNN
F 3 "" H 3200 1350 50  0000 C CNN
	1    3200 1350
	0    -1   -1   0   
$EndComp
Wire Wire Line
	3200 750  3200 850 
NoConn ~ 2250 1000
NoConn ~ 2250 1100
NoConn ~ 2250 1800
NoConn ~ 1150 1800
NoConn ~ 1150 1300
NoConn ~ 1150 1200
NoConn ~ 1150 1100
NoConn ~ 1150 1000
Wire Wire Line
	3200 2900 3200 3000
Text GLabel 4650 850  2    60   Input ~ 0
V+
Text GLabel 1150 1700 0    60   Input ~ 0
V+
NoConn ~ 2250 1400
NoConn ~ 2250 1500
$Comp
L GND #PWR03
U 1 1 580A5F4D
P 3200 3000
F 0 "#PWR03" H 3200 2750 50  0001 C CNN
F 1 "GND" H 3200 2850 50  0000 C CNN
F 2 "" H 3200 3000 50  0000 C CNN
F 3 "" H 3200 3000 50  0000 C CNN
	1    3200 3000
	1    0    0    -1  
$EndComp
Connection ~ 3200 750 
NoConn ~ 1150 1500
NoConn ~ 1150 1600
NoConn ~ 1150 1400
$Comp
L GND #PWR04
U 1 1 5808FBE5
P 2250 1900
F 0 "#PWR04" H 2250 1650 50  0001 C CNN
F 1 "GND" H 2250 1750 50  0000 C CNN
F 2 "" H 2250 1900 50  0000 C CNN
F 3 "" H 2250 1900 50  0000 C CNN
	1    2250 1900
	1    0    0    -1  
$EndComp
Wire Wire Line
	3650 1850 3200 1850
Wire Wire Line
	3200 1850 3200 2600
$EndSCHEMATC
