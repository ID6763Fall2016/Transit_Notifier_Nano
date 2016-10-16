#define DEBUG_ESP_HTTP_CLIENT
#define DEBUG_ESP_PORT Serial

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

//
//const char* ssid     = "GTother";
//const char* password = "GeorgeP@1927";
// Home WIFI
const char* ssid     = "ATT9Gz6Unk";
const char* password = "75h5286hc3fu";

const char* host = "chi01.xuleijr.com";
const uint16_t port = 8080;
const char * header_keys[] = {"User-Agent","Set-Cookie","Cookie","Date","Content-Type","Content-Length"} ;
size_t header_cnt = sizeof(header_keys)/sizeof(char*);
HTTPClient http;
char path[] = "/api/suggest";

byte mac[6];                     // the MAC address of your Wifi shield

void setup() {
  Serial.begin(115200);
  delay(100);

  // We start by connecting to a WiFi network
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  iwconfig();
  
  http.setReuse(true);
  http.collectHeaders(header_keys, header_cnt);
}

void loop() {
  delay(5000);

  Serial.printf("\n\nConnecting to %s\n", host);
  
  // Start http
  http.begin(host, port, path);
  int code = http.GET();
  Serial.printf("Received HTTP code: %d\n", code);
  if(HTTP_CODE_OK == code) {
    StaticJsonBuffer<512> jsonBuffer;
    const String &content = http.getString();
    Serial.println(content);
    JsonObject& root = jsonBuffer.parseObject(content);
    int cn = root["clough"]["ahead"];
    Serial.printf("%d minutes ahead of TSRB till Clough\n", cn);
  } else {
    // TODO use led or dot start to indicate network failure. 
  }
  http.end();
}

void iwconfig() {
  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  //print mac address
  WiFi.macAddress(mac);
  Serial.print("MAC: ");
  Serial.print(mac[0],HEX);
  Serial.print(":");
  Serial.print(mac[1],HEX);
  Serial.print(":");
  Serial.print(mac[2],HEX);
  Serial.print(":");
  Serial.print(mac[3],HEX);
  Serial.print(":");
  Serial.print(mac[4],HEX);
  Serial.print(":");
  Serial.println(mac[5],HEX);
}
