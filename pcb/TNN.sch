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
CLOCK
Text GLabel 2250 1200 2    60   Input ~ 0
DATA
$Comp
L R R1
U 1 1 5808FF31
P 3200 2050
F 0 "R1" V 3280 2050 50  0000 C CNN
F 1 "10K" V 3200 2050 50  0000 C CNN
F 2 "Resistors_SMD:R_0805" V 3130 2050 50  0000 C CNN
F 3 "" H 3200 2050 50  0000 C CNN
	1    3200 2050
	1    0    0    -1  
$EndComp
Text GLabel 2250 1700 2    60   Input ~ 0
VCC
Text GLabel 3200 750  1    60   Input ~ 0
15
$Comp
L GND #PWR01
U 1 1 5808FBE5
P 2250 1900
F 0 "#PWR01" H 2250 1650 50  0001 C CNN
F 1 "GND" H 2250 1750 50  0000 C CNN
F 2 "" H 2250 1900 50  0000 C CNN
F 3 "" H 2250 1900 50  0000 C CNN
	1    2250 1900
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR02
U 1 1 5808FC4B
P 1150 1900
F 0 "#PWR02" H 1150 1650 50  0001 C CNN
F 1 "GND" H 1150 1750 50  0000 C CNN
F 2 "" H 1150 1900 50  0000 C CNN
F 3 "" H 1150 1900 50  0000 C CNN
	1    1150 1900
	1    0    0    -1  
$EndComp
Text GLabel 2250 1600 2    60   Input ~ 0
15
Text GLabel 3200 2300 3    60   Input ~ 0
VCC
$Comp
L CONN_01X04 P4
U 1 1 580905C2
P 4050 1750
F 0 "P4" H 4050 2000 50  0000 C CNN
F 1 "CONN_01X04" V 4150 1750 50  0000 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x04" H 4050 1750 50  0000 C CNN
F 3 "" H 4050 1750 50  0000 C CNN
	1    4050 1750
	-1   0    0    1   
$EndComp
$Comp
L GND #PWR05
U 1 1 58090796
P 4250 1900
F 0 "#PWR05" H 4250 1650 50  0001 C CNN
F 1 "GND" H 4250 1750 50  0000 C CNN
F 2 "" H 4250 1900 50  0000 C CNN
F 3 "" H 4250 1900 50  0000 C CNN
	1    4250 1900
	1    0    0    -1  
$EndComp
Text GLabel 4250 1700 2    60   Input ~ 0
DATA
Text GLabel 4250 1800 2    60   Input ~ 0
CLOCK
$Comp
L CONN_01X04 P2
U 1 1 580908DE
P 4050 900
F 0 "P2" H 4050 1150 50  0000 C CNN
F 1 "CONN_01X04" V 4150 900 50  0000 C CNN
F 2 "Pin_Headers:Pin_Header_Straight_1x04" H 4050 900 50  0000 C CNN
F 3 "" H 4050 900 50  0000 C CNN
	1    4050 900 
	-1   0    0    1   
$EndComp
Text GLabel 2250 1500 2    60   Input ~ 0
CD
Text GLabel 2250 1400 2    60   Input ~ 0
CC
Text GLabel 4250 950  2    60   Input ~ 0
CC
Text GLabel 4250 850  2    60   Input ~ 0
CD
$Comp
L GND #PWR07
U 1 1 58090B86
P 4250 1050
F 0 "#PWR07" H 4250 800 50  0001 C CNN
F 1 "GND" H 4250 900 50  0000 C CNN
F 2 "" H 4250 1050 50  0000 C CNN
F 3 "" H 4250 1050 50  0000 C CNN
	1    4250 1050
	1    0    0    -1  
$EndComp
$Comp
L SPST SW1
U 1 1 58092A93
P 3200 1350
F 0 "SW1" H 3200 1450 50  0000 C CNN
F 1 "SPST" H 3200 1250 50  0000 C CNN
F 2 "Buttons_Switches_SMD:SW_SPST_EVQPE1" H 3200 1350 50  0000 C CNN
F 3 "" H 3200 1350 50  0000 C CNN
	1    3200 1350
	0    1    1    0   
$EndComp
Wire Wire Line
	3200 1900 3200 1850
Wire Wire Line
	3200 750  3200 850 
NoConn ~ 2250 1000
NoConn ~ 2250 1100
NoConn ~ 2250 1800
NoConn ~ 1150 1800
NoConn ~ 1150 1600
NoConn ~ 1150 1400
NoConn ~ 1150 1300
NoConn ~ 1150 1200
NoConn ~ 1150 1100
NoConn ~ 1150 1000
NoConn ~ 1150 1500
Wire Wire Line
	3200 2200 3200 2300
Text GLabel 4250 1600 2    60   Input ~ 0
V+
Text GLabel 4250 750  2    60   Input ~ 0
V+
Text GLabel 1150 1700 0    60   Input ~ 0
V+
$EndSCHEMATC
