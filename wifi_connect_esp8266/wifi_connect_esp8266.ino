#define DEBUG_ESP_HTTP_CLIENT
#define DEBUG_ESP_PORT Serial

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// GT config
const char* ssid     = "GTother";
const char* password = "GeorgeP@1927";
// Home WIFI
//const char* ssid     = "ATT9Gz6Unk";
//const char* password = "75h5286hc3fu";

const char host[] = "chi01.xuleijr.com";
const char path[] = "/api/suggest";
const uint16_t port = 8080;
const char *header_keys[] = {
  "User-Agent", "Set-Cookie", "Cookie", "Date", "Content-Type", "Content-Length"
};
size_t header_cnt = sizeof(header_keys) / sizeof(char*);
HTTPClient http;

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
    double ca = root["clough"]["ahead"];
    Serial.printf("%lf minutes ahead of TSRB till Clough\n", ca);
  } else {
    iwconfig();
    // TODO use led or dot start to indicate network failure. 
  }
  http.end();
}

void iwconfig() {
  Serial.printf("IP address: %s\n", WiFi.localIP().toString().c_str());

  //print mac address
  WiFi.macAddress(mac);
  for(int i = 0; i < 6; i++) {
    Serial.printf(0 == i? "MAC: %X" : ":%X", mac[i]);
  }
}
